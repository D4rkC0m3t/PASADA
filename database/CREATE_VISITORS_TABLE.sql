-- ============================================
-- CREATE VISITORS TABLE FOR ANALYTICS
-- Fixes the 404 errors for visitor tracking
-- ============================================

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session tracking
    session_id TEXT,
    
    -- IP and device info
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    
    -- Page information
    page_url TEXT NOT NULL,
    page_name TEXT,
    
    -- Traffic source
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Location (optional)
    country TEXT,
    city TEXT,
    
    -- Engagement metrics
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page_name ON visitors(page_name);
CREATE INDEX IF NOT EXISTS idx_visitors_referrer ON visitors(referrer);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for tracking)
CREATE POLICY "Allow public to insert visitors"
    ON visitors FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to read (for analytics dashboard)
CREATE POLICY "Allow authenticated users to read visitors"
    ON visitors FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICATION - Check the table
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'visitors'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS! Visitor Analytics will now work
-- ============================================
