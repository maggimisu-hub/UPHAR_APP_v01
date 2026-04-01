-- ────────────────────────────────────────
-- Seed: Auth users with proper identities
-- Run AFTER 01_base_schema.sql
-- ────────────────────────────────────────

-- Admin user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, reauthentication_token, phone_change_token,
  email_change, phone_change, phone
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'admin@uphar.com',
  crypt('password123', gen_salt('bf', 10)),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}', false,
  '', '', '', '', '', '', '', '', ''
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('password123', gen_salt('bf', 10));

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'email',
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'admin@uphar.com', 'email_verified', true, 'phone_verified', false),
  now(), now(), now()
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Customer user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, reauthentication_token, phone_change_token,
  email_change, phone_change
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated', 'customer@uphar.com',
  crypt('password123', gen_salt('bf', 10)),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}', false,
  '', '', '', '', '', '', '', ''
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('password123', gen_salt('bf', 10));

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'email',
  jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'customer@uphar.com', 'email_verified', true, 'phone_verified', false),
  now(), now(), now()
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- public.users rows (created by trigger, but ensure they exist)
INSERT INTO public.users (id, role, is_blocked)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', false),
  ('22222222-2222-2222-2222-222222222222', 'customer', false)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────
-- Seed: Test product with images & inventory
-- ────────────────────────────────────────

INSERT INTO public.products (id, name, description, price, is_active, is_featured, is_new)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Test Product', 'A beautiful test jewellery piece', 100.00, true, true, false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, name, price)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'Default', 100.00
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.inventory (variant_id, stock)
VALUES ('44444444-4444-4444-4444-444444444444', 10)
ON CONFLICT (variant_id) DO UPDATE SET stock = 10;

INSERT INTO public.product_images (id, product_id, image_url)
VALUES
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1515562141589-67f0d569b6c6?w=600&q=80'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80')
ON CONFLICT DO NOTHING;

-- Default address for customer
INSERT INTO public.addresses (user_id, name, phone, address_line, city, pincode, is_default)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Home Address', '9876543210', '42 Gold Lane', 'Mumbai', '400001', true
)
ON CONFLICT DO NOTHING;
