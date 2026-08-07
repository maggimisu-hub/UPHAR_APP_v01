-- Migration 11: Voice Training Rules table for AI Voice Agent custom mappings
create table if not exists public.voice_training_rules (
  id uuid primary key default gen_random_uuid(),
  spoken_term text not null unique,
  actual_term text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.voice_training_rules enable row level security;

-- Policies: anyone can select (to allow storefront voice agent to load rules),
-- but only authenticated admin users can insert, update, or delete rules.
create policy "Allow public read-only access to voice training rules"
on public.voice_training_rules for select
using (true);

create policy "Allow authenticated admin full access to voice training rules"
on public.voice_training_rules for all
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);
