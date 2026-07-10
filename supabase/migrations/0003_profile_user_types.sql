-- Multi scenario types: profiles hold 1..3 of nature | photo | art

-- ─── profiles.user_types ─────────────────────────────────────────────────────
alter table public.profiles
  add column user_types text[] not null default array['nature']
  constraint profiles_user_types_valid check (
    user_types <@ array['nature', 'photo', 'art']
    and cardinality(user_types) between 1 and 3
  );

update public.profiles set user_types = array[user_type];

alter table public.profiles drop column user_type;

-- Signup still picks a single type; the trigger wraps it in an array
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
    insert into public.profiles (id, username, user_types)
    values (new.id, base_username, array[chosen_type]);
  exception when unique_violation then
    insert into public.profiles (id, username, user_types)
    values (new.id, base_username || '-' || substr(new.id::text, 1, 4), array[chosen_type]);
  end;
  return new;
end;
$$;
