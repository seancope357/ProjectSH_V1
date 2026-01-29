-- SequenceHub Database Schema
-- This migration sets up all the core tables for the xLights sequence marketplace

-- Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid(), gen_random_bytes()
create extension if not exists citext;    -- case-insensitive text (for usernames/slugs)

-- Helper: auto-update updated_at column
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create user profile on signup (auth.users trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _username text;
  _display_name text;
begin
  -- Derive sensible defaults
  _username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  _display_name := coalesce(new.raw_user_meta_data->>'name', _username);

  insert into public.profiles (id, username, display_name)
  values (new.id, _username, _display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique,
  display_name text,
  avatar_url text,
  bio text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "Public read profiles"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "Users insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Sequences table
create table if not exists public.sequences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  description text,
  slug citext unique, -- optional slug if you use clean URLs
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  is_public boolean not null default true,
  -- computed free flag
  is_free boolean generated always as (price_cents = 0) stored,
  file_path text,   -- path to storage object (private bucket recommended)
  cover_path text,  -- optional preview/cover asset path
  license text default 'standard',
  metadata jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_title_unique unique (owner_id, title)
);

create index if not exists sequences_owner_idx on public.sequences(owner_id);
create index if not exists sequences_public_idx on public.sequences(is_public);

create trigger set_sequences_updated_at
before update on public.sequences
for each row execute function public.set_updated_at();

alter table public.sequences enable row level security;

-- RLS policies for sequences
create policy "Public read public sequences"
on public.sequences
for select
to anon, authenticated
using (is_public = true);

create policy "Owners read own sequences"
on public.sequences
for select
to authenticated
using (owner_id = auth.uid());

create policy "Purchasers read purchased sequences"
on public.sequences
for select
to authenticated
using (
  exists (
    select 1
    from public.purchases p
    where p.sequence_id = public.sequences.id
      and p.buyer_id = auth.uid()
      and p.status = 'succeeded'
  )
);

create policy "Owners insert sequences"
on public.sequences
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Owners update sequences"
on public.sequences
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owners delete sequences"
on public.sequences
for delete
to authenticated
using (owner_id = auth.uid());

-- Purchase status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending','succeeded','refunded','failed');
  end if;
end$$;

-- Purchases table
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  status public.payment_status not null default 'pending',
  transaction_id text unique, -- for external payment processor reference
  license_key text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  constraint one_purchase_per_user_per_sequence unique (buyer_id, sequence_id)
);

create index if not exists purchases_buyer_idx on public.purchases(buyer_id);
create index if not exists purchases_sequence_idx on public.purchases(sequence_id);
create index if not exists purchases_status_idx on public.purchases(status);

alter table public.purchases enable row level security;

-- RLS policies for purchases
create policy "Buyers read own purchases"
on public.purchases
for select
to authenticated
using (buyer_id = auth.uid());

create policy "Sellers read purchases of own sequences"
on public.purchases
for select
to authenticated
using (
  exists (
    select 1
    from public.sequences s
    where s.id = public.purchases.sequence_id
      and s.owner_id = auth.uid()
  )
);

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating int2 not null check (rating between 1 and 5),
  title text,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint one_review_per_user_per_sequence unique (reviewer_id, sequence_id)
);

create index if not exists reviews_sequence_idx on public.reviews(sequence_id);
create index if not exists reviews_reviewer_idx on public.reviews(reviewer_id);

create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

-- RLS policies for reviews
create policy "Public read reviews of public sequences"
on public.reviews
for select
to anon, authenticated
using (
  exists (
    select 1 from public.sequences s
    where s.id = public.reviews.sequence_id
      and s.is_public = true
  )
);

create policy "Owners read reviews for own sequences"
on public.reviews
for select
to authenticated
using (
  exists (
    select 1 from public.sequences s
    where s.id = public.reviews.sequence_id
      and s.owner_id = auth.uid()
  )
);

create policy "Reviewers read own reviews"
on public.reviews
for select
to authenticated
using (reviewer_id = auth.uid());

create policy "Purchasers create reviews"
on public.reviews
for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1
    from public.purchases p
    where p.sequence_id = public.reviews.sequence_id
      and p.buyer_id = auth.uid()
      and p.status = 'succeeded'
  )
);

create policy "Reviewers update own reviews"
on public.reviews
for update
to authenticated
using (reviewer_id = auth.uid())
with check (reviewer_id = auth.uid());

create policy "Reviewers delete own reviews"
on public.reviews
for delete
to authenticated
using (reviewer_id = auth.uid());

create policy "Owners delete reviews for own sequences"
on public.reviews
for delete
to authenticated
using (
  exists (
    select 1 from public.sequences s
    where s.id = public.reviews.sequence_id
      and s.owner_id = auth.uid()
  )
);

-- Guard price changes after sales (optional but recommended)
create or replace function public.prevent_price_change_if_purchases()
returns trigger
language plpgsql
as $$
begin
  if (old.price_cents <> new.price_cents or old.currency <> new.currency) then
    if exists (
      select 1 from public.purchases p
      where p.sequence_id = old.id
        and p.status = 'succeeded'
    ) then
      raise exception 'Cannot change price or currency after successful purchases exist';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_price_update on public.sequences;
create trigger prevent_price_update
before update of price_cents, currency on public.sequences
for each row
execute function public.prevent_price_change_if_purchases();

-- Aggregation view for sequence stats (purchases and average rating)
create or replace view public.sequence_stats as
select
  s.id as sequence_id,
  count(distinct p.id) filter (where p.status = 'succeeded')::bigint as purchases_count,
  avg(r.rating)::numeric(10,2) as avg_rating,
  count(r.id)::bigint as reviews_count
from public.sequences s
left join public.purchases p
  on p.sequence_id = s.id and p.status = 'succeeded'
left join public.reviews r
  on r.sequence_id = s.id
group by s.id;

-- RPC to record purchases securely (to be called from Vercel backend)
create or replace function public.purchase_sequence(
  _sequence_id uuid,
  _amount_cents integer default null,
  _currency text default 'USD',
  _transaction_id text default null,
  _status public.payment_status default 'succeeded'
)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  _buyer_id uuid := auth.uid();
  _owner_id uuid;
  _price integer;
  _is_free boolean;
  _existing public.purchases;
begin
  if _buyer_id is null then
    raise exception 'Not authenticated';
  end if;

  select owner_id, price_cents, is_free
    into _owner_id, _price, _is_free
  from public.sequences
  where id = _sequence_id;

  if not found then
    raise exception 'Sequence not found';
  end if;

  if _owner_id = _buyer_id then
    raise exception 'Cannot purchase your own sequence';
  end if;

  select * into _existing
  from public.purchases
  where buyer_id = _buyer_id and sequence_id = _sequence_id;

  if found then
    return _existing;
  end if;

  if not _is_free then
    if _status <> 'succeeded' then
      raise exception 'Non-free purchases must have succeeded status';
    end if;
    if _amount_cents is null or _amount_cents <> _price then
      raise exception 'Amount mismatch';
    end if;
  end if;

  insert into public.purchases (buyer_id, sequence_id, amount_cents, currency, status, transaction_id)
  values (_buyer_id, _sequence_id, coalesce(_amount_cents, 0), coalesce(_currency, 'USD'), _status, _transaction_id)
  returning * into _existing;

  return _existing;
end;
$$;
