-- ================================================
-- GST Implementation - Migration 003
-- Add Row Level Security (RLS) policies for GST tables
-- ================================================

-- ================================================
-- 1. COMPANY SETTINGS RLS
-- ================================================

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Admin can view company settings
CREATE POLICY "Admin can view company settings"
ON company_settings FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Admin can insert company settings
CREATE POLICY "Admin can insert company settings"
ON company_settings FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Admin can update company settings
CREATE POLICY "Admin can update company settings"
ON company_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- ================================================
-- 2. HSN/SAC MASTER RLS
-- ================================================

ALTER TABLE hsn_sac_master ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view HSN/SAC codes
CREATE POLICY "Authenticated users can view HSN/SAC codes"
ON hsn_sac_master FOR SELECT
TO authenticated
USING (true);

-- Admin can insert HSN/SAC codes
CREATE POLICY "Admin can insert HSN/SAC codes"
ON hsn_sac_master FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Admin can update HSN/SAC codes
CREATE POLICY "Admin can update HSN/SAC codes"
ON hsn_sac_master FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Admin can delete HSN/SAC codes
CREATE POLICY "Admin can delete HSN/SAC codes"
ON hsn_sac_master FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- ================================================
-- 3. GST AUDIT LOG RLS
-- ================================================

ALTER TABLE gst_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin can view audit logs
CREATE POLICY "Admin can view audit logs"
ON gst_audit_log FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- System can insert audit logs (no user restriction)
CREATE POLICY "System can insert audit logs"
ON gst_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
