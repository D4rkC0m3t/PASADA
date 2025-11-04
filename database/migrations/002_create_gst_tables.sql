-- ================================================
-- GST Implementation - Migration 002
-- Create new GST-related tables
-- ================================================

-- ================================================
-- 1. COMPANY SETTINGS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Company Information
    company_name TEXT NOT NULL,
    legal_name TEXT,
    gstin VARCHAR(15) NOT NULL,
    pan VARCHAR(10),
    cin VARCHAR(21),
    constitution_type TEXT,
    gst_registration_date DATE,
    
    -- Address
    state_code VARCHAR(2) NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode VARCHAR(6),
    country TEXT DEFAULT 'India',
    
    -- Contact
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Bank Details
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_holder TEXT,
    bank_ifsc VARCHAR(11),
    bank_branch TEXT,
    
    -- Branding
    logo_url TEXT,
    signature_url TEXT,
    
    -- GST Settings
    gst_enabled BOOLEAN DEFAULT TRUE,
    default_gst_rate DECIMAL(5,2) DEFAULT 18.00,
    
    -- E-Invoice Settings
    einvoice_enabled BOOLEAN DEFAULT FALSE,
    einvoice_api_url TEXT,
    einvoice_api_key TEXT,
    einvoice_username TEXT,
    einvoice_password TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Add comments
COMMENT ON TABLE company_settings IS 'Company information and GST settings';
COMMENT ON COLUMN company_settings.gstin IS 'Company GST Identification Number';
COMMENT ON COLUMN company_settings.pan IS 'Company PAN';
COMMENT ON COLUMN company_settings.cin IS 'Corporate Identification Number';
COMMENT ON COLUMN company_settings.state_code IS 'GST State Code';
COMMENT ON COLUMN company_settings.einvoice_api_key IS 'E-invoice API key (should be encrypted)';

-- ================================================
-- 2. HSN/SAC MASTER TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS hsn_sac_master (
    code VARCHAR(8) PRIMARY KEY,
    description TEXT NOT NULL,
    type VARCHAR(3) CHECK (type IN ('HSN', 'SAC')),
    category TEXT,
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_hsn_sac_type ON hsn_sac_master(type);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_active ON hsn_sac_master(is_active);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_category ON hsn_sac_master(category);

-- Add comments
COMMENT ON TABLE hsn_sac_master IS 'HSN (goods) and SAC (services) codes master';
COMMENT ON COLUMN hsn_sac_master.code IS 'HSN or SAC code (6-8 digits)';
COMMENT ON COLUMN hsn_sac_master.type IS 'HSN for goods, SAC for services';
COMMENT ON COLUMN hsn_sac_master.gst_rate IS 'Default GST rate for this code';

-- ================================================
-- 3. GST AUDIT LOG TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS gst_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    action VARCHAR(50) CHECK (action IN ('created', 'updated', 'einvoice_generated', 'einvoice_cancelled', 'gst_calculated')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_gst_audit_quotation ON gst_audit_log(quotation_id);
CREATE INDEX IF NOT EXISTS idx_gst_audit_created_at ON gst_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_gst_audit_action ON gst_audit_log(action);

-- Add comments
COMMENT ON TABLE gst_audit_log IS 'Audit trail for all GST-related changes';
COMMENT ON COLUMN gst_audit_log.action IS 'Type of action performed';
COMMENT ON COLUMN gst_audit_log.old_values IS 'Previous values (JSON)';
COMMENT ON COLUMN gst_audit_log.new_values IS 'New values (JSON)';

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
