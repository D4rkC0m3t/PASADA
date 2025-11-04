-- ================================================
-- Migration: Row Level Security (RLS) Policies
-- Purpose: Secure data access for clients and admins
-- Date: 2025-11-04
-- ================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- USER PROFILES POLICIES
-- ================================================

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
-- HELPER FUNCTIONS
-- ================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is staff or admin
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's client_id
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT client_id FROM user_profiles
    WHERE id = auth.uid() AND role = 'client'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin role';
COMMENT ON FUNCTION is_staff_or_admin() IS 'Check if current user has staff or admin role';
COMMENT ON FUNCTION get_user_client_id() IS 'Get client_id for current user if they are a client';
