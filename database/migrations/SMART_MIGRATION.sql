-- ============================================================================
-- PASADA CRM - Smart Migration (Based on Actual Database State)
-- ============================================================================
-- Detected State:
-- ✅ user_profiles EXISTS (RLS disabled)
-- ❌ leads MISSING
-- ❌ audit_logs MISSING
-- ============================================================================

-- Step 1: Enable RLS on user_profiles (it's currently disabled)
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Add missing columns to user_profiles (if they don't exist)
-- ============================================================================
DO $$ 
BEGIN
  -- Add user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN user_id UUID UNIQUE;
    
    -- Populate user_id from id for existing records
    UPDATE public.user_profiles SET user_id = id WHERE user_id IS NULL;
    
    -- Make it NOT NULL after populating
    ALTER TABLE public.user_profiles ALTER COLUMN user_id SET NOT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT fk_user_profiles_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client', 'staff'));
  END IF;
END $$;

-- Step 3: Create indexes on user_profiles
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Step 4: Create leads table (NEW)
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

-- Create indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_service_tag ON public.leads(service_tag);
CREATE INDEX IF NOT EXISTS idx_leads_service_category ON public.leads(service_category);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Step 5: Create audit_logs table (NEW)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  user_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for audit_logs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_audit_logs_user_id'
  ) THEN
    ALTER TABLE public.audit_logs 
    ADD CONSTRAINT fk_audit_logs_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 6: Create/update trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create triggers
-- ============================================================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 8: Grant permissions
-- ============================================================================
GRANT SELECT, INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO anon;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

-- Step 9: Drop existing policies (safe now that tables exist)
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can read all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Allow system to insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;

-- Step 10: Create RLS Policies
-- ============================================================================

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (
  CASE 
    WHEN user_id IS NOT NULL THEN user_id = auth.uid()
    ELSE id = auth.uid()
  END
);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN user_id IS NOT NULL THEN user_id = auth.uid()
    ELSE id = auth.uid()
  END
);

CREATE POLICY "Admins can read all profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE (up.user_id = auth.uid() OR up.id = auth.uid())
    AND up.role = 'admin'
  )
);

-- Policies for leads
CREATE POLICY "Allow public to insert leads"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read all leads"
ON public.leads FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE (user_profiles.user_id = auth.uid() OR user_profiles.id = auth.uid())
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE (user_profiles.user_id = auth.uid() OR user_profiles.id = auth.uid())
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE (user_profiles.user_id = auth.uid() OR user_profiles.id = auth.uid())
    AND user_profiles.role = 'admin'
  )
);

-- Policies for audit_logs
CREATE POLICY "Allow system to insert audit logs"
ON public.audit_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE (user_profiles.user_id = auth.uid() OR user_profiles.id = auth.uid())
    AND user_profiles.role = 'admin'
  )
);

-- Step 11: Create analytics view
-- ============================================================================
CREATE OR REPLACE VIEW public.lead_analytics AS
SELECT 
  service_category,
  service_tag,
  service_type,
  priority,
  status,
  source,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_leads,
  COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_leads,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_time_hours,
  DATE_TRUNC('day', created_at) as date
FROM public.leads
GROUP BY service_category, service_tag, service_type, priority, status, source, DATE_TRUNC('day', created_at);

GRANT SELECT ON public.lead_analytics TO authenticated;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Smart migration completed successfully!';
  RAISE NOTICE '📊 Updated: user_profiles (enabled RLS, added columns)';
  RAISE NOTICE '📊 Created: leads table';
  RAISE NOTICE '📊 Created: audit_logs table';
  RAISE NOTICE '📈 Created: lead_analytics view';
  RAISE NOTICE '🔐 Enabled: Row Level Security with policies';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Set admin role: UPDATE public.user_profiles SET role = ''admin'' WHERE email = ''your@email.com'';';
  RAISE NOTICE '2. Test contact form submission';
  RAISE NOTICE '3. Verify leads appear in dashboard';
END $$;
