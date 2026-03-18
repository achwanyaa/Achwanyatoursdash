-- ============================================================
-- ACHWANYA 3D TOURS - MIGRATION SCHEMA V2
-- Based on improved blueprint
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type subscription_tier as enum ('trial', 'basic', 'pro', 'enterprise');
create type tour_status       as enum ('pending', 'active', 'expired', 'archived');
create type booking_status    as enum ('requested', 'scheduled', 'completed', 'cancelled');

-- ============================================================
-- PROFILES
-- Extends Supabase auth.users 1-to-1.
-- ============================================================
create table profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  role                text not null default 'client'       check (role in ('client', 'admin')),
  full_name           text,
  company_name        text,
  whatsapp_number     text not null,                        -- e.g. +254712345678
  subscription_tier   subscription_tier not null default 'trial',
  trial_ends_at       timestamptz not null default (now() + interval '7 days'),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- One active row per user. Updated via payment webhook.
-- ============================================================
create table subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles(id) on delete cascade,
  tier                  subscription_tier not null,
  max_active_tours      int not null default 1,            -- 1 trial / 3 basic / 12 pro
  current_period_start  timestamptz not null default now(),
  current_period_end    timestamptz not null default (now() + interval '30 days'),
  is_active             boolean not null default true,
  pesapal_order_id      text,
  created_at            timestamptz not null default now(),
  unique (user_id)                                         -- one active sub per user
);

-- Derived limits helper (used in middleware)
-- trial: 1 | basic: 3 | pro: 12 | enterprise: 9999
create or replace function get_tour_limit(tier subscription_tier)
returns int language sql immutable as $$
  select case tier
    when 'trial'      then 1
    when 'basic'      then 3
    when 'pro'        then 12
    when 'enterprise' then 9999
    else 0
  end;
$$;

-- ============================================================
-- TOURS
-- Core table. Admin inserts; clients read-only.
-- ============================================================
create table tours (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  property_name     text not null,
  address           text not null,
  property_type     text,                                   -- apartment, villa, office, etc.
  bedrooms          int,
  realsee_embed_src text,                                   -- https://realsee.ai/XXXX
  status            tour_status not null default 'pending',
  views             int not null default 0,
  notes             text,                                   -- internal admin notes
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- BOOKINGS
-- Client requests a shoot via the dashboard form.
-- ============================================================
create table bookings (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  property_name   text not null,
  address         text not null,
  preferred_date  date not null,
  property_type   text,
  bedrooms        int,
  notes           text,
  status          booking_status not null default 'requested',
  created_at      timestamptz not null default now()
);

-- ============================================================
-- LEADS
-- Captured from iframe overlay forms. Forwarded via webhook.
-- ============================================================
create table leads (
  id              uuid primary key default uuid_generate_v4(),
  tour_id         uuid not null references tours(id) on delete cascade,
  owner_id        uuid not null references profiles(id) on delete cascade,
  full_name       text not null,
  phone           text not null,
  message         text,
  forwarded       boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles RLS
alter table profiles enable row level security;

create policy "Clients read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Clients update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins full access"
  on profiles for all
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Subscriptions RLS
alter table subscriptions enable row level security;

create policy "Clients read own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Admins full access"
  on subscriptions for all
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Tours RLS
alter table tours enable row level security;

create policy "Clients read own active tours"
  on tours for select
  using (
    auth.uid() = user_id
    and status = 'active'
  );

create policy "Admins full access"
  on tours for all
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Bookings RLS
alter table bookings enable row level security;

create policy "Clients manage own bookings"
  on bookings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins full access"
  on bookings for all
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Leads RLS
alter table leads enable row level security;

create policy "Clients read own leads"
  on leads for select
  using (auth.uid() = owner_id);

create policy "Anyone can insert a lead"
  on leads for insert
  with check (true);                                        -- public lead form

create policy "Admins full access"
  on leads for all
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-increment view counter (called from Next.js API route)
create or replace function increment_tour_views(tour_id uuid)
returns void language sql security definer as $$
  update tours set views = views + 1 where id = tour_id;
$$;

-- Updated at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- Auto-create profile + subscription on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, whatsapp_number, subscription_tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'whatsapp_number', ''),
    'trial'
  );

  insert into subscriptions (user_id, tier, max_active_tours, current_period_end)
  values (
    new.id,
    'trial',
    get_tour_limit('trial'),
    now() + interval '7 days'
  );

  return new;
end;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_tours_updated_at
  before update on tours
  for each row execute function set_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
