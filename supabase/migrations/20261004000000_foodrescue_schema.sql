-- FoodRescue Database Schema & Migration
-- Fully compliant with 05-Backend-Schema.txt and 01-PRD.md

-- Extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- Enums
create type user_role as enum ('hotel', 'ngo', 'volunteer', 'public', 'admin');
create type org_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type venue_type as enum ('hotel', 'restaurant', 'banquet_hall', 'hostel');
create type food_diet as enum ('veg', 'non_veg', 'mixed');
create type listing_status as enum ('posted', 'claimed', 'completed', 'expired', 'cancelled');
create type pickup_status as enum ('claimed', 'on_the_way', 'collected', 'completed', 'cancelled');
create type tag_kind as enum ('positive', 'issue');
create type flag_status as enum ('open', 'kept', 'corrected', 'voided');
create type news_status as enum ('draft', 'published', 'hidden');
create type news_source as enum ('internal', 'external');

-- 1. Profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  role user_role not null,
  full_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

-- 2. Hotels
create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  venue_type venue_type not null,
  address text not null,
  location geography(Point, 4326) not null,
  rooms int default 0,
  seats int default 0,
  banquet_capacity int default 0,
  events_per_month int default 0,
  operating_days_per_week int default 7 check (operating_days_per_week between 1 and 7),
  status org_status not null default 'pending',
  public_listing boolean not null default true,
  verification_doc_path text,
  created_at timestamptz not null default now()
);

-- 3. NGOs
create table if not exists ngos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  registration_no text,
  address text not null,
  location geography(Point, 4326) not null,
  capacity_portions int default 0,
  service_radius_km numeric default 10,
  trust_score numeric not null default 1.0 check (trust_score between 0.0 and 1.0),
  status org_status not null default 'pending',
  verification_doc_path text,
  created_at timestamptz not null default now()
);

-- 4. Volunteers
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  ngo_id uuid not null references ngos(id) on delete cascade,
  vehicle text,
  active boolean not null default true
);

-- 5. Listings
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  title text not null,
  description text,
  diet food_diet not null,
  portions_listed int not null check (portions_listed > 0),
  cooked_at timestamptz not null,
  pickup_by timestamptz not null,
  packaging_notes text,
  safety_confirmed boolean not null default false,
  status listing_status not null default 'posted',
  created_at timestamptz not null default now(),
  check (pickup_by > cooked_at)
);
create index if not exists idx_listings_status_pickup on listings (status, pickup_by);
create index if not exists idx_listings_hotel_created on listings (hotel_id, created_at desc);

-- 6. Pickups
create table if not exists pickups (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  ngo_id uuid not null references ngos(id) on delete cascade,
  volunteer_id uuid references volunteers(id) on delete set null,
  status pickup_status not null default 'claimed',
  claimed_at timestamptz not null default now(),
  started_at timestamptz,
  collected_at timestamptz,
  completed_at timestamptz,
  collected_in_geofence boolean,
  portions_received int check (portions_received >= 0),
  left_behind_portions int check (left_behind_portions >= 0),
  photo_path text,
  cancel_reason text,
  voided boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists one_active_pickup_per_listing
  on pickups (listing_id) where status in ('claimed', 'on_the_way', 'collected');
create index if not exists idx_pickups_ngo_created on pickups (ngo_id, created_at desc);

-- 7. Location Pings
create table if not exists location_pings (
  id bigserial primary key,
  pickup_id uuid not null references pickups(id) on delete cascade,
  location geography(Point, 4326) not null,
  accuracy_m numeric,
  recorded_at timestamptz not null default now()
);
create index if not exists idx_location_pings_pickup_time on location_pings (pickup_id, recorded_at desc);

-- 8. Quality & Issue Tags
create table if not exists tags (
  code text primary key,
  label text not null,
  kind tag_kind not null,
  active boolean not null default true
);

insert into tags (code, label, kind, active) values
  ('ready_on_time', 'Ready on Time', 'positive', true),
  ('well_packaged', 'Well Packaged', 'positive', true),
  ('fresh', 'Fresh & High Quality', 'positive', true),
  ('late', 'Late / Delays', 'issue', true),
  ('quantity_short', 'Quantity Short', 'issue', true),
  ('poor_packaging', 'Poor Packaging / Leaks', 'issue', true)
on conflict (code) do nothing;

create table if not exists pickup_tags (
  pickup_id uuid references pickups(id) on delete cascade,
  tag_code text references tags(code) on delete cascade,
  primary key (pickup_id, tag_code)
);

-- 9. Flags & Moderation
create table if not exists flags (
  id uuid primary key default gen_random_uuid(),
  pickup_id uuid not null references pickups(id) on delete cascade,
  reason text not null,
  source text not null default 'auto', -- 'auto' | 'admin' | 'email_complaint'
  status flag_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  action text not null, -- 'approve_org','suspend_org','void_report','correct_report'
  target_type text not null,
  target_id uuid,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- 10. Platform Settings
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into settings (key, value) values
  ('score_weights', '{"rescue_rate": 0.40, "participation": 0.20, "listing_accuracy": 0.15, "handoff_quality": 0.15, "left_behind": 0.10}'::jsonb),
  ('smoothing_k', '5'::jsonb),
  ('min_pickups_for_board', '5'::jsonb),
  ('geofence_radius_meters', '150'::jsonb),
  ('per_ngo_weight_cap', '0.40'::jsonb),
  ('report_deadline_hours', '4'::jsonb)
on conflict (key) do nothing;

-- 11. Score Snapshots & Certificates
create table if not exists score_snapshots (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  completed_pickups int not null,
  portions_rescued int not null,
  rescue_rate numeric,
  participation numeric,
  listing_accuracy numeric,
  handoff_quality numeric,
  left_behind numeric,
  composite numeric,
  tier text, -- 'seed', 'sprout', 'canopy', 'forest'
  rank_in_category int,
  eligible boolean not null default false,
  created_at timestamptz not null default now(),
  unique (hotel_id, period_end)
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  month date not null,
  pdf_path text not null,
  meals int not null,
  created_at timestamptz not null default now(),
  unique (hotel_id, month)
);

-- 12. Public Engagement, Social & News
create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  source_type news_source not null,
  title text not null,
  snippet text,
  source_name text,
  url text,
  image_url text,
  status news_status not null default 'draft',
  pinned boolean not null default false,
  published_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  user_id uuid references profiles(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, hotel_id)
);

create table if not exists kudos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  unique (user_id, hotel_id, week_start)
);

-- 13. Notifications & Push
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_time on notifications (user_id, created_at desc);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text unique not null,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

-- Stored Procedures & Functions

-- Atomic Claim
create or replace function claim_listing(p_listing uuid, p_ngo uuid, p_volunteer uuid)
returns uuid language plpgsql security definer as $$
declare
  v_pickup uuid;
begin
  update listings
  set status = 'claimed'
  where id = p_listing and status = 'posted' and pickup_by > now();

  if not found then
    raise exception 'ALREADY_CLAIMED_OR_EXPIRED';
  end if;

  insert into pickups (listing_id, ngo_id, volunteer_id, status, claimed_at)
  values (p_listing, p_ngo, p_volunteer, 'claimed', now())
  returning id into v_pickup;

  return v_pickup;
end;
$$;
