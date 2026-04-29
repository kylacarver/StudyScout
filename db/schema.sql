-- StudyScout Supabase schema
-- Run in Supabase SQL editor before seeding data.

create extension if not exists "pgcrypto";

create table if not exists public.spots (
  id bigint primary key,
  name text not null unique,
  area text not null,
  spot_type text not null,
  description text not null,
  noise text not null check (noise in ('Quiet', 'Mixed', 'Loud')),
  crowd text not null check (crowd in ('Low', 'Medium', 'High')),
  outlets smallint not null check (outlets between 1 and 5),
  wifi smallint not null check (wifi between 1 and 5),
  comfort smallint not null check (comfort between 1 and 5),
  productivity smallint not null check (productivity between 1 and 5),
  late_night boolean not null default false,
  food_nearby boolean not null default false,
  best_for text[] not null default '{}',
  tips text not null default '',
  busy_spike text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_ratings (
  id uuid primary key default gen_random_uuid(),
  spot_id bigint not null references public.spots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  review text not null default '' check (char_length(review) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (spot_id, user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_spots_updated_at on public.spots;
create trigger set_spots_updated_at
before update on public.spots
for each row
execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_student_ratings_updated_at on public.student_ratings;
create trigger set_student_ratings_updated_at
before update on public.student_ratings
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (user_id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create or replace view public.spot_student_aggregates as
select
  s.id as spot_id,
  coalesce(round(avg(sr.rating)::numeric, 2), 0)::numeric(3,2) as avg_rating,
  count(sr.id)::int as rating_count,
  max(sr.updated_at) as last_updated_at
from public.spots s
left join public.student_ratings sr on sr.spot_id = s.id
group by s.id;

alter table public.spots enable row level security;
alter table public.profiles enable row level security;
alter table public.student_ratings enable row level security;

drop policy if exists "Public can read spots" on public.spots;
create policy "Public can read spots"
on public.spots
for select
to anon, authenticated
using (true);

drop policy if exists "Users can read profiles" on public.profiles;
create policy "Users can read profiles"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
on public.profiles
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Public can read student ratings" on public.student_ratings;
create policy "Public can read student ratings"
on public.student_ratings
for select
to anon, authenticated
using (true);

drop policy if exists "Users insert own rating" on public.student_ratings;
create policy "Users insert own rating"
on public.student_ratings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own rating" on public.student_ratings;
create policy "Users update own rating"
on public.student_ratings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own rating" on public.student_ratings;
create policy "Users delete own rating"
on public.student_ratings
for delete
to authenticated
using (auth.uid() = user_id);
