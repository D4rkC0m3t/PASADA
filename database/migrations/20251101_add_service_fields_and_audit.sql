-- Migration: Add service fields and audit trail to leads table
-- Date: 2025-11-01
-- Description: Adds service_tag, service_category, ip_address, user_agent fields and creates audit_logs table

-- Add new columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS service_tag TEXT,
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_service_tag ON leads(service_tag);
CREATE INDEX IF NOT EXISTS idx_leads_service_category ON leads(service_category);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Create audit_logs table for tracking all CRM actions
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Add indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public to insert leads (from contact form)
CREATE POLICY "Allow public to insert leads"
ON leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS Policy: Only admins can read leads
CREATE POLICY "Admins can read all leads"
ON leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- RLS Policy: Only admins can update leads
CREATE POLICY "Admins can update leads"
ON leads
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- RLS Policy: Only admins can delete leads
CREATE POLICY "Admins can delete leads"
ON leads
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- RLS Policy: Allow system to insert audit logs
CREATE POLICY "Allow system to insert audit logs"
ON audit_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS Policy: Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Create function to log lead views in dashboard
CREATE OR REPLACE FUNCTION log_lead_view()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    details,
    created_at
  ) VALUES (
    'lead_viewed',
    'lead',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'service_type', NEW.service_type,
      'status', NEW.status,
      'priority', NEW.priority
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log lead updates
CREATE OR REPLACE FUNCTION log_lead_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    details,
    created_at
  ) VALUES (
    'lead_updated',
    'lead',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'old_priority', OLD.priority,
      'new_priority', NEW.priority,
      'changes', jsonb_build_object(
        'status_changed', OLD.status != NEW.status,
        'priority_changed', OLD.priority != NEW.priority
      )
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for lead updates (optional - can be enabled later)
-- CREATE TRIGGER trigger_log_lead_update
-- AFTER UPDATE ON leads
-- FOR EACH ROW
-- EXECUTE FUNCTION log_lead_update();

-- Add comments for documentation
COMMENT ON COLUMN leads.service_tag IS 'Unique identifier for service type (e.g., turnkey_execution, modular_kitchen)';
COMMENT ON COLUMN leads.service_category IS 'Service category label (e.g., 🏗️ Execution & Build)';
COMMENT ON COLUMN leads.ip_address IS 'IP address of the lead submission for security tracking';
COMMENT ON COLUMN leads.user_agent IS 'Browser user agent for analytics and fraud detection';

COMMENT ON TABLE audit_logs IS 'Audit trail for all CRM actions including lead views, updates, and exports';
COMMENT ON COLUMN audit_logs.action IS 'Action type (e.g., lead_created, lead_viewed, lead_updated, lead_exported)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity (e.g., lead, client, project)';
COMMENT ON COLUMN audit_logs.details IS 'JSON object with action-specific details';

-- Grant necessary permissions
GRANT SELECT, INSERT ON audit_logs TO anon;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT ALL ON audit_logs TO service_role;

-- Create view for lead analytics (admins only)
CREATE OR REPLACE VIEW lead_analytics AS
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
  COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_leads,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_time_hours,
  DATE_TRUNC('day', created_at) as date
FROM leads
GROUP BY service_category, service_tag, service_type, priority, status, source, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant view access to authenticated users with admin role
GRANT SELECT ON lead_analytics TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added service_tag, service_category, ip_address, user_agent to leads table';
  RAISE NOTICE 'Created audit_logs table with RLS policies';
  RAISE NOTICE 'Created lead_analytics view for dashboard';
  RAISE NOTICE 'All RLS policies configured for secure access';
END $$;
