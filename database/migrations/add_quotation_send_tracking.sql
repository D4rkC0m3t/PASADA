-- Add columns for tracking quotation email sends
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sent_to VARCHAR(255);

-- Add index for performance on sent_at queries
CREATE INDEX IF NOT EXISTS idx_quotations_sent_at ON quotations(sent_at);

-- Add comment to columns
COMMENT ON COLUMN quotations.sent_at IS 'Timestamp when quotation was sent to client';
COMMENT ON COLUMN quotations.sent_to IS 'Email address where quotation was sent';

-- Create activity_log table if it doesn't exist (for tracking all actions)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Add RLS policies for activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Admin/staff can see all activities
CREATE POLICY activity_log_select_admin ON activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'staff')
    )
  );

-- Users can insert their own activities
CREATE POLICY activity_log_insert_own ON activity_log
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add comments
COMMENT ON TABLE activity_log IS 'Activity log for tracking user actions across the system';
COMMENT ON COLUMN activity_log.action IS 'Type of action performed (e.g., quotation_sent, project_created)';
COMMENT ON COLUMN activity_log.entity_type IS 'Type of entity affected (e.g., quotation, project, client)';
COMMENT ON COLUMN activity_log.entity_id IS 'ID of the entity affected';
COMMENT ON COLUMN activity_log.details IS 'Additional details about the action in JSON format';
