-- Migration: Add discount_percent to products and product_variants
-- This enables admin-controlled discount pricing where:
--   admin enters MRP + discount_percent
--   app calculates sale price = mrp * (1 - discount_percent / 100)
--   existing `price` column remains the final sale price used by checkout

-- 1. Add discount_percent to products
alter table public.products
  add column if not exists discount_percent numeric(5,2)
    check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 90));

-- 2. Add discount_percent to product_variants
alter table public.product_variants
  add column if not exists discount_percent numeric(5,2)
    check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 90));

-- Note: Existing products retain null discount_percent and behave as before.
-- The mrp_price >= price constraint already exists on both tables.
