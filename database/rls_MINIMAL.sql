-- =================================================================
-- MINIMAL RLS SETUP - SAFE TO RUN ANYTIME
-- =================================================================
--
-- This script ONLY:
-- 1. Enables RLS on existing tables
-- 2. Creates helper functions
-- 3. Does NOT create any policies (do that manually later)
--
-- Safe to run even if columns don't match yet
-- =================================================================

-- =================================================================
-- ENABLE RLS ON ALL TABLES (if they exist)
-- =================================================================

DO $$ 
BEGIN
  -- Enable RLS on clients table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Enabled RLS on clients table';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Enabled RLS on projects table';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Enabled RLS on materials table';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotations') THEN
    ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Enabled RLS on quotations table';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotation_items') THEN
    ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Enabled RLS on quotation_items table';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Enabled RLS on bookings table';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Enabled RLS on user_profiles table';
  END IF;
END $$;

-- =================================================================
-- HELPER FUNCTIONS
-- =================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_access_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.id = project_id
    AND c.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- DONE - RLS ENABLED
-- =================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS enabled on all existing tables';
  RAISE NOTICE '⚠️  No policies created yet - add them manually based on your schema';
END $$;
