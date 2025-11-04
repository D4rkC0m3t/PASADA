-- ============================================
-- EMERGENCY FIX: Remove Duplicate RLS Policies
-- Run this FIRST before running FIX_ALL_ERRORS.sql
-- ============================================

-- Show current policies (for reference)
SELECT 'BEFORE CLEANUP - Current policies:' as status;
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

-- ============================================
-- DROP ALL DUPLICATE POLICIES
-- ============================================

-- Drop authenticated role policies
DROP POLICY IF EXISTS "Allow authenticated users to read projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON projects;

-- Drop public role policies (duplicates causing conflicts)
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

-- ============================================
-- CREATE CLEAN, NON-CONFLICTING POLICIES
-- ============================================

-- Simple authenticated user policies (works for all authenticated users)
CREATE POLICY "Allow authenticated users to read projects"
    ON projects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert projects"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete projects"
    ON projects FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'AFTER CLEANUP - New policies:' as status;
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

-- Count check
SELECT 'Total policies on projects table:' as info, COUNT(*) as count
FROM pg_policies
WHERE tablename = 'projects';

-- ============================================
-- SUCCESS! 
-- Should now have exactly 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- All for 'authenticated' role only
-- ============================================
