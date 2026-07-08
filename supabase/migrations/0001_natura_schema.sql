-- Natura schema: profiles, creations, gallery_images + RLS + storage buckets

-- ─── profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- Auto-create a profile row on signup, deriving username from metadata/email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(new.email, '@', 1)
  );
  begin
    insert into public.profiles (id, username)
    values (new.id, base_username);
  exception when unique_violation then
    insert into public.profiles (id, username)
    values (new.id, base_username || '-' || substr(new.id::text, 1, 4));
  end;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── creations ───────────────────────────────────────────────────────────────
create table public.creations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'My space',
  scene_data jsonb not null,
  thumbnail_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index creations_user_id_idx on public.creations (user_id);
create index creations_public_idx on public.creations (is_public, updated_at desc);

alter table public.creations enable row level security;

create policy "Public creations are viewable by everyone"
  on public.creations for select
  using (is_public or (select auth.uid()) = user_id);

create policy "Users can insert own creations"
  on public.creations for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own creations"
  on public.creations for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own creations"
  on public.creations for delete
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger creations_set_updated_at
  before update on public.creations
  for each row execute function public.set_updated_at();

-- ─── gallery_images (owner-curated; uploads via dashboard only) ─────────────
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_es text not null default '',
  storage_path text not null,
  sort_order integer not null default 0
);

alter table public.gallery_images enable row level security;

create policy "Gallery images are viewable by everyone"
  on public.gallery_images for select
  using (true);

-- ─── storage buckets ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true), ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload thumbnails"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'thumbnails');

create policy "Users can update own thumbnails"
  on storage.objects for update to authenticated
  using (bucket_id = 'thumbnails' and owner_id = (select auth.uid())::text);

create policy "Users can delete own thumbnails"
  on storage.objects for delete to authenticated
  using (bucket_id = 'thumbnails' and owner_id = (select auth.uid())::text);
