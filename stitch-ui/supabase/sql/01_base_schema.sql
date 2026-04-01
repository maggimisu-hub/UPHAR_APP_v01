create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, name)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references public.product_variants(id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'ready', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'cod', 'unpaid')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null check (price >= 0)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  tracking_number text,
  carrier text,
  status text not null default 'pending'
    check (status in ('pending', 'ready', 'shipped', 'in_transit', 'delivered', 'failed', 'returned')),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_action_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.users(id) on delete restrict,
  action_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_blocked on public.users(is_blocked);

create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_new on public.products(is_new);
create index if not exists idx_products_created_at on public.products(created_at desc);

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_images_product_id on public.product_images(product_id);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_order_items_variant_id on public.order_items(variant_id);

create index if not exists idx_shipments_order_id on public.shipments(order_id);
create index if not exists idx_admin_logs_admin_id on public.admin_action_logs(admin_id);
create index if not exists idx_admin_logs_entity on public.admin_action_logs(entity_type, entity_id);
create index if not exists idx_admin_logs_created_at on public.admin_action_logs(created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
      and u.is_blocked = false
  );
$$;

create or replace function public.is_current_user_blocked()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select u.is_blocked from public.users u where u.id = auth.uid()),
    false
  );
$$;

create or replace function public.owns_order(order_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = order_uuid
      and o.user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role, is_blocked, created_at)
  values (new.id, new.email, 'customer', false, now())
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
