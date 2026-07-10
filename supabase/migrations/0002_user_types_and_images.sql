-- User types (nature | photo | art) + per-user image storage

-- ─── profiles.user_type ──────────────────────────────────────────────────────
alter table public.profiles
  add column user_type text not null default 'nature'
  check (user_type in ('nature', 'photo', 'art'));

-- Include the chosen type when auto-creating the profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  chosen_type text;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(new.email, '@', 1)
  );
  chosen_type := coalesce(
    nullif(new.raw_user_meta_data ->> 'user_type', ''),
    'nature'
  );
  if chosen_type not in ('nature', 'photo', 'art') then
    chosen_type := 'nature';
  end if;
  begin
    insert into public.profiles (id, username, user_type)
    values (new.id, base_username, chosen_type);
  exception when unique_violation then
    insert into public.profiles (id, username, user_type)
    values (new.id, base_username || '-' || substr(new.id::text, 1, 4), chosen_type);
  end;
  return new;
end;
$$;

-- ─── user-images bucket (each user manages their own folder) ─────────────────
insert into storage.buckets (id, name, public)
values ('user-images', 'user-images', true)
on conflict (id) do nothing;

create policy "User images are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'user-images');

create policy "Users can upload into own image folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
