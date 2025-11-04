-- ============================================
-- PASADA CRM - COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'staff', 'client')),
    name TEXT,
    phone TEXT,
    company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    state_code TEXT,
    pincode TEXT,
    gstin TEXT,
    client_type TEXT DEFAULT 'B2C' CHECK (client_type IN ('B2B', 'B2C')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    site_location TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'design', 'procurement', 'execution', 'handover', 'completed', 'on_hold')),
    budget NUMERIC(12,2),
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VISITORS (Analytics)
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

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    service_type TEXT,
    project_type TEXT,
    budget_range TEXT,
    message TEXT,
    source TEXT DEFAULT 'website',
    page_url TEXT,
    referrer TEXT,
    consent_marketing BOOLEAN DEFAULT false,
    consent_privacy BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    follow_up_date DATE,
    last_contacted_at TIMESTAMPTZ,
    notes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MATERIALS
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit TEXT DEFAULT 'piece',
    cost_price NUMERIC(12,2),
    selling_price NUMERIC(12,2),
    hsn_code TEXT,
    gst_rate NUMERIC(5,2) DEFAULT 18.00,
    stock_quantity INTEGER DEFAULT 0,
    vendor_name TEXT,
    vendor_contact TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUOTATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number TEXT UNIQUE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subtotal NUMERIC(12,2) DEFAULT 0,
    tax_percent NUMERIC(5,2) DEFAULT 18.00,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    -- GST fields
    gst_rate NUMERIC(5,2),
    gst_amount NUMERIC(12,2),
    cgst_amount NUMERIC(12,2),
    sgst_amount NUMERIC(12,2),
    igst_amount NUMERIC(12,2),
    total_with_gst NUMERIC(12,2),
    buyer_gstin TEXT,
    seller_gstin TEXT,
    place_of_supply TEXT,
    invoice_type TEXT CHECK (invoice_type IN ('B2B', 'B2C')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    valid_until DATE,
    notes TEXT,
    terms TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUOTE ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    material_name TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC(12,2) NOT NULL,
    unit TEXT DEFAULT 'piece',
    unit_price NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    -- GST fields
    hsn_sac_code TEXT,
    tax_rate NUMERIC(5,2),
    taxable_value NUMERIC(12,2),
    gst_amount NUMERIC(12,2),
    cgst_amount NUMERIC(12,2),
    sgst_amount NUMERIC(12,2),
    igst_amount NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ESTIMATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS estimations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimation_number TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    estimation_type TEXT DEFAULT 'rough' CHECK (estimation_type IN ('rough', 'detailed', 'fixed')),
    subtotal NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    margin_percent NUMERIC(5,2) DEFAULT 20.00,
    validity_days INTEGER DEFAULT 15,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'converted', 'expired')),
    notes TEXT,
    converted_to_quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ESTIMATION ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS estimation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimation_id UUID NOT NULL REFERENCES estimations(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    quantity NUMERIC(12,2) NOT NULL,
    unit TEXT DEFAULT 'piece',
    unit_price NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    booking_type TEXT CHECK (booking_type IN ('site_visit', 'consultation', 'material_delivery', 'installation')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    duration_hours NUMERIC(4,2),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPANY SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT DEFAULT 'PASADA Interiors',
    gstin TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    state_code TEXT,
    pin_code TEXT,
    email TEXT,
    phone TEXT,
    logo_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_gstin ON clients(gstin);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Visitors
CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page_name ON visitors(page_name);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON leads(submitted_at DESC);

-- Quotations
CREATE INDEX IF NOT EXISTS idx_quotations_project ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);

-- Quote Items
CREATE INDEX IF NOT EXISTS idx_quote_items_quotation ON quote_items(quotation_id);

-- Estimations
CREATE INDEX IF NOT EXISTS idx_estimations_project ON estimations(project_id);
CREATE INDEX IF NOT EXISTS idx_estimations_client ON estimations(client_id);
CREATE INDEX IF NOT EXISTS idx_estimations_status ON estimations(status);
CREATE INDEX IF NOT EXISTS idx_estimations_number ON estimations(estimation_number);

-- Estimation Items
CREATE INDEX IF NOT EXISTS idx_estimation_items_estimation ON estimation_items(estimation_id);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_project ON bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date);

-- Materials
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PERMISSIVE (Adjust for production)
-- ============================================

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- Clients (Admin/Staff can manage, Clients can view)
CREATE POLICY "Authenticated users can read clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert clients" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update clients" ON clients FOR UPDATE USING (auth.role() = 'authenticated');

-- Projects
CREATE POLICY "Authenticated users can read projects" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');

-- Visitors (Public can insert for tracking, Authenticated can read)
CREATE POLICY "Public can insert visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read visitors" ON visitors FOR SELECT USING (auth.role() = 'authenticated');

-- Leads (Public can submit, Authenticated can read)
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read leads" ON leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE USING (auth.role() = 'authenticated');

-- Materials
CREATE POLICY "Authenticated users can read materials" ON materials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage materials" ON materials FOR ALL USING (auth.role() = 'authenticated');

-- Quotations
CREATE POLICY "Authenticated users can read quotations" ON quotations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage quotations" ON quotations FOR ALL USING (auth.role() = 'authenticated');

-- Quote Items
CREATE POLICY "Authenticated users can read quote_items" ON quote_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage quote_items" ON quote_items FOR ALL USING (auth.role() = 'authenticated');

-- Estimations
CREATE POLICY "Authenticated users can read estimations" ON estimations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage estimations" ON estimations FOR ALL USING (auth.role() = 'authenticated');

-- Estimation Items
CREATE POLICY "Authenticated users can read estimation_items" ON estimation_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage estimation_items" ON estimation_items FOR ALL USING (auth.role() = 'authenticated');

-- Bookings
CREATE POLICY "Authenticated users can read bookings" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');

-- Company Settings
CREATE POLICY "Authenticated users can read company_settings" ON company_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update company_settings" ON company_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Audit Logs
CREATE POLICY "Authenticated users can read audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estimations_updated_at BEFORE UPDATE ON estimations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate quotation number
CREATE OR REPLACE FUNCTION set_quotation_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_part INTEGER;
BEGIN
    IF NEW.quotation_number IS NULL OR NEW.quotation_number = '' THEN
        year_part := TO_CHAR(NOW(), 'YYYY');
        
        SELECT COALESCE(
            MAX(
                CAST(
                    SUBSTRING(quotation_number FROM 'QT-' || year_part || '-(\d+)') 
                    AS INTEGER
                )
            ), 0) + 1
        INTO sequence_part
        FROM quotations
        WHERE quotation_number LIKE 'QT-' || year_part || '-%';
        
        NEW.quotation_number := 'QT-' || year_part || '-' || LPAD(sequence_part::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_quotation_number
    BEFORE INSERT ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION set_quotation_number();

-- Auto-generate estimation number
CREATE OR REPLACE FUNCTION set_estimation_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_part INTEGER;
BEGIN
    IF NEW.estimation_number IS NULL OR NEW.estimation_number = '' THEN
        year_part := TO_CHAR(NOW(), 'YYYY');
        
        SELECT COALESCE(
            MAX(
                CAST(
                    SUBSTRING(estimation_number FROM 'EST-' || year_part || '-(\d+)') 
                    AS INTEGER
                )
            ), 0) + 1
        INTO sequence_part
        FROM estimations
        WHERE estimation_number LIKE 'EST-' || year_part || '-%';
        
        NEW.estimation_number := 'EST-' || year_part || '-' || LPAD(sequence_part::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_estimation_number
    BEFORE INSERT ON estimations
    FOR EACH ROW
    EXECUTE FUNCTION set_estimation_number();

-- ============================================
-- INSERT DEFAULT COMPANY SETTINGS
-- ============================================
INSERT INTO company_settings (company_name, email, phone)
VALUES ('PASADA Interiors', 'contact@pasada.in', '+91 98765 43210')
ON CONFLICT DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All tables, indexes, RLS policies, and triggers are now created.
-- Your PASADA CRM database is ready to use!
-- ============================================
