-- ============================================================================
-- DIAGNOSTIC SCRIPT - Check What Exists in Database
-- ============================================================================
-- Run this FIRST in Supabase Dashboard → SQL Editor
-- This will show you exactly what's already there
-- ============================================================================

-- Check 1: List all tables in public schema
-- ============================================================================
SELECT 
  '=== EXISTING TABLES ===' as info,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check 2: Check if specific tables exist
-- ============================================================================
SELECT 
  '=== TARGET TABLES STATUS ===' as info,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
    THEN '✅ user_profiles EXISTS'
    ELSE '❌ user_profiles MISSING'
  END as user_profiles_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads' AND table_schema = 'public')
    THEN '✅ leads EXISTS'
    ELSE '❌ leads MISSING'
  END as leads_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public')
    THEN '✅ audit_logs EXISTS'
    ELSE '❌ audit_logs MISSING'
  END as audit_logs_status;

-- Check 3: If user_profiles exists, show its structure
-- ============================================================================
SELECT 
  '=== USER_PROFILES COLUMNS ===' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check 4: If leads exists, show its structure
-- ============================================================================
SELECT 
  '=== LEADS COLUMNS ===' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leads' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check 5: If audit_logs exists, show its structure
-- ============================================================================
SELECT 
  '=== AUDIT_LOGS COLUMNS ===' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check 6: List all RLS policies
-- ============================================================================
SELECT 
  '=== EXISTING RLS POLICIES ===' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check 7: List all indexes
-- ============================================================================
SELECT 
  '=== EXISTING INDEXES ===' as info,
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check 8: List all foreign key constraints
-- ============================================================================
SELECT 
  '=== FOREIGN KEY CONSTRAINTS ===' as info,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check 9: List all triggers
-- ============================================================================
SELECT 
  '=== EXISTING TRIGGERS ===' as info,
  trigger_schema,
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check 10: List all functions
-- ============================================================================
SELECT 
  '=== EXISTING FUNCTIONS ===' as info,
  routine_schema,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check 11: List all views
-- ============================================================================
SELECT 
  '=== EXISTING VIEWS ===' as info,
  table_schema,
  table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check 12: Check RLS status
-- ============================================================================
SELECT 
  '=== RLS STATUS ===' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- SUMMARY
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== DIAGNOSTIC COMPLETE ===';
  RAISE NOTICE 'Review the results above to see:';
  RAISE NOTICE '1. Which tables exist';
  RAISE NOTICE '2. Table structures (columns)';
  RAISE NOTICE '3. Existing RLS policies';
  RAISE NOTICE '4. Indexes and constraints';
  RAISE NOTICE '5. Triggers and functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Based on these results, we can create the correct migration script.';
END $$;
