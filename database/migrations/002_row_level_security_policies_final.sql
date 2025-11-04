-- ================================================
-- Migration: Row Level Security (RLS) Policies (FINAL SAFE VERSION)
-- Purpose: Secure data access for clients and admins
-- Date: 2025-11-04
-- Note: Skips function recreation if they already exist
-- ================================================

-- Enable RLS on all tables (safe - won't error if already enabled)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- USER PROFILES POLICIES
-- ================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ================================================
-- CLIENTS POLICIES
-- ================================================

DROP POLICY IF EXISTS "Clients can view own record" ON clients;
DROP POLICY IF EXISTS "Admins and staff can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins and staff can insert clients" ON clients;
DROP POLICY IF EXISTS "Admins and staff can update clients" ON clients;
DROP POLICY IF EXISTS "Only admins can delete clients" ON clients;

-- Clients can view their own client record
CREATE POLICY "Clients can view own record"
ON clients FOR SELECT
USING (
  id IN (
    SELECT client_id FROM user_profiles
    WHERE id = auth.uid() AND role = 'client'
  )
);

-- Admins and staff can view all clients
CREATE POLICY "Admins and staff can view all clients"
ON clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admins and staff can insert clients
CREATE POLICY "Admins and staff can insert clients"
ON clients FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admins and staff can update clients
CREATE POLICY "Admins and staff can update clients"
ON clients FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Only admins can delete clients
CREATE POLICY "Only admins can delete clients"
ON clients FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ================================================
-- PROJECTS POLICIES
-- ================================================

DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
DROP POLICY IF EXISTS "Admins and staff can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins and staff can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins and staff can update projects" ON projects;
DROP POLICY IF EXISTS "Only admins can delete projects" ON projects;

-- Clients can view their own projects
CREATE POLICY "Clients can view own projects"
ON projects FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles
    WHERE id = auth.uid() AND role = 'client'
  )
);

-- Admins and staff can view all projects
CREATE POLICY "Admins and staff can view all projects"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admins and staff can insert projects
CREATE POLICY "Admins and staff can insert projects"
ON projects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admins and staff can update projects
CREATE POLICY "Admins and staff can update projects"
ON projects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Only admins can delete projects
CREATE POLICY "Only admins can delete projects"
ON projects FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ================================================
-- QUOTATIONS POLICIES
-- ================================================

DROP POLICY IF EXISTS "Clients can view own quotations" ON quotations;
DROP POLICY IF EXISTS "Admins and staff can view all quotations" ON quotations;
DROP POLICY IF EXISTS "Admins and staff can insert quotations" ON quotations;
DROP POLICY IF EXISTS "Admins and staff can update quotations" ON quotations;
DROP POLICY IF EXISTS "Only admins can delete quotations" ON quotations;

-- Clients can view their own quotations
CREATE POLICY "Clients can view own quotations"
ON quotations FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles
    WHERE id = auth.uid() AND role = 'client'
  )
);

-- Admins and staff can view all quotations
CREATE POLICY "Admins and staff can view all quotations"
ON quotations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admins and staff can insert quotations
CREATE POLICY "Admins and staff can insert quotations"
ON quotations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admins and staff can update quotations
CREATE POLICY "Admins and staff can update quotations"
ON quotations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Only admins can delete quotations
CREATE POLICY "Only admins can delete quotations"
ON quotations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ================================================
-- QUOTE ITEMS POLICIES
-- ================================================

DROP POLICY IF EXISTS "Clients can view own quote items" ON quote_items;
DROP POLICY IF EXISTS "Admins and staff can view all quote items" ON quote_items;
DROP POLICY IF EXISTS "Admins and staff can manage quote items" ON quote_items;

-- Clients can view quote items for their quotations
CREATE POLICY "Clients can view own quote items"
ON quote_items FOR SELECT
USING (
  quotation_id IN (
    SELECT id FROM quotations
    WHERE client_id IN (
      SELECT client_id FROM user_profiles
      WHERE id = auth.uid() AND role = 'client'
    )
  )
);

-- Admins and staff can view all quote items
CREATE POLICY "Admins and staff can view all quote items"
ON quote_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Admins and staff can manage quote items
CREATE POLICY "Admins and staff can manage quote items"
ON quote_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- ================================================
-- BOOKINGS POLICIES
-- ================================================

DROP POLICY IF EXISTS "Clients can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins and staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins and staff can manage bookings" ON bookings;

-- Clients can view their own bookings
CREATE POLICY "Clients can view own bookings"
ON bookings FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles
    WHERE id = auth.uid() AND role = 'client'
  )
);

-- Admins and staff can view all bookings
CREATE POLICY "Admins and staff can view all bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Clients can create their own bookings
CREATE POLICY "Clients can create own bookings"
ON bookings FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_profiles
    WHERE id = auth.uid() AND role = 'client'
  )
);

-- Admins and staff can manage all bookings
CREATE POLICY "Admins and staff can manage bookings"
ON bookings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- ================================================
-- HELPER FUNCTIONS (Only create if they don't exist)
-- ================================================

-- Note: We're NOT dropping existing functions because they're used by other policies
-- The functions already exist and work correctly, so we skip recreation

-- Check if functions exist, create only if missing
DO $$
BEGIN
  -- Create is_admin() if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    CREATE FUNCTION is_admin()
    RETURNS BOOLEAN AS $func$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      );
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin role';
  END IF;

  -- Create is_staff_or_admin() if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_staff_or_admin') THEN
    CREATE FUNCTION is_staff_or_admin()
    RETURNS BOOLEAN AS $func$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'staff')
      );
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    COMMENT ON FUNCTION is_staff_or_admin() IS 'Check if current user has staff or admin role';
  END IF;

  -- Create get_user_client_id() if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_client_id') THEN
    CREATE FUNCTION get_user_client_id()
    RETURNS UUID AS $func$
    BEGIN
      RETURN (
        SELECT client_id FROM user_profiles
        WHERE id = auth.uid() AND role = 'client'
        LIMIT 1
      );
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    COMMENT ON FUNCTION get_user_client_id() IS 'Get client_id for current user if they are a client';
  END IF;
END $$;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify RLS is enabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'quotations', 'bookings', 'user_profiles', 'quote_items')
ORDER BY tablename;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as "Policy Count"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- List all policies for client-related tables
SELECT 
  tablename as "Table",
  policyname as "Policy Name",
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('clients', 'projects', 'quotations', 'bookings', 'user_profiles', 'quote_items')
ORDER BY tablename, policyname;
