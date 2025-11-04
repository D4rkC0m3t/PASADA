-- ============================================
-- ADD MISSING PROJECT COLUMNS
-- Fixes the "timeline_days" error and other missing fields
-- ============================================

-- Add timeline_days column (Timeline Days field)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'timeline_days'
    ) THEN
        ALTER TABLE projects ADD COLUMN timeline_days INTEGER;
    END IF;
END $$;

-- Add other commonly used project columns
DO $$ 
BEGIN
    -- Budget field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'budget'
    ) THEN
        ALTER TABLE projects ADD COLUMN budget NUMERIC(12,2);
    END IF;
    
    -- Site/Project location
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'site_location'
    ) THEN
        ALTER TABLE projects ADD COLUMN site_location TEXT;
    END IF;
    
    -- Area in sq.ft
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'area_sqft'
    ) THEN
        ALTER TABLE projects ADD COLUMN area_sqft NUMERIC(10,2);
    END IF;
    
    -- Start date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE projects ADD COLUMN start_date DATE;
    END IF;
    
    -- End date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE projects ADD COLUMN end_date DATE;
    END IF;
    
    -- Project type (Residential/Commercial/Hospitality)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'project_type'
    ) THEN
        ALTER TABLE projects ADD COLUMN project_type TEXT;
    END IF;
    
    -- Additional notes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'additional_notes'
    ) THEN
        ALTER TABLE projects ADD COLUMN additional_notes TEXT;
    END IF;
END $$;

-- ============================================
-- VERIFICATION - Show all project columns
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS! Your project form should now work
-- ============================================
