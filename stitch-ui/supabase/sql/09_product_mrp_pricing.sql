alter table public.products
  add column if not exists mrp_price numeric(12,2);

alter table public.product_variants
  add column if not exists mrp_price numeric(12,2);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_mrp_price_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_mrp_price_check
      check (mrp_price is null or mrp_price >= price);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_variants_mrp_price_check'
      and conrelid = 'public.product_variants'::regclass
  ) then
    alter table public.product_variants
      add constraint product_variants_mrp_price_check
      check (mrp_price is null or mrp_price >= price);
  end if;
end $$;
