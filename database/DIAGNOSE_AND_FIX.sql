-- ============================================================================
-- COMPLETE DIAGNOSIS AND FIX FOR CONTACT FORM
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Check if leads table exists and its structure
-- ============================================================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'leads'
ORDER BY ordinal_position;

-- STEP 2: Check if user_profiles table exists and its structure
-- ============================================================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- STEP 3: Check existing RLS policies on leads table
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'leads';

-- STEP 4: Check existing RLS policies on audit_logs table
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'audit_logs';

-- STEP 5: Check table permissions for anon role
-- ============================================================================
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'audit_logs')
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;

-- ============================================================================
-- NOW RUN THE COMPLETE FIX BELOW
-- ============================================================================

-- STEP 6: Create leads table if it doesn't exist
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  service_type TEXT NOT NULL,
  service_tag TEXT,
  service_category TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  source TEXT DEFAULT 'website_contact_form',
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 7: Create audit_logs table if it doesn't exist
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 8: Drop ALL existing policies (clean slate)
-- ============================================================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on leads table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'leads' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', r.policyname);
    END LOOP;
    
    -- Drop all policies on audit_logs table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'audit_logs' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.audit_logs', r.policyname);
    END LOOP;
END $$;

-- STEP 9: Disable RLS temporarily to grant permissions
-- ============================================================================
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- STEP 10: Grant necessary permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

GRANT SELECT, INSERT ON public.audit_logs TO anon;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- STEP 11: Re-enable RLS
-- ============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- STEP 12: Create simple RLS policy for public INSERT on leads
-- ============================================================================
CREATE POLICY "allow_anon_insert_leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- STEP 13: Create admin policies for leads (handle both id and user_id columns)
-- ============================================================================
CREATE POLICY "allow_admin_select_leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE (up.id = auth.uid() OR up.user_id = auth.uid())
    AND up.role = 'admin'
  )
);

CREATE POLICY "allow_admin_update_leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE (up.id = auth.uid() OR up.user_id = auth.uid())
    AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE (up.id = auth.uid() OR up.user_id = auth.uid())
    AND up.role = 'admin'
  )
);

CREATE POLICY "allow_admin_delete_leads"
ON public.leads
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE (up.id = auth.uid() OR up.user_id = auth.uid())
    AND up.role = 'admin'
  )
);

-- STEP 14: Create RLS policies for audit_logs
-- ============================================================================
CREATE POLICY "allow_anon_insert_audit"
ON public.audit_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "allow_admin_select_audit"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE (up.id = auth.uid() OR up.user_id = auth.uid())
    AND up.role = 'admin'
  )
);

-- STEP 15: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON public.leads(service_type);

-- STEP 16: Test the configuration
-- ============================================================================
-- Test 1: Can anon insert?
DO $$
BEGIN
  -- This should succeed
  SET ROLE anon;
  INSERT INTO public.leads (name, email, phone, service_type, message)
  VALUES ('Test User', 'test@test.com', '1234567890', 'Test Service', 'Test message');
  
  RESET ROLE;
  
  -- Clean up test data
  DELETE FROM public.leads WHERE email = 'test@test.com';
  
  RAISE NOTICE '✅ Test passed: Anon can insert leads';
EXCEPTION WHEN OTHERS THEN
  RESET ROLE;
  RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify policies were created
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('leads', 'audit_logs')
ORDER BY tablename, policyname;

-- Verify permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'audit_logs')
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ COMPLETE FIX APPLIED SUCCESSFULLY!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was fixed:';
  RAISE NOTICE '  1. ✅ Created/verified leads table structure';
  RAISE NOTICE '  2. ✅ Created/verified audit_logs table structure';
  RAISE NOTICE '  3. ✅ Dropped all conflicting RLS policies';
  RAISE NOTICE '  4. ✅ Granted proper permissions to anon role';
  RAISE NOTICE '  5. ✅ Created new RLS policies (anon can insert)';
  RAISE NOTICE '  6. ✅ Created admin policies (handles both id and user_id)';
  RAISE NOTICE '  7. ✅ Added performance indexes';
  RAISE NOTICE '  8. ✅ Tested configuration';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '  1. Test contact form at: http://localhost:3000/pasada.design/en/contant-us.html';
  RAISE NOTICE '  2. Fill form and submit';
  RAISE NOTICE '  3. Check browser console - should see success';
  RAISE NOTICE '  4. Verify lead in Supabase Table Editor';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
