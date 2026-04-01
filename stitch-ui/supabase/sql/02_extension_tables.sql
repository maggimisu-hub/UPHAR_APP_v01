create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user_id on public.addresses(user_id);
create index if not exists idx_addresses_created_at on public.addresses(created_at desc);

create unique index if not exists uq_addresses_one_default_per_user
on public.addresses(user_id)
where is_default = true;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null check (status in ('pending', 'success', 'failed')),
  provider text not null,
  transaction_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

create unique index if not exists uq_payments_transaction_id
on public.payments(transaction_id)
where transaction_id is not null;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_collections_active on public.collections(is_active);
create index if not exists idx_collections_created_at on public.collections(created_at desc);

create table if not exists public.product_collections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  unique (product_id, collection_id)
);

create index if not exists idx_product_collections_product_id
on public.product_collections(product_id);

create index if not exists idx_product_collections_collection_id
on public.product_collections(collection_id);
