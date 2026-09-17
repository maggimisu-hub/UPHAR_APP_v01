-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 14: Inventory Concurrency — Row-Level Locking on Stock Check
-- 
-- MIGRATION APPLICATION NOT PERFORMED - REQUIRES HUMAN APPROVAL AND MANUAL EXECUTION
-- DO NOT EXECUTE AUTOMATICALLY AGAINST PRODUCTION SUPABASE
--
-- Problem:
-- create_order_with_items uses a SELECT to check inventory stock, then a
-- separate UPDATE to decrement it. Without row-level locking, two concurrent
-- transactions can both read the same stock value, both pass validation, and
-- then both attempt to decrement. The CHECK(stock >= 0) constraint on
-- public.inventory catches the violation and aborts the second transaction,
-- but with an unfriendly raw constraint error rather than a clean stock
-- insufficient message.
--
-- Fix:
-- Add SELECT ... FOR UPDATE on inventory rows during the stock validation
-- phase. This acquires exclusive row locks that serialize concurrent
-- checkouts competing for the same variants. The second transaction blocks
-- until the first commits, then re-reads the updated stock and correctly
-- raises 'Insufficient stock' if appropriate.
--
-- The existing CHECK(stock >= 0) constraint on public.inventory remains as
-- a final safety net.
--
-- Scope:
-- - Replaces create_order_with_items to add FOR UPDATE locking.
-- - Preserves ALL existing behavior: auth checks, idempotency (migration 13),
--   item validation, pricing authority, order/payment creation.
-- - No schema changes (no new columns, tables, or indexes).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.create_order_with_items(p_payload jsonb)
returns table (
  order_id uuid,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_user_id uuid := (p_payload ->> 'user_id')::uuid;
  v_address_id uuid := (p_payload ->> 'address_id')::uuid;
  v_payment_method text := lower(trim(p_payload ->> 'payment_method'));
  v_idempotency_key text := nullif(trim(p_payload ->> 'idempotency_key'), '');
  v_order_id uuid;
  v_total numeric(12,2);
  v_input_count integer;
  v_resolved_count integer;
  v_blocked boolean;
begin
  -- ── Auth checks ──
  if v_auth_user_id is null then
    raise exception 'Authentication required';
  end if;

  if v_user_id is null then
    raise exception 'user_id is required';
  end if;

  if v_auth_user_id <> v_user_id then
    raise exception 'You can only create orders for yourself';
  end if;

  -- ── Check Idempotency First (Pre-flight check) ──
  if v_idempotency_key is not null then
    select o.id, o.total_amount
    into v_order_id, v_total
    from public.orders o
    where o.user_id = v_user_id
      and o.idempotency_key = v_idempotency_key;

    if found then
      return query select v_order_id, v_total;
      return;
    end if;
  end if;

  if v_address_id is null then
    raise exception 'address_id is required';
  end if;

  if v_payment_method not in ('razorpay', 'cod') then
    raise exception 'payment_method must be razorpay or cod';
  end if;

  if not (p_payload ? 'items') then
    raise exception 'items is required';
  end if;

  if jsonb_typeof(p_payload -> 'items') <> 'array' then
    raise exception 'items must be an array';
  end if;

  if jsonb_array_length(p_payload -> 'items') = 0 then
    raise exception 'items cannot be empty';
  end if;

  -- ── User check ──
  select u.is_blocked
  into v_blocked
  from public.users u
  where u.id = v_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  if v_blocked then
    raise exception 'Blocked users cannot place orders';
  end if;

  -- ── Address ownership ──
  perform 1
  from public.addresses a
  where a.id = v_address_id
    and a.user_id = v_user_id;

  if not found then
    raise exception 'Address does not belong to user';
  end if;

  -- ── Validate raw items from payload ──
  if exists (
    select 1
    from jsonb_to_recordset(p_payload -> 'items') as x(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    where x.product_id is null
       or x.variant_id is null
       or x.quantity is null
       or x.quantity <= 0
  ) then
    raise exception 'Each item must contain valid product_id, variant_id, and quantity > 0';
  end if;

  -- ── Aggregate duplicate variant rows ──
  select count(*)
  into v_input_count
  from (
    select x.product_id, x.variant_id
    from jsonb_to_recordset(p_payload -> 'items') as x(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    group by x.product_id, x.variant_id
  ) agg;

  -- ── Resolve items against DB (price + stock) ──
  select count(*)
  into v_resolved_count
  from (
    select ci.product_id, ci.variant_id
    from (
      select x.product_id, x.variant_id, sum(x.quantity)::integer as quantity
      from jsonb_to_recordset(p_payload -> 'items') as x(
        product_id uuid,
        variant_id uuid,
        quantity integer
      )
      group by x.product_id, x.variant_id
    ) ci
    join public.products p
      on p.id = ci.product_id and p.is_active = true
    join public.product_variants pv
      on pv.id = ci.variant_id and pv.product_id = ci.product_id
    join public.inventory inv
      on inv.variant_id = ci.variant_id
  ) resolved;

  if v_resolved_count <> v_input_count then
    raise exception 'One or more items are invalid, inactive, or missing inventory';
  end if;

  -- ── Stock check WITH row-level locking ──
  -- Acquire FOR UPDATE locks on inventory rows for requested variants.
  -- This serializes concurrent checkouts competing for the same inventory,
  -- preventing the TOCTOU race where two transactions both read sufficient
  -- stock and then both attempt to decrement it.
  -- The CHECK(stock >= 0) constraint on public.inventory remains as a
  -- final safety net.
  if exists (
    select 1
    from (
      select x.variant_id, sum(x.quantity)::integer as quantity
      from jsonb_to_recordset(p_payload -> 'items') as x(
        product_id uuid,
        variant_id uuid,
        quantity integer
      )
      group by x.variant_id
    ) ci
    join public.inventory inv on inv.variant_id = ci.variant_id
    where inv.stock < ci.quantity
    for update of inv
  ) then
    raise exception 'Insufficient stock for one or more variants';
  end if;

  -- ── Calculate total ──
  select coalesce(sum(ci.quantity * pv.price), 0)::numeric(12,2)
  into v_total
  from (
    select x.product_id, x.variant_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(p_payload -> 'items') as x(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    group by x.product_id, x.variant_id
  ) ci
  join public.product_variants pv
    on pv.id = ci.variant_id and pv.product_id = ci.product_id;

  -- ── Create order (with idempotency race catch) ──
  begin
    insert into public.orders (
      user_id,
      total_amount,
      status,
      payment_status,
      idempotency_key
    )
    values (
      v_user_id,
      v_total,
      'pending',
      case when v_payment_method = 'cod' then 'cod' else 'pending' end,
      v_idempotency_key
    )
    returning id into v_order_id;
  exception
    when unique_violation then
      if v_idempotency_key is not null then
        select o.id, o.total_amount
        into v_order_id, v_total
        from public.orders o
        where o.user_id = v_user_id
          and o.idempotency_key = v_idempotency_key;

        if found then
          return query select v_order_id, v_total;
          return;
        end if;
      end if;
      raise;
  end;

  -- ── Create order items ──
  insert into public.order_items (
    order_id,
    product_id,
    variant_id,
    quantity,
    price
  )
  select
    v_order_id,
    ci.product_id,
    ci.variant_id,
    ci.quantity,
    pv.price
  from (
    select x.product_id, x.variant_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(p_payload -> 'items') as x(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    group by x.product_id, x.variant_id
  ) ci
  join public.product_variants pv
    on pv.id = ci.variant_id and pv.product_id = ci.product_id;

  -- ── Deduct inventory ──
  update public.inventory inv
  set
    stock = inv.stock - ci.quantity,
    updated_at = now()
  from (
    select x.variant_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(p_payload -> 'items') as x(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    group by x.variant_id
  ) ci
  where inv.variant_id = ci.variant_id;

  -- ── Create payment record ──
  insert into public.payments (
    order_id,
    amount,
    status,
    provider,
    transaction_id,
    created_at
  )
  values (
    v_order_id,
    v_total,
    'pending',
    v_payment_method,
    null,
    now()
  );

  return query select v_order_id, v_total;
end;
$$;

revoke all on function public.create_order_with_items(jsonb) from public;
grant execute on function public.create_order_with_items(jsonb) to authenticated;
