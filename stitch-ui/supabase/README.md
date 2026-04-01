# Supabase Setup

Run these files in Supabase SQL Editor in this exact order:

1. `sql/01_base_schema.sql`
2. `sql/02_extension_tables.sql`
3. `sql/03_rls_policies.sql`
4. `sql/04_rpc_checkout.sql`
5. `sql/05_rpc_pay_at_store.sql`
6. `sql/06_rpc_payment_confirmation.sql` (optional for future prepaid flow)

Notes:

- Do not skip the order.
- Create admin auth users after running `01` through `03`.
- Assign admin role in `public.users` after the admin users sign up.
- The frontend only needs the anon key. Do not put the service role key in the Vite app.
