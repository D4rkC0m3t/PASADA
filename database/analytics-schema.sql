-- ============================================
-- PASADA CRM - Analytics & Lead Tracking Schema
-- Created: 2025-10-29
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'client', -- 'admin', 'client', 'staff'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Anyone authenticated can view all profiles (simplified)
-- Note: Actual authorization should be handled in application layer
CREATE POLICY IF NOT EXISTS "Authenticated users can view profiles"
  ON user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- VISITORS TABLE - Track website visits
-- ============================================
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(100),
  os VARCHAR(100),
  page_url TEXT NOT NULL,
  page_name VARCHAR(255), -- e.g., 'contact-us', 'home', 'projects'
  referrer TEXT,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  country VARCHAR(100),
  city VARCHAR(100),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER, -- time spent on page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_visitors_session ON visitors(session_id);
CREATE INDEX idx_visitors_visited_at ON visitors(visited_at DESC);
CREATE INDEX idx_visitors_page_name ON visitors(page_name);
CREATE INDEX idx_visitors_referrer ON visitors(referrer);

-- ============================================
-- LEADS TABLE - Capture form submissions
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  
  -- Contact Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  
  -- Lead Details
  service_type VARCHAR(100), -- 'Interior Design', 'Consultation', 'Custom Furniture', etc.
  project_type VARCHAR(100), -- 'Residential', 'Commercial', 'Hospitality'
  budget_range VARCHAR(100), -- '< 5L', '5-10L', '10-25L', '25L+'
  message TEXT,
  
  -- Lead Source
  source VARCHAR(100) DEFAULT 'website', -- website, referral, social, ads
  page_url TEXT,
  referrer TEXT,
  
  -- Consent & Privacy
  consent_marketing BOOLEAN DEFAULT FALSE,
  consent_privacy BOOLEAN DEFAULT TRUE,
  
  -- Lead Status
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Follow-up
  follow_up_date DATE,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_submitted_at ON leads(submitted_at DESC);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_service_type ON leads(service_type);

-- ============================================
-- LEAD ACTIVITIES TABLE - Track all interactions
-- ============================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  activity_type VARCHAR(50) NOT NULL, -- call, email, meeting, note, status_change
  description TEXT,
  outcome VARCHAR(100), -- answered, voicemail, email_sent, meeting_scheduled, etc.
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- ============================================
-- ANALYTICS VIEWS - Pre-computed metrics
-- ============================================

-- Daily visitor stats
CREATE OR REPLACE VIEW daily_visitor_stats AS
SELECT 
  DATE(visited_at) as date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(DISTINCT ip_address) as unique_ips,
  AVG(duration_seconds) as avg_duration_seconds
FROM visitors
GROUP BY DATE(visited_at)
ORDER BY date DESC;

-- Lead conversion funnel
CREATE OR REPLACE VIEW lead_conversion_funnel AS
SELECT 
  DATE(submitted_at) as date,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
  COUNT(*) FILTER (WHERE status = 'qualified') as qualified_leads,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_leads,
  COUNT(*) FILTER (WHERE status = 'lost') as lost_leads,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'converted')::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) as conversion_rate
FROM leads
GROUP BY DATE(submitted_at)
ORDER BY date DESC;

-- Top referrers
CREATE OR REPLACE VIEW top_referrers AS
SELECT 
  referrer,
  COUNT(*) as visit_count,
  COUNT(DISTINCT session_id) as unique_visitors
FROM visitors
WHERE referrer IS NOT NULL AND referrer != ''
GROUP BY referrer
ORDER BY visit_count DESC
LIMIT 20;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Visitors: Admins can view all, public can insert (for tracking)
CREATE POLICY "Admins can view all visitors"
  ON visitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow anonymous visitor tracking"
  ON visitors FOR INSERT
  WITH CHECK (true);

-- Leads: Admins can do everything, assigned users can view their leads
CREATE POLICY "Admins can manage all leads"
  ON leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view assigned leads"
  ON leads FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "Allow public lead submission"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Lead Activities: Users can view activities for their leads
CREATE POLICY "Admins can manage all activities"
  ON lead_activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view activities for assigned leads"
  ON lead_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE id = lead_activities.lead_id 
      AND assigned_to = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update lead updated_at timestamp
CREATE OR REPLACE FUNCTION update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lead updates
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_updated_at();

-- Function to get lead summary statistics
CREATE OR REPLACE FUNCTION get_lead_stats(days_ago INTEGER DEFAULT 30)
RETURNS TABLE (
  total_leads BIGINT,
  new_leads BIGINT,
  converted_leads BIGINT,
  conversion_rate NUMERIC,
  avg_response_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_leads,
    COUNT(*) FILTER (WHERE status = 'new')::BIGINT as new_leads,
    COUNT(*) FILTER (WHERE status = 'converted')::BIGINT as converted_leads,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'converted')::NUMERIC / 
      NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
      2
    ) as conversion_rate,
    AVG(last_contacted_at - submitted_at) as avg_response_time
  FROM leads
  WHERE submitted_at >= NOW() - (days_ago || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert sample leads (optional - remove in production)
-- INSERT INTO leads (name, email, phone, service_type, project_type, budget_range, message, status) VALUES
-- ('John Doe', 'john@example.com', '+91-9876543210', 'Interior Design', 'Residential', '5-10L', 'Looking for modern kitchen design', 'new'),
-- ('Jane Smith', 'jane@example.com', '+91-9876543211', 'Consultation', 'Commercial', '10-25L', 'Need office interior consultation', 'contacted'),
-- ('Robert Johnson', 'robert@example.com', '+91-9876543212', 'Custom Furniture', 'Residential', '< 5L', 'Custom dining table needed', 'qualified');

COMMENT ON TABLE visitors IS 'Tracks all website visits for analytics';
COMMENT ON TABLE leads IS 'Stores contact form submissions and lead information';
COMMENT ON TABLE lead_activities IS 'Tracks all interactions and activities with leads';

-- ============================================
-- SETUP INSTRUCTIONS
-- ============================================
-- After running this schema, you need to create your first admin user:
-- 
-- METHOD 1: Create admin user profile for existing auth user
-- Run this query, replacing 'your-user-id-here' with your actual user ID:
-- 
-- INSERT INTO user_profiles (user_id, role)
-- VALUES ('your-user-id-here', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
--
-- To find your user ID, run:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
--
-- METHOD 2: Automatically set first user as admin
-- Uncomment and run the following:
--
-- INSERT INTO user_profiles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM user_profiles)
-- LIMIT 1;
-- ============================================
