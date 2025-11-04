-- ============================================
-- FIX: Audit Logs Entity Type Error
-- Fixes: null value in column "entity_type" violates not-null constraint
-- ============================================

-- ============================================
-- OPTION 1: Make entity_type NULLABLE (Recommended)
-- ============================================
-- This allows audit logs to work even if entity_type is not set

ALTER TABLE audit_logs 
ALTER COLUMN entity_type DROP NOT NULL;

-- ============================================
-- OPTION 2: Add Default Value
-- ============================================
-- Set a default value for entity_type

ALTER TABLE audit_logs 
ALTER COLUMN entity_type SET DEFAULT 'unknown';

-- ============================================
-- OPTION 3: Fix the Trigger (If exists)
-- ============================================
-- Check if there's a trigger on projects table

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'projects';

-- ============================================
-- If trigger exists, update it to include entity_type
-- ============================================

-- Drop and recreate the audit trigger for projects
DROP TRIGGER IF EXISTS audit_projects_changes ON projects;

-- Create or replace the audit function
CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (
            action,
            entity_type,
            entity_id,
            user_id,
            new_values,
            details,
            created_at
        ) VALUES (
            'project_created',
            'project',  -- ✅ Set entity_type
            NEW.id,
            NEW.created_by,
            row_to_json(NEW),
            jsonb_build_object(
                'operation', 'INSERT',
                'table', 'projects',
                'project_name', NEW.name
            ),
            NOW()
        );
        RETURN NEW;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (
            action,
            entity_type,
            entity_id,
            user_id,
            old_values,
            new_values,
            details,
            created_at
        ) VALUES (
            'project_updated',
            'project',  -- ✅ Set entity_type
            NEW.id,
            NEW.updated_by,
            row_to_json(OLD),
            row_to_json(NEW),
            jsonb_build_object(
                'operation', 'UPDATE',
                'table', 'projects',
                'project_name', NEW.name
            ),
            NOW()
        );
        RETURN NEW;
        
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (
            action,
            entity_type,
            entity_id,
            user_id,
            old_values,
            details,
            created_at
        ) VALUES (
            'project_deleted',
            'project',  -- ✅ Set entity_type
            OLD.id,
            OLD.updated_by,
            row_to_json(OLD),
            jsonb_build_object(
                'operation', 'DELETE',
                'table', 'projects',
                'project_name', OLD.name
            ),
            NOW()
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER audit_projects_changes
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION audit_project_changes();

-- ============================================
-- VERIFICATION
-- ============================================

-- Check audit_logs table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
AND column_name IN ('entity_type', 'action', 'entity_id')
ORDER BY ordinal_position;

-- Check triggers on projects table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'projects';

-- Test: Try to update a project (should work now)
-- UPDATE projects SET notes = 'Test update' WHERE id = '44e34b52-1101-410c-b3c9-bbbbd512e015';

-- Check if audit log was created
SELECT 
    action,
    entity_type,
    entity_id,
    details,
    created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- SUCCESS! 
-- ✅ entity_type is now nullable OR has default value
-- ✅ Trigger properly sets entity_type = 'project'
-- ✅ Project updates should work without errors
-- ============================================
