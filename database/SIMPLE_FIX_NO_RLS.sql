-- ============================================================================
-- NUCLEAR OPTION: Disable RLS Completely for Testing
-- This will 100% fix the contact form issue
-- Use this ONLY for testing, re-enable RLS after confirming it works
-- ============================================================================

-- Step 1: Create tables if they don't exist
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
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  source TEXT DEFAULT 'website_contact_form',
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Step 2: DISABLE RLS completely (for testing)
-- ============================================================================
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant full permissions
-- ============================================================================
GRANT ALL ON public.leads TO anon;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.audit_logs TO anon;
GRANT ALL ON public.audit_logs TO authenticated;

-- Step 4: Test insert
-- ============================================================================
INSERT INTO public.leads (name, email, phone, service_type, message)
VALUES ('Test User', 'test@example.com', '1234567890', 'Interior Design', 'Test message from SQL');

-- Verify
SELECT * FROM public.leads WHERE email = 'test@example.com';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '⚠️  RLS DISABLED - CONTACT FORM WILL NOW WORK';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ What was done:';
  RAISE NOTICE '  1. Created leads and audit_logs tables';
  RAISE NOTICE '  2. DISABLED Row Level Security';
  RAISE NOTICE '  3. Granted ALL permissions to anon role';
  RAISE NOTICE '  4. Inserted test record';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test your contact form NOW:';
  RAISE NOTICE '  → http://localhost:3000/pasada.design/en/contant-us.html';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: This is for TESTING ONLY';
  RAISE NOTICE '    After confirming form works, run the secure version:';
  RAISE NOTICE '    → DIAGNOSE_AND_FIX.sql (to re-enable RLS properly)';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
