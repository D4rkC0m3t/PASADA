-- ============================================
-- FIX AUDIT_LOGS TABLE
-- Adds missing "entity" column and other audit fields
-- ============================================

-- Add entity column (the table/resource being audited)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'entity'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN entity TEXT;
    END IF;
END $$;

-- Add entity_id column (the specific record ID)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id UUID;
    END IF;
END $$;

-- Add other commonly needed audit columns
DO $$ 
BEGIN
    -- Record ID (alternative name)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'record_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN record_id UUID;
    END IF;
    
    -- Table name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'table_name'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN table_name TEXT;
    END IF;
    
    -- Action type (create, update, delete)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'action'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN action TEXT;
    END IF;
    
    -- Old data (before change)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'old_data'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN old_data JSONB;
    END IF;
    
    -- New data (after change)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'new_data'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN new_data JSONB;
    END IF;
    
    -- Changes summary
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'changes'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN changes JSONB;
    END IF;
    
    -- Old values (alternative name for old_data)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'old_values'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN old_values JSONB;
    END IF;
    
    -- New values (alternative name for new_data)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'new_values'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN new_values JSONB;
    END IF;
    
    -- IP address
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
    END IF;
    
    -- User agent
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    END IF;
END $$;

-- ============================================
-- VERIFICATION - Show all audit_logs columns
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS! Audit logging should now work
-- ============================================
