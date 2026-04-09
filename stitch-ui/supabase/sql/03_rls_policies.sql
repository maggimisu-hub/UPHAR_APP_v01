alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.admin_action_logs enable row level security;
alter table public.addresses enable row level security;
alter table public.payments enable row level security;
alter table public.collections enable row level security;
alter table public.product_collections enable row level security;
alter table public.hero_content enable row level security;

alter table public.users force row level security;
alter table public.products force row level security;
alter table public.product_variants force row level security;
alter table public.product_images force row level security;
alter table public.inventory force row level security;
alter table public.orders force row level security;
alter table public.order_items force row level security;
alter table public.shipments force row level security;
alter table public.admin_action_logs force row level security;
alter table public.addresses force row level security;
alter table public.payments force row level security;
alter table public.collections force row level security;
alter table public.product_collections force row level security;
alter table public.hero_content force row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin"
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "users_admin_update" on public.users;
create policy "users_admin_update"
on public.users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_admin_insert" on public.users;
create policy "users_admin_insert"
on public.users
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "users_admin_delete" on public.users;
create policy "users_admin_delete"
on public.users
for delete
to authenticated
using (public.is_admin());

drop policy if exists "products_public_select_active" on public.products;
create policy "products_public_select_active"
on public.products
for select
to public
using (is_active = true or public.is_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "variants_public_select" on public.product_variants;
create policy "variants_public_select"
on public.product_variants
for select
to public
using (
  exists (
    select 1
    from public.products p
    where p.id = product_id
      and (p.is_active = true or public.is_admin())
  )
);

drop policy if exists "variants_admin_insert" on public.product_variants;
create policy "variants_admin_insert"
on public.product_variants
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "variants_admin_update" on public.product_variants;
create policy "variants_admin_update"
on public.product_variants
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "variants_admin_delete" on public.product_variants;
create policy "variants_admin_delete"
on public.product_variants
for delete
to authenticated
using (public.is_admin());

drop policy if exists "images_public_select" on public.product_images;
create policy "images_public_select"
on public.product_images
for select
to public
using (
  exists (
    select 1
    from public.products p
    where p.id = product_id
      and (p.is_active = true or public.is_admin())
  )
);

drop policy if exists "images_admin_insert" on public.product_images;
create policy "images_admin_insert"
on public.product_images
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "images_admin_update" on public.product_images;
create policy "images_admin_update"
on public.product_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "images_admin_delete" on public.product_images;
create policy "images_admin_delete"
on public.product_images
for delete
to authenticated
using (public.is_admin());

drop policy if exists "inventory_admin_select" on public.inventory;
create policy "inventory_admin_select"
on public.inventory
for select
to authenticated
using (public.is_admin());

drop policy if exists "inventory_public_select_active_products" on public.inventory;
create policy "inventory_public_select_active_products"
on public.inventory
for select
to public
using (
  exists (
    select 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = variant_id
      and (p.is_active = true or public.is_admin())
  )
);

drop policy if exists "inventory_admin_insert" on public.inventory;
create policy "inventory_admin_insert"
on public.inventory
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "inventory_admin_update" on public.inventory;
create policy "inventory_admin_update"
on public.inventory
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "inventory_admin_delete" on public.inventory;
create policy "inventory_admin_delete"
on public.inventory
for delete
to authenticated
using (public.is_admin());

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_customer_insert_own" on public.orders;
create policy "orders_customer_insert_own"
on public.orders
for insert
to authenticated
with check (
  ((user_id = auth.uid()) and public.is_current_user_blocked() = false)
  or public.is_admin()
);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
on public.order_items
for select
to authenticated
using (public.is_admin() or public.owns_order(order_id));

drop policy if exists "order_items_insert_own_or_admin" on public.order_items;
create policy "order_items_insert_own_or_admin"
on public.order_items
for insert
to authenticated
with check (public.is_admin() or public.owns_order(order_id));

drop policy if exists "order_items_admin_update" on public.order_items;
create policy "order_items_admin_update"
on public.order_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_admin_delete" on public.order_items;
create policy "order_items_admin_delete"
on public.order_items
for delete
to authenticated
using (public.is_admin());

drop policy if exists "shipments_select_own_or_admin" on public.shipments;
create policy "shipments_select_own_or_admin"
on public.shipments
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "shipments_admin_insert" on public.shipments;
create policy "shipments_admin_insert"
on public.shipments
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "shipments_admin_update" on public.shipments;
create policy "shipments_admin_update"
on public.shipments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "shipments_admin_delete" on public.shipments;
create policy "shipments_admin_delete"
on public.shipments
for delete
to authenticated
using (public.is_admin());

drop policy if exists "admin_logs_admin_select" on public.admin_action_logs;
create policy "admin_logs_admin_select"
on public.admin_action_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists "admin_logs_admin_insert" on public.admin_action_logs;
create policy "admin_logs_admin_insert"
on public.admin_action_logs
for insert
to authenticated
with check (public.is_admin() and admin_id = auth.uid());

drop policy if exists "admin_logs_admin_update" on public.admin_action_logs;
create policy "admin_logs_admin_update"
on public.admin_action_logs
for update
to authenticated
using (false)
with check (false);

drop policy if exists "admin_logs_admin_delete" on public.admin_action_logs;
create policy "admin_logs_admin_delete"
on public.admin_action_logs
for delete
to authenticated
using (false);

drop policy if exists "addresses_select_own_or_admin" on public.addresses;
create policy "addresses_select_own_or_admin"
on public.addresses
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "addresses_insert_own_or_admin" on public.addresses;
create policy "addresses_insert_own_or_admin"
on public.addresses
for insert
to authenticated
with check (
  (user_id = auth.uid() and public.is_current_user_blocked() = false)
  or public.is_admin()
);

drop policy if exists "addresses_update_own_or_admin" on public.addresses;
create policy "addresses_update_own_or_admin"
on public.addresses
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "addresses_delete_own_or_admin" on public.addresses;
create policy "addresses_delete_own_or_admin"
on public.addresses
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin"
on public.payments
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "payments_admin_insert" on public.payments;
create policy "payments_admin_insert"
on public.payments
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "payments_admin_update" on public.payments;
create policy "payments_admin_update"
on public.payments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "payments_admin_delete" on public.payments;
create policy "payments_admin_delete"
on public.payments
for delete
to authenticated
using (public.is_admin());

drop policy if exists "collections_public_select_active" on public.collections;
create policy "collections_public_select_active"
on public.collections
for select
to public
using (is_active = true or public.is_admin());

drop policy if exists "collections_admin_insert" on public.collections;
create policy "collections_admin_insert"
on public.collections
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "collections_admin_update" on public.collections;
create policy "collections_admin_update"
on public.collections
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "collections_admin_delete" on public.collections;
create policy "collections_admin_delete"
on public.collections
for delete
to authenticated
using (public.is_admin());

drop policy if exists "product_collections_public_select" on public.product_collections;
create policy "product_collections_public_select"
on public.product_collections
for select
to public
using (
  exists (
    select 1
    from public.products p
    join public.collections c on c.id = collection_id
    where p.id = product_id
      and c.id = collection_id
      and ((p.is_active = true and c.is_active = true) or public.is_admin())
  )
);

drop policy if exists "product_collections_admin_insert" on public.product_collections;
create policy "product_collections_admin_insert"
on public.product_collections
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "product_collections_admin_update" on public.product_collections;
create policy "product_collections_admin_update"
on public.product_collections
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "product_collections_admin_delete" on public.product_collections;
create policy "product_collections_admin_delete"
on public.product_collections
for delete
to authenticated
using (public.is_admin());

drop policy if exists "hero_content_public_select_active" on public.hero_content;
create policy "hero_content_public_select_active"
on public.hero_content
for select
to public
using (is_active = true or public.is_admin());

drop policy if exists "hero_content_admin_insert" on public.hero_content;
create policy "hero_content_admin_insert"
on public.hero_content
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "hero_content_admin_update" on public.hero_content;
create policy "hero_content_admin_update"
on public.hero_content
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "hero_content_admin_delete" on public.hero_content;
create policy "hero_content_admin_delete"
on public.hero_content
for delete
to authenticated
using (public.is_admin());
