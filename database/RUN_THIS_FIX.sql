-- ============================================
-- IDEMPOTENT FIX - Safe to run multiple times
-- Fixes ALL errors: 404, 400, audit_logs, policies
-- ============================================

-- ============================================
-- PART 1: CREATE VISITORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    page_url TEXT NOT NULL,
    page_name TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    country TEXT,
    city TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page_name ON visitors(page_name);
CREATE INDEX IF NOT EXISTS idx_visitors_referrer ON visitors(referrer);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Drop and recreate visitors policies
DROP POLICY IF EXISTS "Allow public to insert visitors" ON visitors;
DROP POLICY IF EXISTS "Allow anon to insert visitors" ON visitors;
DROP POLICY IF EXISTS "Allow authenticated to insert visitors" ON visitors;
DROP POLICY IF EXISTS "Allow authenticated users to read visitors" ON visitors;

CREATE POLICY "Allow anon to insert visitors"
    ON visitors FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated to insert visitors"
    ON visitors FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read visitors"
    ON visitors FOR SELECT TO authenticated USING (true);

-- ============================================
-- PART 2: FIX PROJECTS TABLE
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'timeline_days') THEN
        ALTER TABLE projects ADD COLUMN timeline_days INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'area_sqft') THEN
        ALTER TABLE projects ADD COLUMN area_sqft NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'budget') THEN
        ALTER TABLE projects ADD COLUMN budget NUMERIC(12,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'site_location') THEN
        ALTER TABLE projects ADD COLUMN site_location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'start_date') THEN
        ALTER TABLE projects ADD COLUMN start_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'notes') THEN
        ALTER TABLE projects ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'type') THEN
        ALTER TABLE projects ADD COLUMN type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_by') THEN
        ALTER TABLE projects ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'created_by') THEN
        ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- ============================================
-- PART 3: FIX PROJECTS RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated users to read projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Allow authenticated users to read projects"
    ON projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert projects"
    ON projects FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update projects"
    ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete projects"
    ON projects FOR DELETE TO authenticated USING (true);

-- ============================================
-- PART 4: FIX AUDIT LOGS
-- ============================================

-- Make entity_type nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' 
        AND column_name = 'entity_type' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE audit_logs ALTER COLUMN entity_type DROP NOT NULL;
    END IF;
END $$;

-- Set default value
ALTER TABLE audit_logs ALTER COLUMN entity_type SET DEFAULT 'unknown';

-- Fix the audit trigger
DROP TRIGGER IF EXISTS audit_projects_changes ON projects;

CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, user_id, new_values, details, created_at)
        VALUES ('project_created', 'project', NEW.id, NEW.created_by, row_to_json(NEW),
                jsonb_build_object('operation', 'INSERT', 'table', 'projects', 'project_name', NEW.name), NOW());
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, user_id, old_values, new_values, details, created_at)
        VALUES ('project_updated', 'project', NEW.id, NEW.updated_by, row_to_json(OLD), row_to_json(NEW),
                jsonb_build_object('operation', 'UPDATE', 'table', 'projects', 'project_name', NEW.name), NOW());
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, user_id, old_values, details, created_at)
        VALUES ('project_deleted', 'project', OLD.id, OLD.updated_by, row_to_json(OLD),
                jsonb_build_object('operation', 'DELETE', 'table', 'projects', 'project_name', OLD.name), NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_projects_changes
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION audit_project_changes();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ VISITORS TABLE' as status;
SELECT COUNT(*) as visitor_count FROM visitors;

SELECT '✅ PROJECTS COLUMNS' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('timeline_days', 'area_sqft', 'budget', 'site_location', 'notes', 'updated_by')
ORDER BY column_name;

SELECT '✅ PROJECTS POLICIES' as status;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'projects';

SELECT '✅ AUDIT LOGS FIXED' as status;
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND column_name = 'entity_type';

SELECT '✅ ALL FIXES COMPLETE!' as status;
