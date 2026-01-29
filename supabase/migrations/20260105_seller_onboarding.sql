-- Seller Onboarding Schema
-- This migration adds seller-specific tables and fields for the onboarding process

-- Seller specialization categories enum
create type public.seller_specialization as enum (
  'christmas',
  'halloween',
  'easter',
  'patriotic',
  'religious',
  'music_visualization',
  'animated_props',
  'mega_trees',
  'house_outlines',
  'custom_props'
);

-- Seller profiles table (extended profile information for sellers)
create table if not exists public.seller_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  -- Brand & Identity
  seller_name text not null check (char_length(seller_name) between 2 and 100),
  seller_bio text check (char_length(seller_bio) <= 1000),
  seller_tagline text check (char_length(seller_tagline) <= 150),
  profile_picture_url text,
  banner_image_url text,

  -- Contact & Social
  website_url text,
  facebook_url text,
  instagram_url text,
  youtube_url text,

  -- Specializations
  specializations public.seller_specialization[] not null default array[]::public.seller_specialization[],
  expertise_level text check (expertise_level in ('beginner', 'intermediate', 'advanced', 'professional')),
  years_experience integer check (years_experience >= 0 and years_experience <= 50),

  -- Business Information
  stripe_account_id text unique,
  stripe_account_status text default 'not_started' check (stripe_account_status in ('not_started', 'pending', 'active', 'restricted')),
  stripe_charges_enabled boolean default false,
  stripe_payouts_enabled boolean default false,

  -- Marketing & Communication
  marketing_consent boolean not null default false,
  newsletter_consent boolean not null default false,

  -- Seller Stats (updated automatically)
  total_sequences integer not null default 0,
  total_sales integer not null default 0,
  total_revenue_cents integer not null default 0,
  average_rating numeric(3,2),
  response_rate integer check (response_rate >= 0 and response_rate <= 100),

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_seller_profiles_updated_at
before update on public.seller_profiles
for each row execute function public.set_updated_at();

alter table public.seller_profiles enable row level security;

-- RLS policies for seller_profiles
create policy "Public read seller profiles"
on public.seller_profiles
for select
to anon, authenticated
using (true);

create policy "Sellers update own profile"
on public.seller_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users create own seller profile"
on public.seller_profiles
for insert
to authenticated
with check (id = auth.uid());

-- Onboarding progress tracking
create table if not exists public.seller_onboarding_progress (
  id uuid primary key references public.profiles(id) on delete cascade,

  -- Step completion tracking
  step_welcome_completed boolean not null default false,
  step_profile_completed boolean not null default false,
  step_specializations_completed boolean not null default false,
  step_payout_completed boolean not null default false,
  step_guidelines_completed boolean not null default false,
  step_first_upload_completed boolean not null default false,

  -- Overall status
  is_completed boolean not null default false,
  completed_at timestamptz,

  -- Progress tracking
  current_step integer not null default 1 check (current_step >= 1 and current_step <= 7),
  last_active_step integer not null default 1,

  -- Timestamps
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_onboarding_progress_updated_at
before update on public.seller_onboarding_progress
for each row execute function public.set_updated_at();

alter table public.seller_onboarding_progress enable row level security;

-- RLS policies for onboarding_progress
create policy "Users read own onboarding progress"
on public.seller_onboarding_progress
for select
to authenticated
using (id = auth.uid());

create policy "Users update own onboarding progress"
on public.seller_onboarding_progress
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users create own onboarding progress"
on public.seller_onboarding_progress
for insert
to authenticated
with check (id = auth.uid());

-- Function to mark onboarding as complete
create or replace function public.complete_seller_onboarding()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
begin
  if _user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Update onboarding progress
  update public.seller_onboarding_progress
  set
    is_completed = true,
    completed_at = now(),
    current_step = 7
  where id = _user_id;

  -- Ensure seller_profile exists
  if not exists (select 1 from public.seller_profiles where id = _user_id) then
    raise exception 'Seller profile does not exist';
  end if;
end;
$$;

-- Function to initialize seller onboarding
create or replace function public.initialize_seller_onboarding()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
begin
  if _user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Create seller profile if it doesn't exist
  insert into public.seller_profiles (id, seller_name)
  values (
    _user_id,
    (select coalesce(display_name, username, 'New Seller') from public.profiles where id = _user_id)
  )
  on conflict (id) do nothing;

  -- Create onboarding progress if it doesn't exist
  insert into public.seller_onboarding_progress (id)
  values (_user_id)
  on conflict (id) do nothing;
end;
$$;

-- Add is_seller flag to profiles if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'profiles'
    and column_name = 'is_seller'
  ) then
    alter table public.profiles add column is_seller boolean not null default false;
  end if;
end $$;

-- Update is_seller when seller_profile is created
create or replace function public.set_is_seller_flag()
returns trigger
language plpgsql
as $$
begin
  update public.profiles
  set is_seller = true
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_seller_profile_created on public.seller_profiles;
create trigger on_seller_profile_created
after insert on public.seller_profiles
for each row
execute function public.set_is_seller_flag();

-- Function to update seller stats (called by triggers on purchases/sequences)
create or replace function public.update_seller_stats(seller_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _total_sequences integer;
  _total_sales integer;
  _total_revenue_cents integer;
  _avg_rating numeric(3,2);
begin
  -- Count sequences
  select count(*) into _total_sequences
  from public.sequences
  where owner_id = seller_id and is_public = true;

  -- Count sales and revenue
  select
    count(*)::integer,
    coalesce(sum(amount_cents), 0)::integer
  into _total_sales, _total_revenue_cents
  from public.purchases
  where sequence_id in (
    select id from public.sequences where owner_id = seller_id
  )
  and status = 'succeeded';

  -- Calculate average rating
  select avg(r.rating)::numeric(3,2)
  into _avg_rating
  from public.reviews r
  inner join public.sequences s on r.sequence_id = s.id
  where s.owner_id = seller_id;

  -- Update seller profile
  update public.seller_profiles
  set
    total_sequences = _total_sequences,
    total_sales = _total_sales,
    total_revenue_cents = _total_revenue_cents,
    average_rating = _avg_rating
  where id = seller_id;
end;
$$;

-- Trigger to update seller stats when sequences change
create or replace function public.trigger_update_seller_stats()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.update_seller_stats(old.owner_id);
  else
    perform public.update_seller_stats(new.owner_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists sequences_update_seller_stats on public.sequences;
create trigger sequences_update_seller_stats
after insert or update or delete on public.sequences
for each row
execute function public.trigger_update_seller_stats();

-- Trigger to update seller stats when purchases change
create or replace function public.trigger_update_seller_stats_purchase()
returns trigger
language plpgsql
as $$
declare
  _seller_id uuid;
begin
  if tg_op = 'DELETE' then
    select owner_id into _seller_id
    from public.sequences
    where id = old.sequence_id;
  else
    select owner_id into _seller_id
    from public.sequences
    where id = new.sequence_id;
  end if;

  if _seller_id is not null then
    perform public.update_seller_stats(_seller_id);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists purchases_update_seller_stats on public.purchases;
create trigger purchases_update_seller_stats
after insert or update or delete on public.purchases
for each row
execute function public.trigger_update_seller_stats_purchase();

-- Create indexes for performance
create index if not exists seller_profiles_stripe_account_idx on public.seller_profiles(stripe_account_id);
create index if not exists seller_profiles_specializations_idx on public.seller_profiles using gin(specializations);
create index if not exists onboarding_progress_completed_idx on public.seller_onboarding_progress(is_completed);
