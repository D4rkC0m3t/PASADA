-- ================================================
-- PASADA CRM - Complete Database Schema
-- Version: 1.0
-- Database: PostgreSQL (Supabase)
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CORE TABLES
-- ================================================

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    zip_code TEXT,
    type TEXT CHECK (type IN ('residential', 'commercial', 'retail', 'hospitality', 'other')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    site_location TEXT,
    type TEXT CHECK (type IN ('kitchen', 'bedroom', 'living_room', 'office', 'full_home', 'commercial', 'other')),
    area_sqft NUMERIC(10,2),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'design', 'quotation', 'approved', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    budget NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    start_date DATE,
    end_date DATE,
    completion_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number TEXT UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subtotal NUMERIC(12,2) DEFAULT 0,
    tax_percent NUMERIC(5,2) DEFAULT 18.00,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'revised', 'expired')),
    version INTEGER DEFAULT 1,
    valid_until DATE,
    notes TEXT,
    terms_and_conditions TEXT,
    payment_terms TEXT,
    pdf_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Quote Items Table
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    category TEXT,
    description TEXT NOT NULL,
    specifications TEXT,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    unit_price NUMERIC(12,2) NOT NULL,
    tax_percent NUMERIC(5,2) DEFAULT 18.00,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    discount_amount NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price * discount_percent / 100) STORED,
    tax_amount NUMERIC(12,2) GENERATED ALWAYS AS ((quantity * unit_price - (quantity * unit_price * discount_percent / 100)) * tax_percent / 100) STORED,
    total NUMERIC(12,2) GENERATED ALWAYS AS (
        quantity * unit_price - 
        (quantity * unit_price * discount_percent / 100) + 
        ((quantity * unit_price - (quantity * unit_price * discount_percent / 100)) * tax_percent / 100)
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials Catalog Table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    unit TEXT DEFAULT 'pcs',
    unit_price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2),
    tax_percent NUMERIC(5,2) DEFAULT 18.00,
    stock_quantity NUMERIC(10,2) DEFAULT 0,
    min_stock_level NUMERIC(10,2) DEFAULT 0,
    supplier_name TEXT,
    supplier_contact TEXT,
    lead_time_days INTEGER,
    image_url TEXT,
    specifications JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    zip_code TEXT,
    category TEXT,
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
    payment_terms TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('quotation', 'invoice', 'email', 'other')),
    header_logo TEXT,
    header_text TEXT,
    footer_text TEXT,
    terms_and_conditions TEXT,
    payment_terms TEXT,
    styles JSONB,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings/Consultations Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    booking_type TEXT CHECK (booking_type IN ('consultation', 'site_visit', 'design_review', 'measurement', 'installation', 'other')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    reminder_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'client')),
    phone TEXT,
    avatar_url TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotations_project_id ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quote_items_quotation_id ON quote_items(quotation_id);

CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_sku ON materials(sku);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_items_updated_at BEFORE UPDATE ON quote_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate quotation number
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 10) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM quotations
    WHERE quotation_number LIKE 'PASADA-' || year_part || '-%';
    
    new_number := 'PASADA-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate quotation number
CREATE OR REPLACE FUNCTION set_quotation_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quotation_number IS NULL THEN
        NEW.quotation_number := generate_quotation_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quotation_number_trigger
    BEFORE INSERT ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION set_quotation_number();

-- Function to update quotation totals when items change
CREATE OR REPLACE FUNCTION update_quotation_totals()
RETURNS TRIGGER AS $$
DECLARE
    quote_subtotal NUMERIC(12,2);
    quote_tax NUMERIC(12,2);
    quote_discount NUMERIC(12,2);
    quote_total NUMERIC(12,2);
BEGIN
    -- Calculate totals from quote items
    SELECT 
        COALESCE(SUM(subtotal), 0),
        COALESCE(SUM(tax_amount), 0),
        COALESCE(SUM(discount_amount), 0),
        COALESCE(SUM(total), 0)
    INTO quote_subtotal, quote_tax, quote_discount, quote_total
    FROM quote_items
    WHERE quotation_id = COALESCE(NEW.quotation_id, OLD.quotation_id);
    
    -- Update quotation
    UPDATE quotations
    SET 
        subtotal = quote_subtotal,
        tax_amount = quote_tax,
        discount_amount = quote_discount,
        total_amount = quote_total
    WHERE id = COALESCE(NEW.quotation_id, OLD.quotation_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotation_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON quote_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quotation_totals();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, new_values)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_quotations AFTER INSERT OR UPDATE OR DELETE ON quotations
    FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================

-- Default quotation template
INSERT INTO templates (name, type, is_default, terms_and_conditions, payment_terms)
VALUES (
    'Default Quotation Template',
    'quotation',
    true,
    E'1. This quotation is valid for 30 days from the date of issue.\n2. Prices are subject to change without notice.\n3. Installation charges are not included unless specified.\n4. Custom designs require 50% advance payment.\n5. Warranty terms apply as per manufacturer specifications.',
    E'Payment Terms:\n- 50% advance on order confirmation\n- 40% on material delivery\n- 10% on project completion\n\nAccepted Payment Methods: Bank Transfer, UPI, Cash'
) ON CONFLICT DO NOTHING;

-- Sample material categories data
INSERT INTO materials (sku, name, category, subcategory, unit, unit_price, cost_price, tax_percent)
VALUES 
    ('MAT-001', 'Premium Laminate Sheet (8x4 ft)', 'Laminates', 'Premium', 'sheet', 2500.00, 2000.00, 18.00),
    ('MAT-002', 'Modular Kitchen Cabinet Unit', 'Cabinets', 'Base Unit', 'unit', 12000.00, 9000.00, 18.00),
    ('MAT-003', 'Soft Close Hinges', 'Hardware', 'Hinges', 'pcs', 250.00, 180.00, 18.00),
    ('MAT-004', 'Granite Countertop (per sqft)', 'Countertops', 'Natural Stone', 'sqft', 450.00, 350.00, 18.00),
    ('MAT-005', 'LED Strip Light (per meter)', 'Lighting', 'Task Lighting', 'meter', 180.00, 120.00, 18.00)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE clients IS 'Stores client information';
COMMENT ON TABLE projects IS 'Stores project details linked to clients';
COMMENT ON TABLE quotations IS 'Stores quotation headers with totals';
COMMENT ON TABLE quote_items IS 'Stores individual line items for quotations';
COMMENT ON TABLE materials IS 'Material catalog for quotations';
COMMENT ON TABLE vendors IS 'Vendor/supplier information';
COMMENT ON TABLE templates IS 'Templates for quotations, invoices, emails';
COMMENT ON TABLE bookings IS 'Consultation and site visit bookings';
COMMENT ON TABLE audit_logs IS 'Audit trail for all important operations';
COMMENT ON TABLE user_profiles IS 'Extended user information beyond Supabase auth';
