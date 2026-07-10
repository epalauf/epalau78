-- Featured hero space: a profile can point at one of the user's creations
-- to show it in the home hero instead of the default scenarios.

alter table public.profiles
  add column hero_creation_id uuid references public.creations(id) on delete set null;
