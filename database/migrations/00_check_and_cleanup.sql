-- Check and Cleanup Script
-- Run this FIRST to see what exists and optionally clean up

-- ============================================================================
-- 1. CHECK WHAT EXISTS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== CHECKING EXISTING TABLES ===';
  
  -- Check leads table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads') THEN
    RAISE NOTICE '✅ leads table EXISTS';
  ELSE
    RAISE NOTICE '❌ leads table DOES NOT EXIST';
  END IF;
  
  -- Check audit_logs table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    RAISE NOTICE '✅ audit_logs table EXISTS';
  ELSE
    RAISE NOTICE '❌ audit_logs table DOES NOT EXIST';
  END IF;
  
  -- Check user_profiles table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    RAISE NOTICE '✅ user_profiles table EXISTS';
  ELSE
    RAISE NOTICE '❌ user_profiles table DOES NOT EXIST (REQUIRED!)';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== CHECKING COLUMNS IN LEADS (if exists) ===';
END $$;

-- Show leads table structure (if exists)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- Show audit_logs table structure (if exists)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. OPTIONAL CLEANUP (Uncomment to use)
-- ============================================================================

-- ⚠️ WARNING: Uncomment the lines below ONLY if you want to DELETE everything
-- and start fresh. This will remove ALL data!

/*
-- Drop views
DROP VIEW IF EXISTS lead_analytics CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_log_lead_update ON leads;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;

-- Drop functions
DROP FUNCTION IF EXISTS log_lead_update() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "Allow public to insert leads" ON leads;
DROP POLICY IF EXISTS "Admins can read all leads" ON leads;
DROP POLICY IF EXISTS "Admins can update leads" ON leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON leads;
DROP POLICY IF EXISTS "Allow system to insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;

-- Drop tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE '🗑️ All tables, views, triggers, and policies have been dropped';
  RAISE NOTICE '✅ You can now run the main migration: 20251101_create_leads_and_audit_system.sql';
END $$;
*/

-- ============================================================================
-- 3. INSTRUCTIONS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== NEXT STEPS ===';
  RAISE NOTICE '';
  RAISE NOTICE 'If you see errors above or tables dont exist:';
  RAISE NOTICE '1. Uncomment the CLEANUP section above (remove /* and */)';
  RAISE NOTICE '2. Run this script again to clean up';
  RAISE NOTICE '3. Then run: 20251101_create_leads_and_audit_system.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'If everything looks good:';
  RAISE NOTICE '1. Run: 20251101_create_leads_and_audit_system.sql';
  RAISE NOTICE '';
END $$;
