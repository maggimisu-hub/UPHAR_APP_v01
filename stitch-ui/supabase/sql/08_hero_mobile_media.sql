alter table public.hero_content
  add column if not exists mobile_media_url text,
  add column if not exists mobile_is_video boolean not null default false;
