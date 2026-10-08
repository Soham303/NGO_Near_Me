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
