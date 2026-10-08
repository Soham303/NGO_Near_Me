-- ====================================================================
-- FoodRescue Database Schema & Migration
-- Fully compliant with Supabase Auth, PostGIS, TRD, and 05-Backend-Schema.txt
-- ====================================================================

-- 1. Extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- 2. Custom Enums
do $$ begin
  create type user_role as enum ('hotel', 'ngo', 'volunteer', 'public', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type org_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type venue_type as enum ('hotel', 'restaurant', 'banquet_hall', 'hostel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type food_diet as enum ('veg', 'non_veg', 'mixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('posted', 'claimed', 'completed', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pickup_status as enum ('claimed', 'on_the_way', 'collected', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tag_kind as enum ('positive', 'issue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type flag_status as enum ('open', 'kept', 'corrected', 'voided');
exception when duplicate_object then null; end $$;

do $$ begin
  create type news_status as enum ('draft', 'published', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type news_source as enum ('internal', 'external');
exception when duplicate_object then null; end $$;

-- 3. Profiles (Linked to Supabase Auth auth.users)
create table if not exists profiles (
  id uuid primary key,
  role user_role not null default 'public',
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Foreign key constraint to auth.users if available
do $$ begin
  alter table profiles
    add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
exception when others then null; end $$;

-- 4. Location Helper Function & Triggers
create or replace function update_entity_location()
returns trigger language plpgsql as $$
begin
  if new.lat is not null and new.lng is not null then
    new.location := st_setsrid(st_makepoint(new.lng, new.lat), 4326)::geography;
  elsif new.location is not null then
    new.lat := st_y(new.location::geometry);
    new.lng := st_x(new.location::geometry);
  else
    new.lat := 12.9716;
    new.lng := 77.5946;
    new.location := st_setsrid(st_makepoint(77.5946, 12.9716), 4326)::geography;
  end if;
  return new;
end;
$$;

-- 5. Hotels
create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  venue_type venue_type not null default 'hotel',
  address text not null,
  lat double precision default 12.9716,
  lng double precision default 77.5946,
  location geography(Point, 4326),
  rooms int default 0,
  seats int default 0,
  banquet_capacity int default 0,
  events_per_month int default 0,
  operating_days_per_week int default 7 check (operating_days_per_week between 1 and 7),
  status org_status not null default 'approved',
  public_listing boolean not null default true,
  verification_doc_path text,
  created_at timestamptz not null default now()
);

drop trigger if exists trg_hotels_location on hotels;
create trigger trg_hotels_location
  before insert or update on hotels
  for each row execute procedure update_entity_location();

-- 6. NGOs
create table if not exists ngos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  registration_no text,
  address text not null,
  lat double precision default 12.9716,
  lng double precision default 77.5946,
  location geography(Point, 4326),
  capacity_portions int default 0,
  service_radius_km numeric default 10,
  trust_score numeric not null default 1.0 check (trust_score between 0.0 and 1.0),
  status org_status not null default 'approved',
  verification_doc_path text,
  created_at timestamptz not null default now()
);

drop trigger if exists trg_ngos_location on ngos;
create trigger trg_ngos_location
  before insert or update on ngos
  for each row execute procedure update_entity_location();

-- 7. Volunteers
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  ngo_id uuid references ngos(id) on delete cascade,
  name text not null,
  phone text,
  vehicle text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8. Listings
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  title text not null,
  description text,
  diet food_diet not null,
  portions_listed int not null check (portions_listed > 0),
  cooked_at timestamptz not null default now(),
  pickup_by timestamptz not null default (now() + interval '3 hours'),
  packaging_notes text,
  safety_confirmed boolean not null default true,
  status listing_status not null default 'posted',
  created_at timestamptz not null default now(),
  check (pickup_by > cooked_at)
);

create index if not exists idx_listings_status_pickup on listings (status, pickup_by);
create index if not exists idx_listings_hotel_created on listings (hotel_id, created_at desc);

-- 9. Pickups
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
  collected_in_geofence boolean default true,
  portions_received int check (portions_received >= 0),
  left_behind_portions int check (left_behind_portions >= 0) default 0,
  photo_path text,
  cancel_reason text,
  voided boolean not null default false,
  current_lat double precision,
  current_lng double precision,
  eta_minutes int,
  tags text[],
  created_at timestamptz not null default now()
);

create index if not exists idx_pickups_ngo_created on pickups (ngo_id, created_at desc);
create index if not exists idx_pickups_listing on pickups (listing_id);

-- 10. Location Pings
create table if not exists location_pings (
  id bigserial primary key,
  pickup_id uuid not null references pickups(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  location geography(Point, 4326),
  accuracy_m numeric,
  recorded_at timestamptz not null default now()
);

drop trigger if exists trg_location_pings on location_pings;
create trigger trg_location_pings
  before insert or update on location_pings
  for each row execute procedure update_entity_location();

create index if not exists idx_location_pings_pickup_time on location_pings (pickup_id, recorded_at desc);

-- 11. Quality & Issue Tags
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

-- 12. Flags & Moderation
create table if not exists flags (
  id uuid primary key default gen_random_uuid(),
  pickup_id uuid not null references pickups(id) on delete cascade,
  reason text not null,
  source text not null default 'auto',
  status flag_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- 13. Platform Settings
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

-- 14. Score Snapshots & Certificates
create table if not exists score_snapshots (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  period_start date not null default (current_date - 60),
  period_end date not null default current_date,
  completed_pickups int not null default 0,
  portions_rescued int not null default 0,
  rescue_rate numeric default 0.90,
  participation numeric default 0.85,
  listing_accuracy numeric default 0.95,
  handoff_quality numeric default 0.92,
  left_behind numeric default 0.05,
  composite numeric not null default 90.0,
  tier text not null default 'forest',
  rank_in_category int default 1,
  eligible boolean not null default true,
  streak_weeks int default 4,
  created_at timestamptz not null default now(),
  unique (hotel_id, period_end)
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  month date not null,
  pdf_path text not null,
  meals int not null default 0,
  ngos_served int not null default 1,
  co2_kg_avoided numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (hotel_id, month)
);

-- 15. Public Engagement, Social & News
create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  source_type news_source not null default 'internal',
  title text not null,
  snippet text,
  source_name text,
  url text,
  image_url text,
  status news_status not null default 'published',
  pinned boolean not null default false,
  published_at timestamptz default now(),
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
  week_start date not null default date_trunc('week', current_date),
  created_at timestamptz not null default now(),
  unique (user_id, hotel_id, week_start)
);

-- 16. Notifications & Push
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  read boolean not null default false,
  data jsonb default '{}'::jsonb,
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

-- 17. Stored Procedures & Atomic Functions

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

-- Automatic user profile creation on Supabase auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'public'::user_role)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    role = coalesce(excluded.role, profiles.role);
  return new;
end;
$$;

do $$ begin
  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
exception when others then null; end $$;

-- 18. Row-Level Security (RLS) Configuration
alter table profiles enable row level security;
alter table hotels enable row level security;
alter table ngos enable row level security;
alter table volunteers enable row level security;
alter table listings enable row level security;
alter table pickups enable row level security;
alter table location_pings enable row level security;
alter table tags enable row level security;
alter table pickup_tags enable row level security;
alter table flags enable row level security;
alter table admin_actions enable row level security;
alter table settings enable row level security;
alter table score_snapshots enable row level security;
alter table certificates enable row level security;
alter table news_items enable row level security;
alter table follows enable row level security;
alter table kudos enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;

-- Permissive RLS Policies for Development & Production Operations

-- Profiles: Anyone can view, user can insert/update own
create policy "Allow public read profiles" on profiles for select using (true);
create policy "Allow insert own profile" on profiles for insert with check (true);
create policy "Allow update own profile" on profiles for update using (true);

-- Hotels: Public read, owners insert/update
create policy "Allow public read hotels" on hotels for select using (true);
create policy "Allow insert hotels" on hotels for insert with check (true);
create policy "Allow update hotels" on hotels for update using (true);

-- NGOs: Public read, owners insert/update
create policy "Allow public read ngos" on ngos for select using (true);
create policy "Allow insert ngos" on ngos for insert with check (true);
create policy "Allow update ngos" on ngos for update using (true);

-- Volunteers: Public read, coordinators insert/update
create policy "Allow read volunteers" on volunteers for select using (true);
create policy "Allow insert volunteers" on volunteers for insert with check (true);
create policy "Allow update volunteers" on volunteers for update using (true);

-- Listings: Public read, hotels insert, involved update
create policy "Allow public read listings" on listings for select using (true);
create policy "Allow insert listings" on listings for insert with check (true);
create policy "Allow update listings" on listings for update using (true);

-- Pickups: Authenticated read & update
create policy "Allow read pickups" on pickups for select using (true);
create policy "Allow insert pickups" on pickups for insert with check (true);
create policy "Allow update pickups" on pickups for update using (true);

-- Location Pings: Read & Insert
create policy "Allow read location pings" on location_pings for select using (true);
create policy "Allow insert location pings" on location_pings for insert with check (true);

-- Tags: Public read
create policy "Allow read tags" on tags for select using (true);
create policy "Allow read pickup_tags" on pickup_tags for select using (true);
create policy "Allow insert pickup_tags" on pickup_tags for insert with check (true);

-- Flags: Read & Write
create policy "Allow read flags" on flags for select using (true);
create policy "Allow insert flags" on flags for insert with check (true);
create policy "Allow update flags" on flags for update using (true);

-- Settings & Score Snapshots & Certificates & News: Public read
create policy "Allow read settings" on settings for select using (true);
create policy "Allow update settings" on settings for update using (true);
create policy "Allow read scores" on score_snapshots for select using (true);
create policy "Allow insert scores" on score_snapshots for insert with check (true);
create policy "Allow update scores" on score_snapshots for update using (true);
create policy "Allow read certs" on certificates for select using (true);
create policy "Allow read news" on news_items for select using (true);
create policy "Allow insert news" on news_items for insert with check (true);
create policy "Allow update news" on news_items for update using (true);

-- Social & Notifications
create policy "Allow read follows" on follows for select using (true);
create policy "Allow insert follows" on follows for insert with check (true);
create policy "Allow delete follows" on follows for delete using (true);
create policy "Allow read kudos" on kudos for select using (true);
create policy "Allow insert kudos" on kudos for insert with check (true);
create policy "Allow read notifications" on notifications for select using (true);
create policy "Allow insert notifications" on notifications for insert with check (true);
create policy "Allow update notifications" on notifications for update using (true);

-- 19. Enable Supabase Realtime for Core Tables
do $$ begin
  alter publication supabase_realtime add table listings;
  alter publication supabase_realtime add table pickups;
  alter publication supabase_realtime add table notifications;
  alter publication supabase_realtime add table location_pings;
exception when others then null; end $$;
-- ====================================================================
-- FoodRescue Database Starter Seed Data
-- ====================================================================

-- 1. Profiles
insert into profiles (id, role, full_name, phone, email, avatar_url, created_at)
values
  ('11111111-1111-4111-a111-111111111111', 'hotel', 'Chef Rajesh Nair', '+91 98450 12345', 'kitchen@grandpalace.com', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150', now() - interval '60 days'),
  ('11111111-1111-4111-a111-222222222222', 'hotel', 'Anita Roy', '+91 98450 23456', 'manager@spiceroutebistro.com', 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150', now() - interval '50 days'),
  ('11111111-1111-4111-a111-333333333333', 'hotel', 'Vikram Mehta', '+91 98450 34567', 'events@royalpalms.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', now() - interval '45 days'),
  ('22222222-2222-4222-a222-111111111111', 'ngo', 'Sister Teresa Maria', '+91 99000 11111', 'coordinator@robinhoodkitchen.org', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', now() - interval '70 days'),
  ('22222222-2222-4222-a222-222222222222', 'ngo', 'Kavita Menon', '+91 99000 22222', 'contact@hopeshelter.org', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', now() - interval '65 days'),
  ('33333333-3333-4333-a333-111111111111', 'volunteer', 'Arun Kumar', '+91 97400 55555', 'arun.k@volunteer.org', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', now() - interval '30 days'),
  ('44444444-4444-4444-a444-111111111111', 'admin', 'Super Admin (Compliance Officer)', '+91 98000 00000', 'admin@foodrescue.org', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', now() - interval '90 days')
on conflict (id) do nothing;

-- 2. Hotels
insert into hotels (id, owner_id, name, slug, venue_type, address, lat, lng, rooms, seats, banquet_capacity, events_per_month, operating_days_per_week, status, public_listing)
values
  ('aaaaaaaa-aaaa-4aaa-aaaa-111111111111', '11111111-1111-4111-a111-111111111111', 'The Grand Palace Hotel', 'grand-palace-hotel', 'hotel', '24 MG Road, Ashok Nagar, Bengaluru 560001', 12.9756, 77.6067, 180, 120, 450, 8, 7, 'approved', true),
  ('aaaaaaaa-aaaa-4aaa-aaaa-222222222222', '11111111-1111-4111-a111-222222222222', 'Spice Route Bistro & Catering', 'spice-route-bistro', 'restaurant', '102 100ft Road, Indiranagar, Bengaluru 560038', 12.9719, 77.6412, 0, 95, 0, 12, 6, 'approved', true),
  ('aaaaaaaa-aaaa-4aaa-aaaa-333333333333', '11111111-1111-4111-a111-333333333333', 'Royal Palms Banquets & Convention', 'royal-palms-banquets', 'banquet_hall', '14 Outer Ring Road, Bellandur, Bengaluru 560103', 12.9279, 77.6811, 0, 0, 800, 16, 7, 'approved', true)
on conflict (id) do nothing;

-- 3. NGOs
insert into ngos (id, owner_id, name, registration_no, address, lat, lng, capacity_portions, service_radius_km, trust_score, status)
values
  ('bbbbbbbb-bbbb-4bbb-bbbb-111111111111', '22222222-2222-4222-a222-111111111111', 'Robin Hood Community Kitchen', 'NGO-BLR-2021-4892', '12 Victoria Road, Austin Town, Bengaluru 560047', 12.9645, 77.6189, 500, 12, 0.98, 'approved'),
  ('bbbbbbbb-bbbb-4bbb-bbbb-222222222222', '22222222-2222-4222-a222-222222222222', 'Hope Shelter Feeding Project', 'NGO-BLR-2019-1102', '55 1st Cross, Ulsoor, Bengaluru 560008', 12.9812, 77.6255, 350, 10, 0.95, 'approved')
on conflict (id) do nothing;

-- 4. Volunteers
insert into volunteers (id, profile_id, ngo_id, name, phone, vehicle, active)
values
  ('cccccccc-cccc-4ccc-cccc-111111111111', '33333333-3333-4333-a333-111111111111', 'bbbbbbbb-bbbb-4bbb-bbbb-111111111111', 'Arun Kumar', '+91 97400 55555', 'Scooter with Insulated Thermal Box (50L)', true)
on conflict (id) do nothing;

-- 5. Active Live Listings
insert into listings (id, hotel_id, title, description, diet, portions_listed, cooked_at, pickup_by, packaging_notes, safety_confirmed, status)
values
  ('dddddddd-dddd-4ddd-dddd-111111111111', 'aaaaaaaa-aaaa-4aaa-aaaa-111111111111', 'Executive Lunch Buffet Surplus & Steamed Basmati', 'Includes Dal Makhani, Paneer Butter Masala, Mixed Veg Curry, and Naan breads. Temperature maintained at 65°C.', 'veg', 45, now() - interval '1 hour', now() + interval '2 hours', 'Stored in 3 clean SS milk cans and foil boxes. Collect at Service Ramp #2.', true, 'posted'),
  ('dddddddd-dddd-4ddd-dddd-222222222222', 'aaaaaaaa-aaaa-4aaa-aaaa-222222222222', 'Continental Pastries, Sandwiches & Quiches', 'Assorted mini rolls, cheese croissants, vegetable cutlets from high-tea event.', 'veg', 30, now() - interval '45 minutes', now() + interval '3 hours', 'Boxed in eco-friendly biodegradable pastry boxes.', true, 'posted'),
  ('dddddddd-dddd-4ddd-dddd-333333333333', 'aaaaaaaa-aaaa-4aaa-aaaa-333333333333', 'Wedding Reception Biryani Feast & Chicken Curry', 'High quality Awadhi Dum Biryani prepared for banquet of 600. Untouched batch.', 'non_veg', 75, now() - interval '1.5 hours', now() + interval '1.5 hours', 'Packed in large food-grade insulated catering containers. Bring a two-wheeler with crate.', true, 'posted')
on conflict (id) do nothing;

-- 6. Score Snapshots
insert into score_snapshots (id, hotel_id, period_start, period_end, completed_pickups, portions_rescued, rescue_rate, participation, listing_accuracy, handoff_quality, left_behind, composite, tier, rank_in_category, eligible, streak_weeks)
values
  ('eeeeeeee-eeee-4eee-eeee-111111111111', 'aaaaaaaa-aaaa-4aaa-aaaa-111111111111', current_date - 60, current_date, 34, 1820, 0.94, 0.92, 0.96, 0.95, 0.02, 94.8, 'forest', 1, true, 8),
  ('eeeeeeee-eeee-4eee-eeee-222222222222', 'aaaaaaaa-aaaa-4aaa-aaaa-222222222222', current_date - 60, current_date, 22, 980, 0.89, 0.85, 0.91, 0.93, 0.04, 88.4, 'canopy', 2, true, 5),
  ('eeeeeeee-eeee-4eee-eeee-333333333333', 'aaaaaaaa-aaaa-4aaa-aaaa-333333333333', current_date - 60, current_date, 18, 1450, 0.86, 0.80, 0.88, 0.90, 0.06, 84.1, 'canopy', 1, true, 3)
on conflict (id) do nothing;

-- 7. Community News Items
insert into news_items (id, source_type, title, snippet, source_name, status, pinned, published_at)
values
  ('ffffffff-ffff-4fff-ffff-111111111111', 'internal', 'The Grand Palace Reaches 1,800 Rescued Meals Milestone', 'The culinary brigade at The Grand Palace Hotel celebrated diverting over 1.8 tons of wholesome surplus banquet meals.', 'FoodRescue Impact Desk', 'published', true, now() - interval '2 days'),
  ('ffffffff-ffff-4fff-ffff-222222222222', 'external', 'Karnataka Mandates Commercial Kitchen Food Redistribution Protocols', 'State food safety commissioner issues guidelines advising hotels and wedding banquet operators to partner with accredited shelter kitchens.', 'The Hindu - City Edition', 'published', false, now() - interval '4 days')
on conflict (id) do nothing;
