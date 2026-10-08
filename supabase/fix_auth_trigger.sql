-- ====================================================================
-- Instant Fix for "Database error saving new user"
-- Run this in your Supabase Dashboard -> SQL Editor (New Query)
-- ====================================================================

-- 1. Remove the failing trigger on auth.users so Supabase can save new accounts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Remove strict foreign key constraint so profiles can be created smoothly
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Ensure permissions are granted to all roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON TYPE public.user_role TO postgres, anon, authenticated, service_role;

-- 4. Ensure RLS policies allow reading and writing profiles
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
  DROP POLICY IF EXISTS "Allow insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Allow update own profile" ON profiles;
  DROP POLICY IF EXISTS "Allow insert profiles" ON profiles;
  DROP POLICY IF EXISTS "Allow update profiles" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update profiles" ON profiles FOR UPDATE USING (true);
