-- ============================================================================
-- FIX: Contact Form RLS Policy
-- Date: 2025-11-01
-- Issue: Contact form submissions failing with RLS policy violation (42501)
-- Solution: Drop conflicting policies and recreate with proper permissions
-- ============================================================================

-- Step 1: Drop all existing policies on leads table
-- ============================================================================
DROP POLICY IF EXISTS "Allow public to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public lead submission" ON public.leads;
DROP POLICY IF EXISTS "Admins can read all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view assigned leads" ON public.leads;

-- Step 2: Grant necessary permissions to anon and authenticated roles
-- ============================================================================
GRANT SELECT, INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

-- Step 3: Recreate RLS policies with correct configuration
-- ============================================================================

-- Policy 1: Allow anonymous users to insert leads from contact form
CREATE POLICY "allow_public_insert_leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Allow admins to read all leads
CREATE POLICY "allow_admin_read_leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Policy 3: Allow admins to update leads
CREATE POLICY "allow_admin_update_leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Policy 4: Allow admins to delete leads
CREATE POLICY "allow_admin_delete_leads"
ON public.leads
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Step 4: Verify RLS is enabled
-- ============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify audit_logs policies as well
-- ============================================================================
DROP POLICY IF EXISTS "Allow system to insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "allow_public_insert_audit" ON public.audit_logs;

GRANT SELECT, INSERT ON public.audit_logs TO anon;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

CREATE POLICY "allow_public_insert_audit"
ON public.audit_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "allow_admin_read_audit"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Contact Form RLS Fix Applied Successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Changes made:';
  RAISE NOTICE '  1. ✅ Dropped all conflicting RLS policies on leads table';
  RAISE NOTICE '  2. ✅ Granted INSERT permission to anon role';
  RAISE NOTICE '  3. ✅ Created new policy: allow_public_insert_leads';
  RAISE NOTICE '  4. ✅ Created admin policies for read/update/delete';
  RAISE NOTICE '  5. ✅ Fixed audit_logs policies';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test your contact form now:';
  RAISE NOTICE '  - Visit: http://localhost:3000/pasada.design/en/contant-us.html';
  RAISE NOTICE '  - Fill form and submit';
  RAISE NOTICE '  - Check browser console for success message';
  RAISE NOTICE '  - Verify lead appears in database';
  RAISE NOTICE '';
  RAISE NOTICE '📊 To verify policies are active:';
  RAISE NOTICE '  SELECT * FROM pg_policies WHERE tablename = ''leads'';';
END $$;
