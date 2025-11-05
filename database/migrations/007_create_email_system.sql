-- ================================================
-- PASADA CRM - Email System Tables
-- Migration: 007_create_email_system
-- Date: 2025-11-05
-- Description: Creates email_logs and inbound_emails tables with RLS policies
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. EMAIL_LOGS TABLE
-- ================================================
-- Tracks every email sent or resent through the system

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationship
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    
    -- Email Details
    to_email TEXT NOT NULL,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    
    -- Resend Integration
    resend_id TEXT,
    resend_status TEXT,
    
    -- Status Tracking
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'resent')),
    
    -- Resend Information
    resend_count INTEGER DEFAULT 0,
    resend_reason TEXT,
    resend_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resend_at TIMESTAMP WITH TIME ZONE,
    parent_email_id UUID REFERENCES email_logs(id) ON DELETE SET NULL,
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit & Metadata
    audit_meta JSONB DEFAULT '{}'::jsonb,
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Tags & Categories
    email_type TEXT CHECK (email_type IN ('quotation', 'invoice', 'follow_up', 'welcome', 'reminder', 'notification', 'custom')),
    tags TEXT[],
    
    -- Error Tracking
    error_message TEXT,
    error_code TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_client_id ON email_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_project_id ON email_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_quotation_id ON email_logs(quotation_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_parent_email_id ON email_logs(parent_email_id);

-- Comments for documentation
COMMENT ON TABLE email_logs IS 'Complete audit trail of all emails sent through the system';
COMMENT ON COLUMN email_logs.resend_id IS 'Unique ID from Resend API for tracking';
COMMENT ON COLUMN email_logs.resend_count IS 'Number of times this email has been resent';
COMMENT ON COLUMN email_logs.parent_email_id IS 'Reference to original email if this is a resend';
COMMENT ON COLUMN email_logs.audit_meta IS 'Additional metadata for compliance and auditing';

-- ================================================
-- 2. INBOUND_EMAILS TABLE (Optional)
-- ================================================
-- Stores replies and incoming messages

CREATE TABLE IF NOT EXISTS inbound_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Email Details
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    
    -- Matching & Relationships
    matched_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    matched_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    matched_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    original_email_id UUID REFERENCES email_logs(id) ON DELETE SET NULL,
    
    -- Processing Status
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    headers JSONB,
    attachments JSONB,
    
    -- Timestamps
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for inbound_emails
CREATE INDEX IF NOT EXISTS idx_inbound_emails_from_email ON inbound_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_matched_lead ON inbound_emails(matched_lead_id);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_matched_client ON inbound_emails(matched_client_id);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_is_processed ON inbound_emails(is_processed);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_received_at ON inbound_emails(received_at DESC);

COMMENT ON TABLE inbound_emails IS 'Stores incoming emails and replies from clients';
COMMENT ON COLUMN inbound_emails.matched_lead_id IS 'Automatically matched lead based on email address';
COMMENT ON COLUMN inbound_emails.is_processed IS 'Whether admin has reviewed this email';

-- ================================================
-- 3. EMAIL_TEMPLATES TABLE
-- ================================================
-- Reusable email templates with merge tags

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Details
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    
    -- Template Type
    template_type TEXT CHECK (template_type IN ('quotation', 'invoice', 'follow_up', 'welcome', 'reminder', 'notification', 'custom')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Merge Tags Documentation
    available_merge_tags TEXT[],
    merge_tag_examples JSONB,
    
    -- Usage Statistics
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_template_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

COMMENT ON TABLE email_templates IS 'Reusable email templates with dynamic merge tags';
COMMENT ON COLUMN email_templates.available_merge_tags IS 'List of supported merge tags like {{lead.name}}, {{quotation.number}}';

-- ================================================
-- 4. FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to email_logs
CREATE TRIGGER update_email_logs_updated_at 
    BEFORE UPDATE ON email_logs
    FOR EACH ROW 
    EXECUTE FUNCTION update_email_tables_updated_at();

-- Apply updated_at trigger to email_templates
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_email_tables_updated_at();

-- Function to prevent excessive resending (max 3 times per lead)
CREATE OR REPLACE FUNCTION check_resend_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.resend_count > 3 THEN
        RAISE EXCEPTION 'Resend limit exceeded: Cannot resend more than 3 times per email thread';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_resend_limit
    BEFORE UPDATE ON email_logs
    FOR EACH ROW
    WHEN (NEW.resend_count > OLD.resend_count)
    EXECUTE FUNCTION check_resend_limit();

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email_type IS NOT NULL THEN
        UPDATE email_templates
        SET 
            times_used = times_used + 1,
            last_used_at = NOW()
        WHERE template_type = NEW.email_type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_template_usage
    AFTER INSERT ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION increment_template_usage();

-- ================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 6. RLS POLICIES
-- ================================================

-- EMAIL_LOGS POLICIES

-- Allow service role to insert (for API)
CREATE POLICY "Service role can insert email logs"
    ON email_logs FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Admins can read all email logs
CREATE POLICY "Admins can read email logs"
    ON email_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Admins can update email logs (for resending)
CREATE POLICY "Admins can update email logs"
    ON email_logs FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- INBOUND_EMAILS POLICIES

-- Service role can insert inbound emails
CREATE POLICY "Service role can insert inbound emails"
    ON inbound_emails FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Admins can read inbound emails
CREATE POLICY "Admins can read inbound emails"
    ON inbound_emails FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Admins can update inbound emails
CREATE POLICY "Admins can update inbound emails"
    ON inbound_emails FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- EMAIL_TEMPLATES POLICIES

-- Admins and staff can read templates
CREATE POLICY "Admins and staff can read email templates"
    ON email_templates FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

-- Only admins can create/update/delete templates
CREATE POLICY "Admins can manage email templates"
    ON email_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- ================================================
-- 7. ANALYTICS VIEWS
-- ================================================

-- Email Performance Analytics
CREATE OR REPLACE VIEW email_analytics AS
SELECT 
    email_type,
    status,
    DATE_TRUNC('day', sent_at) as date,
    COUNT(*) as total_sent,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened_count,
    COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked_count,
    COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    COUNT(CASE WHEN resend_count > 0 THEN 1 END) as resent_count,
    AVG(resend_count) as avg_resend_count,
    ROUND(
        COUNT(CASE WHEN status = 'opened' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0) * 100, 
        2
    ) as open_rate_percent,
    ROUND(
        COUNT(CASE WHEN status = 'clicked' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(CASE WHEN status = 'opened' THEN 1 END), 0) * 100, 
        2
    ) as click_rate_percent
FROM email_logs
GROUP BY email_type, status, DATE_TRUNC('day', sent_at)
ORDER BY date DESC;

GRANT SELECT ON email_analytics TO authenticated;

COMMENT ON VIEW email_analytics IS 'Email performance metrics and engagement analytics';

-- Resend Statistics View
CREATE OR REPLACE VIEW resend_statistics AS
SELECT 
    lead_id,
    to_email,
    COUNT(*) as total_resends,
    MAX(resend_count) as max_resend_count,
    ARRAY_AGG(resend_reason) as resend_reasons,
    MIN(sent_at) as first_sent,
    MAX(resend_at) as last_resent,
    EXTRACT(EPOCH FROM (MAX(resend_at) - MIN(sent_at)))/3600 as hours_between_first_and_last
FROM email_logs
WHERE resend_count > 0
GROUP BY lead_id, to_email
HAVING COUNT(*) > 1
ORDER BY total_resends DESC;

GRANT SELECT ON resend_statistics TO authenticated;

COMMENT ON VIEW resend_statistics IS 'Statistics on emails that required resending';

-- ================================================
-- 8. INSERT DEFAULT EMAIL TEMPLATES
-- ================================================

INSERT INTO email_templates (
    name, 
    description, 
    subject_template, 
    html_template, 
    text_template, 
    template_type,
    available_merge_tags,
    merge_tag_examples
) VALUES (
    'Quotation Email',
    'Professional quotation email with PDF attachment',
    'Quotation {{quotation.number}} from PASADA Interior Design',
    '<html><body><h1>Dear {{client.name}},</h1><p>Thank you for your interest in PASADA Interior Design. Please find attached your quotation for {{project.name}}.</p><p>Quotation Number: <strong>{{quotation.number}}</strong><br>Total Amount: <strong>₹{{quotation.total}}</strong></p><p>This quotation is valid until {{quotation.valid_until}}.</p><p>Best regards,<br>PASADA Interior Design Team</p></body></html>',
    'Dear {{client.name}}, Thank you for your interest in PASADA Interior Design. Please find attached your quotation for {{project.name}}.',
    'quotation',
    ARRAY['{{client.name}}', '{{project.name}}', '{{quotation.number}}', '{{quotation.total}}', '{{quotation.valid_until}}'],
    '{"client": {"name": "Mr. Sharma"}, "project": {"name": "Modern Kitchen"}, "quotation": {"number": "PASADA-2025-0001", "total": "2,50,000", "valid_until": "30 days"}}'::jsonb
),
(
    'Lead Follow-up',
    'Follow up email for new leads',
    'Thank you for contacting PASADA Interior Design',
    '<html><body><h1>Hello {{lead.name}},</h1><p>Thank you for reaching out to PASADA Interior Design. We received your inquiry about {{lead.service}}.</p><p>Our team will get back to you within 24 hours.</p><p>In the meantime, feel free to explore our portfolio at <a href="https://pasada.in/projects">pasada.in/projects</a>.</p><p>Best regards,<br>PASADA Interior Design</p></body></html>',
    'Hello {{lead.name}}, Thank you for reaching out to PASADA Interior Design. We received your inquiry about {{lead.service}}.',
    'follow_up',
    ARRAY['{{lead.name}}', '{{lead.email}}', '{{lead.phone}}', '{{lead.service}}'],
    '{"lead": {"name": "Priya Singh", "service": "Modular Kitchen Design"}}'::jsonb
),
(
    'Welcome Client',
    'Welcome email for new clients',
    'Welcome to PASADA Interior Design Family',
    '<html><body><h1>Welcome, {{client.name}}!</h1><p>We are thrilled to have you as our client. Your project <strong>{{project.name}}</strong> has been created successfully.</p><p>You can track your project progress through our client portal: <a href="{{portal.url}}">Client Dashboard</a></p><p>Best regards,<br>PASADA Interior Design Team</p></body></html>',
    'Welcome, {{client.name}}! We are thrilled to have you as our client.',
    'welcome',
    ARRAY['{{client.name}}', '{{project.name}}', '{{portal.url}}'],
    '{"client": {"name": "Mr. Kumar"}, "project": {"name": "Full Home Interior"}, "portal": {"url": "https://pasada.in/client/dashboard"}}'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 9. GRANT PERMISSIONS
-- ================================================

GRANT SELECT, INSERT, UPDATE ON email_logs TO authenticated;
GRANT ALL ON email_logs TO service_role;

GRANT SELECT, INSERT, UPDATE ON inbound_emails TO authenticated;
GRANT ALL ON inbound_emails TO service_role;

GRANT SELECT ON email_templates TO authenticated;
GRANT ALL ON email_templates TO service_role;

-- ================================================
-- 10. SUCCESS MESSAGE
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Email System Migration Completed Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Created Tables:';
    RAISE NOTICE '  ✓ email_logs - Complete email audit trail';
    RAISE NOTICE '  ✓ inbound_emails - Incoming email storage';
    RAISE NOTICE '  ✓ email_templates - Reusable templates with merge tags';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Security:';
    RAISE NOTICE '  ✓ Row Level Security (RLS) enabled';
    RAISE NOTICE '  ✓ Admin-only access policies';
    RAISE NOTICE '  ✓ Resend limit enforcement (max 3 times)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Analytics:';
    RAISE NOTICE '  ✓ email_analytics view created';
    RAISE NOTICE '  ✓ resend_statistics view created';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Default Templates:';
    RAISE NOTICE '  ✓ Quotation Email';
    RAISE NOTICE '  ✓ Lead Follow-up';
    RAISE NOTICE '  ✓ Welcome Client';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 System Ready! Next steps:';
    RAISE NOTICE '  1. Create API routes for sending/resending emails';
    RAISE NOTICE '  2. Integrate with Resend API';
    RAISE NOTICE '  3. Add email log UI to admin dashboard';
END $$;
