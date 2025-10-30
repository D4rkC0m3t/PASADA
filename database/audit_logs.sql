-- =================================================================
-- AUDIT LOGS TABLE - Complete Audit Trail System
-- =================================================================
-- 
-- IDEMPOTENT: This migration is safe to run multiple times
-- It will not error if indexes, policies, or triggers already exist
--
-- CLEANUP: To completely reset audit logs (WARNING: destroys all data):
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP FUNCTION IF EXISTS create_audit_log CASCADE;
-- DROP FUNCTION IF EXISTS audit_table_changes CASCADE;
-- DROP FUNCTION IF EXISTS cleanup_old_audit_logs CASCADE;
-- =================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Action details
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50), -- 'client', 'project', 'material', 'quotation', etc.
  resource_id UUID,
  
  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_role VARCHAR(20), -- 'admin', 'client', 'staff'
  
  -- Request details
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10), -- 'GET', 'POST', 'PATCH', 'DELETE'
  request_path VARCHAR(500),
  
  -- Change tracking
  old_values JSONB, -- Previous state
  new_values JSONB, -- New state  
  changes JSONB, -- Diff of what changed
  
  -- Additional context
  details JSONB, -- Any additional metadata
  status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed', 'blocked'
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT audit_logs_action_check CHECK (action <> '')
);

-- =================================================================
-- ALTER TABLE - Add missing columns if table already existed
-- =================================================================
-- This handles cases where the table was partially created before

DO $$ 
BEGIN
  -- Add resource_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='resource_type') THEN
    ALTER TABLE audit_logs ADD COLUMN resource_type VARCHAR(50);
    RAISE NOTICE 'Added resource_type column';
  END IF;

  -- Add resource_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='resource_id') THEN
    ALTER TABLE audit_logs ADD COLUMN resource_id UUID;
    RAISE NOTICE 'Added resource_id column';
  END IF;

  -- Add user_email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='user_email') THEN
    ALTER TABLE audit_logs ADD COLUMN user_email VARCHAR(255);
    RAISE NOTICE 'Added user_email column';
  END IF;

  -- Add user_role column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='user_role') THEN
    ALTER TABLE audit_logs ADD COLUMN user_role VARCHAR(20);
    RAISE NOTICE 'Added user_role column';
  END IF;

  -- Add ip_address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='ip_address') THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address INET;
    RAISE NOTICE 'Added ip_address column';
  END IF;

  -- Add user_agent column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='user_agent') THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    RAISE NOTICE 'Added user_agent column';
  END IF;

  -- Add request_method column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='request_method') THEN
    ALTER TABLE audit_logs ADD COLUMN request_method VARCHAR(10);
    RAISE NOTICE 'Added request_method column';
  END IF;

  -- Add request_path column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='request_path') THEN
    ALTER TABLE audit_logs ADD COLUMN request_path VARCHAR(500);
    RAISE NOTICE 'Added request_path column';
  END IF;

  -- Add old_values column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='old_values') THEN
    ALTER TABLE audit_logs ADD COLUMN old_values JSONB;
    RAISE NOTICE 'Added old_values column';
  END IF;

  -- Add new_values column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='new_values') THEN
    ALTER TABLE audit_logs ADD COLUMN new_values JSONB;
    RAISE NOTICE 'Added new_values column';
  END IF;

  -- Add changes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='changes') THEN
    ALTER TABLE audit_logs ADD COLUMN changes JSONB;
    RAISE NOTICE 'Added changes column';
  END IF;

  -- Add details column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='details') THEN
    ALTER TABLE audit_logs ADD COLUMN details JSONB;
    RAISE NOTICE 'Added details column';
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='status') THEN
    ALTER TABLE audit_logs ADD COLUMN status VARCHAR(20) DEFAULT 'success';
    RAISE NOTICE 'Added status column';
  END IF;

  -- Add error_message column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='audit_logs' AND column_name='error_message') THEN
    ALTER TABLE audit_logs ADD COLUMN error_message TEXT;
    RAISE NOTICE 'Added error_message column';
  END IF;

  RAISE NOTICE 'Audit logs table schema verification complete';
END $$;

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================

-- Index on user_id for user activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Index on action for action-specific queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Index on resource for resource-specific queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Index on timestamp for time-range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Index on IP address for security monitoring
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Index on status for failed action queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status) WHERE status != 'success';

-- Composite index for user activity timeline
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timeline ON audit_logs(user_id, created_at DESC);

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Admin users can see all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'staff'
  );

-- Users can only see their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system/admin can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Nobody can update or delete audit logs (immutable)
-- No UPDATE or DELETE policies = no one can modify

-- =================================================================
-- HELPER FUNCTIONS
-- =================================================================

-- Function to create an audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_changes JSONB;
BEGIN
  -- Calculate changes (diff between old and new)
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT jsonb_object_agg(key, jsonb_build_object(
      'old', p_old_values -> key,
      'new', p_new_values -> key
    ))
    INTO v_changes
    FROM jsonb_each(p_new_values)
    WHERE p_old_values -> key IS DISTINCT FROM p_new_values -> key;
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    action,
    resource_type,
    resource_id,
    user_id,
    user_email,
    user_role,
    old_values,
    new_values,
    changes,
    details
  ) VALUES (
    p_action,
    p_resource_type,
    p_resource_id,
    auth.uid(),
    auth.jwt() ->> 'email',
    auth.jwt() ->> 'role',
    p_old_values,
    p_new_values,
    v_changes,
    p_details
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- AUTOMATIC AUDIT TRIGGERS
-- =================================================================

-- Function to automatically audit table changes
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      TG_TABLE_NAME || '_created',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('operation', 'INSERT')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      TG_TABLE_NAME || '_updated',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('operation', 'UPDATE')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      TG_TABLE_NAME || '_deleted',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('operation', 'DELETE')
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- APPLY AUDIT TRIGGERS TO TABLES
-- =================================================================
-- 
-- NOTE: These triggers will only be created if the tables exist
-- If tables don't exist yet, the migration will continue without error
-- Run this migration again after creating the tables
-- =================================================================

-- Audit clients table (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    DROP TRIGGER IF EXISTS audit_clients_trigger ON clients;
    CREATE TRIGGER audit_clients_trigger
      AFTER INSERT OR UPDATE OR DELETE ON clients
      FOR EACH ROW EXECUTE FUNCTION audit_table_changes();
    RAISE NOTICE 'Created audit trigger for clients table';
  ELSE
    RAISE NOTICE 'Clients table does not exist yet - skipping trigger creation';
  END IF;
END $$;

-- Audit projects table (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    DROP TRIGGER IF EXISTS audit_projects_trigger ON projects;
    CREATE TRIGGER audit_projects_trigger
      AFTER INSERT OR UPDATE OR DELETE ON projects
      FOR EACH ROW EXECUTE FUNCTION audit_table_changes();
    RAISE NOTICE 'Created audit trigger for projects table';
  ELSE
    RAISE NOTICE 'Projects table does not exist yet - skipping trigger creation';
  END IF;
END $$;

-- Audit materials table (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    DROP TRIGGER IF EXISTS audit_materials_trigger ON materials;
    CREATE TRIGGER audit_materials_trigger
      AFTER INSERT OR UPDATE OR DELETE ON materials
      FOR EACH ROW EXECUTE FUNCTION audit_table_changes();
    RAISE NOTICE 'Created audit trigger for materials table';
  ELSE
    RAISE NOTICE 'Materials table does not exist yet - skipping trigger creation';
  END IF;
END $$;

-- Audit quotations table (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotations') THEN
    DROP TRIGGER IF EXISTS audit_quotations_trigger ON quotations;
    CREATE TRIGGER audit_quotations_trigger
      AFTER INSERT OR UPDATE OR DELETE ON quotations
      FOR EACH ROW EXECUTE FUNCTION audit_table_changes();
    RAISE NOTICE 'Created audit trigger for quotations table';
  ELSE
    RAISE NOTICE 'Quotations table does not exist yet - skipping trigger creation';
  END IF;
END $$;

-- =================================================================
-- VIEWS FOR COMMON AUDIT QUERIES
-- =================================================================

-- Recent activity view (last 100 actions)
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT 
  al.id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.user_email,
  al.user_role,
  al.ip_address,
  al.status,
  al.created_at,
  al.details
FROM audit_logs al
ORDER BY al.created_at DESC
LIMIT 100;

-- Failed actions view
CREATE OR REPLACE VIEW failed_audit_actions AS
SELECT 
  al.id,
  al.action,
  al.user_email,
  al.ip_address,
  al.error_message,
  al.created_at
FROM audit_logs al
WHERE al.status = 'failed'
ORDER BY al.created_at DESC;

-- User activity timeline
CREATE OR REPLACE VIEW user_audit_timeline AS
SELECT 
  al.user_id,
  al.user_email,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE al.status = 'failed') as failed_actions,
  MAX(al.created_at) as last_activity,
  jsonb_agg(
    jsonb_build_object(
      'action', al.action,
      'timestamp', al.created_at,
      'status', al.status
    )
    ORDER BY al.created_at DESC
  ) FILTER (WHERE al.created_at >= NOW() - INTERVAL '7 days') as recent_activity
FROM audit_logs al
GROUP BY al.user_id, al.user_email;

-- =================================================================
-- CLEANUP POLICY (Optional - keep last 2 years)
-- =================================================================

-- Function to clean old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years'
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule this to run monthly (use pg_cron or external scheduler)
-- SELECT cron.schedule('cleanup-audit-logs', '0 0 1 * *', 'SELECT cleanup_old_audit_logs()');

-- =================================================================
-- GRANT PERMISSIONS
-- =================================================================

-- Grant SELECT to authenticated users (RLS will filter)
GRANT SELECT ON audit_logs TO authenticated;

-- Grant INSERT to service role (for system logging)
GRANT INSERT ON audit_logs TO service_role;

-- =================================================================
-- SAMPLE USAGE
-- =================================================================

-- Manual audit log creation:
-- SELECT create_audit_log(
--   'user_login',
--   NULL,
--   NULL,
--   NULL,
--   NULL,
--   jsonb_build_object('method', '2FA', 'success', true)
-- );

-- Query recent activity:
-- SELECT * FROM recent_audit_activity;

-- Query user activity:
-- SELECT * FROM user_audit_timeline WHERE user_id = 'uuid-here';

-- Query failed actions:
-- SELECT * FROM failed_audit_actions WHERE created_at >= NOW() - INTERVAL '1 day';

-- =================================================================
-- END OF AUDIT LOGS MIGRATION
-- =================================================================
