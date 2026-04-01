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
  v_order_owner_id uuid;
  v_is_admin boolean;
  v_payment_id uuid;
  v_new_order_status text;
  v_new_order_payment_status text;
  v_new_payment_status text;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication required';
  end if;

  if v_order_id is null then
    raise exception 'order_id is required';
  end if;

  if v_payment_result not in ('success', 'failed') then
    raise exception 'payment_status must be success or failed';
  end if;

  select public.is_admin() into v_is_admin;

  select o.user_id
  into v_order_owner_id
  from public.orders o
  where o.id = v_order_id;

  if not found then
    raise exception 'Order not found';
  end if;

  if not v_is_admin and v_order_owner_id <> v_auth_user_id then
    raise exception 'You do not have access to this order';
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

revoke all on function public.confirm_payment(jsonb) from public;
grant execute on function public.confirm_payment(jsonb) to authenticated;
