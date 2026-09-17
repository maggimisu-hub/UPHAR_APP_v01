-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 12: Restrict confirm_payment to Admin / Service Role
-- 
-- In the current Pay-At-Store (COD) model, online payments are disabled.
-- Customers must NOT be permitted to self-confirm orders as paid.
-- 
-- This migration updates public.confirm_payment to require is_admin(),
-- revokes EXECUTE from authenticated users, and preserves execution for
-- admin and service_role (for future payment webhook integrations).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.confirm_payment(p_payload jsonb)
returns table (
  order_id uuid,
  order_status text,
  payment_status text,
  payment_record_status text,
  transaction_id text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_order_id uuid := (p_payload ->> 'order_id')::uuid;
  v_payment_result text := lower(trim(p_payload ->> 'payment_status'));
  v_transaction_id text := nullif(trim(p_payload ->> 'transaction_id'), '');
  v_is_admin boolean;
  v_payment_id uuid;
  v_new_order_status text;
  v_new_order_payment_status text;
  v_new_payment_status text;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Strictly restrict payment confirmation to administrators or service_role
  select public.is_admin() into v_is_admin;
  if not v_is_admin then
    raise exception 'Access denied: Only administrators may confirm payments directly';
  end if;

  if v_order_id is null then
    raise exception 'order_id is required';
  end if;

  if v_payment_result not in ('success', 'failed') then
    raise exception 'payment_status must be success or failed';
  end if;

  if not exists (select 1 from public.orders where id = v_order_id) then
    raise exception 'Order not found';
  end if;

  select p.id
  into v_payment_id
  from public.payments p
  where p.order_id = v_order_id
    and p.status = 'pending'
  order by p.created_at desc
  limit 1
  for update;

  if v_payment_id is null then
    raise exception 'No pending payment record found for this order';
  end if;

  if v_payment_result = 'success' then
    v_new_payment_status := 'success';
    v_new_order_payment_status := 'paid';
    v_new_order_status := 'confirmed';
  else
    v_new_payment_status := 'failed';
    v_new_order_payment_status := 'failed';
    v_new_order_status := 'pending';
  end if;

  update public.payments
  set
    status = v_new_payment_status,
    transaction_id = coalesce(v_transaction_id, transaction_id)
  where id = v_payment_id;

  update public.orders
  set
    payment_status = v_new_order_payment_status,
    status = v_new_order_status
  where id = v_order_id;

  return query
  select
    o.id,
    o.status,
    o.payment_status,
    p.status,
    p.transaction_id
  from public.orders o
  join public.payments p on p.id = v_payment_id
  where o.id = v_order_id;
end;
$$;

-- Revoke execution from regular authenticated users (customers)
revoke all on function public.confirm_payment(jsonb) from public;
revoke execute on function public.confirm_payment(jsonb) from authenticated;

-- Grant execution only to service_role and postgres
grant execute on function public.confirm_payment(jsonb) to service_role;
