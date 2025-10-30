-- =================================================================
-- COMPLETE FIX FOR 403 ERRORS
-- =================================================================
-- This script:
-- 1. Adds user_id column to clients table
-- 2. Creates helper functions for role checking
-- 3. Fixes all RLS policies
-- =================================================================

-- =================================================================
-- STEP 1: Add user_id column to clients table (if not exists)
-- =================================================================

DO $$ 
BEGIN
  -- Check if user_id column exists, if not, add it
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE '✅ Added user_id column to clients table';
  ELSE
    RAISE NOTICE '✓ user_id column already exists in clients table';
  END IF;
END $$;

-- =================================================================
-- STEP 2: Create helper functions for role checking
-- =================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(get_user_role() IN ('admin', 'staff'), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(get_user_role() = 'client', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =================================================================
-- STEP 3: Drop all existing policies
-- =================================================================

-- Clients policies
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
DROP POLICY IF EXISTS "Admins can create clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can archive clients" ON clients;

-- Projects policies
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- =================================================================
-- STEP 4: Create new RLS policies
-- =================================================================

-- USER PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- CLIENTS POLICIES
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (is_admin());

CREATE POLICY "Clients can view own record"
  ON clients FOR SELECT
  USING (
    is_client() AND user_id = auth.uid()
  );

CREATE POLICY "Admins can create clients"
  ON clients FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (is_admin());

-- PROJECTS POLICIES
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (is_admin());

CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  USING (
    is_client() AND EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = projects.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_admin());

-- =================================================================
-- STEP 5: Grant permissions
-- =================================================================

-- Grant SELECT on user_profiles to authenticated users
GRANT SELECT ON user_profiles TO authenticated;

-- Grant usage on helper functions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_client() TO authenticated;

-- =================================================================
-- STEP 6: Verification queries
-- =================================================================

-- Run these to verify everything works:

-- 1. Check your role
-- SELECT 
--   auth.uid() as user_id,
--   get_user_role() as my_role,
--   is_admin() as am_i_admin,
--   is_client() as am_i_client;

-- 2. Check if you can see clients (should work for admins)
-- SELECT COUNT(*) as client_count FROM clients;

-- 3. Check if you can see projects
-- SELECT COUNT(*) as project_count FROM projects;

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database structure and RLS policies updated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify your role: SELECT get_user_role();';
  RAISE NOTICE '2. Test data access: SELECT COUNT(*) FROM clients;';
  RAISE NOTICE '3. Refresh your application and login again';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Existing clients without user_id will only be visible to admins.';
  RAISE NOTICE 'To link a client to a user, run:';
  RAISE NOTICE 'UPDATE clients SET user_id = ''<user-uuid>'' WHERE id = ''<client-uuid>'';';
END $$;
