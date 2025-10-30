-- =================================================================
-- FIX 403 ERRORS - RLS POLICIES WITH PROPER ROLE CHECKING
-- =================================================================
-- This fixes the issue where auth.jwt() doesn't contain custom roles
-- Instead, we check the user_profiles table directly
-- =================================================================

-- =================================================================
-- HELPER FUNCTION: Get user role from database
-- =================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('admin', 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'client';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =================================================================
-- DROP ALL EXISTING POLICIES
-- =================================================================

DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
DROP POLICY IF EXISTS "Admins can create clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can archive clients" ON clients;

DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

-- =================================================================
-- CLIENTS POLICIES (FIXED)
-- =================================================================

CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (is_admin());

CREATE POLICY "Clients can view own record"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can create clients"
  ON clients FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can archive clients"
  ON clients FOR DELETE
  USING (is_admin());

-- =================================================================
-- PROJECTS POLICIES (FIXED)
-- =================================================================

CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (is_admin());

CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
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
-- VERIFICATION QUERY
-- =================================================================

-- Run this to verify your role:
-- SELECT get_user_role() as my_role, is_admin() as am_i_admin, is_client() as am_i_client;

-- Test if you can see clients:
-- SELECT * FROM clients LIMIT 1;

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies Fixed! The 403 errors should be resolved.';
  RAISE NOTICE 'Run: SELECT get_user_role() to verify your role';
END $$;
