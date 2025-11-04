-- ================================================
-- Migration: Add client_id to user_profiles
-- Purpose: Link user accounts to client records securely
-- Date: 2025-11-04
-- ================================================

-- Add client_id column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_client_id ON user_profiles(client_id);

-- Add client_id to quotations for direct client access
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Add index for quotations client_id
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON quotations(client_id);

-- Add completion_percentage to projects if not exists
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Add is_active to clients if not exists (for filtering)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing quotations to set client_id from project
UPDATE quotations q
SET client_id = p.client_id
FROM projects p
WHERE q.project_id = p.id
AND q.client_id IS NULL;

COMMENT ON COLUMN user_profiles.client_id IS 'Links user account to client record for client portal access';
COMMENT ON COLUMN quotations.client_id IS 'Direct link to client for easier querying and RLS policies';
COMMENT ON COLUMN projects.completion_percentage IS 'Project completion percentage (0-100)';
