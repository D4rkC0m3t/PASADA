-- ============================================
-- CREATE ALL POTENTIALLY MISSING TABLES
-- Run this to add any tables your app needs
-- ============================================

-- ============================================
-- 1. VISITORS TABLE (Analytics)
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
-- 2. ESTIMATIONS TABLE
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
-- 3. ESTIMATION ITEMS TABLE
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
-- 4. MATERIALS TABLE
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
-- 5. BOOKINGS TABLE
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
-- 6. COMPANY SETTINGS TABLE
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
-- CREATE INDEXES
-- ============================================

-- Visitors indexes
CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page_name ON visitors(page_name);
CREATE INDEX IF NOT EXISTS idx_visitors_referrer ON visitors(referrer);

-- Estimations indexes
CREATE INDEX IF NOT EXISTS idx_estimations_project ON estimations(project_id);
CREATE INDEX IF NOT EXISTS idx_estimations_client ON estimations(client_id);
CREATE INDEX IF NOT EXISTS idx_estimations_status ON estimations(status);
CREATE INDEX IF NOT EXISTS idx_estimations_number ON estimations(estimation_number);
CREATE INDEX IF NOT EXISTS idx_estimation_items_estimation ON estimation_items(estimation_id);

-- Materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_project ON bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Visitors: Public can insert, Authenticated can read
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'visitors' AND policyname = 'Allow public to insert visitors') THEN
        CREATE POLICY "Allow public to insert visitors" ON visitors FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'visitors' AND policyname = 'Allow authenticated users to read visitors') THEN
        CREATE POLICY "Allow authenticated users to read visitors" ON visitors FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Estimations: Authenticated users can manage
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estimations' AND policyname = 'Allow authenticated users to read estimations') THEN
        CREATE POLICY "Allow authenticated users to read estimations" ON estimations FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estimations' AND policyname = 'Allow authenticated users to manage estimations') THEN
        CREATE POLICY "Allow authenticated users to manage estimations" ON estimations FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Estimation Items: Authenticated users can manage
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estimation_items' AND policyname = 'Allow authenticated users to manage estimation_items') THEN
        CREATE POLICY "Allow authenticated users to manage estimation_items" ON estimation_items FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Materials: Authenticated users can manage
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materials' AND policyname = 'Allow authenticated users to manage materials') THEN
        CREATE POLICY "Allow authenticated users to manage materials" ON materials FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Bookings: Authenticated users can manage
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Allow authenticated users to manage bookings') THEN
        CREATE POLICY "Allow authenticated users to manage bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Company Settings: Authenticated can read, admin can update
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_settings' AND policyname = 'Allow authenticated users to read company_settings') THEN
        CREATE POLICY "Allow authenticated users to read company_settings" ON company_settings FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- ============================================
-- AUTO-NUMBER TRIGGERS
-- ============================================

-- Estimation number auto-generation
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

-- Create trigger if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_estimation_number') THEN
        CREATE TRIGGER trigger_set_estimation_number
            BEFORE INSERT ON estimations
            FOR EACH ROW
            EXECUTE FUNCTION set_estimation_number();
    END IF;
END $$;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default company settings
INSERT INTO company_settings (company_name, gstin, email, phone)
VALUES ('PASADA Interiors', 'GSTIN_NOT_SET', 'contact@pasada.in', '+91 98765 43210')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all created tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('visitors', 'estimations', 'estimation_items', 'materials', 'bookings', 'company_settings')
ORDER BY table_name;

-- ============================================
-- SUCCESS! All essential tables created
-- ============================================
