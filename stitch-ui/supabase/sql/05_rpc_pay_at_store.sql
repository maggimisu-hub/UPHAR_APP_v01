create or replace function public.mark_order_ready(
  p_order_id uuid
)
returns table (
  order_id uuid,
  status text,
  payment_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_payment_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_admin() then
    raise exception 'Only admin can mark order ready';
  end if;

  select o.status, o.payment_status
  into v_status, v_payment_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_status = 'ready' then
    return query
    select o.id, o.status, o.payment_status
    from public.orders o
    where o.id = p_order_id;
    return;
  end if;

  if v_status <> 'pending' then
    raise exception 'Only pending orders can be marked ready';
  end if;

  if v_payment_status <> 'cod' then
    raise exception 'Only pay-at-store orders can be marked ready in this flow';
  end if;

  update public.orders
  set status = 'ready'
  where id = p_order_id;

  return query
  select o.id, o.status, o.payment_status
  from public.orders o
  where o.id = p_order_id;
end;
$$;

revoke all on function public.mark_order_ready(uuid) from public;
grant execute on function public.mark_order_ready(uuid) to authenticated;

create or replace function public.mark_order_cancelled(
  p_order_id uuid
)
returns table (
  order_id uuid,
  status text,
  payment_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_payment_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_admin() then
    raise exception 'Only admin can cancel orders';
  end if;

  select o.status, o.payment_status
  into v_status, v_payment_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_status = 'cancelled' then
    return query
    select o.id, o.status, o.payment_status
    from public.orders o
    where o.id = p_order_id;
    return;
  end if;

  if v_status not in ('pending', 'ready') then
    raise exception 'Only pending or ready orders can be cancelled';
  end if;

  if v_payment_status = 'paid' then
    raise exception 'Paid orders cannot be cancelled with this v1 flow';
  end if;

  update public.orders
  set
    status = 'cancelled',
    payment_status = 'failed'
  where id = p_order_id;

  update public.payments
  set status = 'failed'
  where id = (
    select p.id
    from public.payments p
    where p.order_id = p_order_id
      and p.status = 'pending'
    order by p.created_at desc
    limit 1
  );

  return query
  select o.id, o.status, o.payment_status
  from public.orders o
  where o.id = p_order_id;
end;
$$;

revoke all on function public.mark_order_cancelled(uuid) from public;
grant execute on function public.mark_order_cancelled(uuid) to authenticated;

create or replace function public.mark_order_paid_and_delivered(
  p_order_id uuid,
  p_transaction_id text default null
)
returns table (
  order_id uuid,
  status text,
  payment_status text,
  payment_record_status text,
  transaction_id text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_payment_status text;
  v_payment_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_admin() then
    raise exception 'Only admin can complete pay-at-store orders';
  end if;

  select o.status, o.payment_status
  into v_status, v_payment_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_status = 'delivered' and v_payment_status = 'paid' then
    return query
    select
      o.id,
      o.status,
      o.payment_status,
      p.status,
      p.transaction_id
    from public.orders o
    left join lateral (
      select p1.status, p1.transaction_id
      from public.payments p1
      where p1.order_id = o.id
      order by p1.created_at desc
      limit 1
    ) p on true
    where o.id = p_order_id;
    return;
  end if;

  if v_status <> 'ready' then
    raise exception 'Only ready orders can be marked paid and delivered';
  end if;

  if v_payment_status <> 'cod' then
    raise exception 'Only pay-at-store orders can be marked paid and delivered';
  end if;

  select p.id
  into v_payment_id
  from public.payments p
  where p.order_id = p_order_id
    and p.status = 'pending'
  order by p.created_at desc
  limit 1
  for update;

  if v_payment_id is null then
    raise exception 'No pending payment record found for this order';
  end if;

  update public.payments as p
  set
    status = 'success',
    transaction_id = coalesce(nullif(trim(p_transaction_id), ''), p.transaction_id)
  where p.id = v_payment_id;

  update public.orders
  set
    status = 'delivered',
    payment_status = 'paid'
  where id = p_order_id;

  return query
  select
    o.id,
    o.status,
    o.payment_status,
    p.status,
    p.transaction_id
  from public.orders o
  join public.payments p on p.id = v_payment_id
  where o.id = p_order_id;
end;
$$;

revoke all on function public.mark_order_paid_and_delivered(uuid, text) from public;
grant execute on function public.mark_order_paid_and_delivered(uuid, text) to authenticated;
