-- ================================================
-- Migration: Cleanup Duplicate/Old RLS Policies
-- Purpose: Remove old policies that are now redundant
-- Date: 2025-11-04
-- ================================================

-- Remove old "Allow authenticated users" policies from projects
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to read projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON projects;

-- Remove duplicate admin policies from clients (keep the "Admins and staff" versions)
DROP POLICY IF EXISTS "Admins can create clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

-- Remove old staff-specific policies from quote_items (we have "Admins and staff" now)
DROP POLICY IF EXISTS "Staff can delete quote items" ON quote_items;
DROP POLICY IF EXISTS "Staff can insert quote items" ON quote_items;
DROP POLICY IF EXISTS "Staff can update quote items" ON quote_items;
DROP POLICY IF EXISTS "Staff can view quote items" ON quote_items;

-- Verify cleanup
SELECT 
  tablename as "Table",
  COUNT(*) as "Policy Count"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('clients', 'projects', 'quotations', 'bookings', 'user_profiles', 'quote_items')
GROUP BY tablename
ORDER BY tablename;

-- Show remaining policies
SELECT 
  tablename as "Table",
  policyname as "Policy Name",
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('clients', 'projects', 'quotations', 'bookings', 'user_profiles', 'quote_items')
ORDER BY tablename, policyname;
