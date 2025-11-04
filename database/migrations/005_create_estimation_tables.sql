-- ================================================
-- ESTIMATION TABLES MIGRATION
-- Version: 1.0
-- Purpose: Create tables for quick cost estimations
-- ================================================

-- Create estimations table
CREATE TABLE IF NOT EXISTS estimations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimation_number TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Estimation type
    estimation_type TEXT DEFAULT 'rough' CHECK (estimation_type IN ('rough', 'detailed', 'fixed')),
    
    -- Amounts (no GST for estimations)
    subtotal NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    
    -- Margin and validity
    margin_percent NUMERIC(5,2) DEFAULT 20,
    validity_days INTEGER DEFAULT 7,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'converted', 'expired')),
    
    -- Conversion tracking
    converted_to_quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create estimation_items table
CREATE TABLE IF NOT EXISTS estimation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimation_id UUID NOT NULL REFERENCES estimations(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    
    -- Item details
    category TEXT,
    description TEXT NOT NULL,
    specifications TEXT,
    
    -- Pricing
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    unit_price NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT estimation_items_unique_number UNIQUE (estimation_id, item_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_estimations_project ON estimations(project_id);
CREATE INDEX IF NOT EXISTS idx_estimations_client ON estimations(client_id);
CREATE INDEX IF NOT EXISTS idx_estimations_status ON estimations(status);
CREATE INDEX IF NOT EXISTS idx_estimations_created_at ON estimations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimations_number ON estimations(estimation_number);
CREATE INDEX IF NOT EXISTS idx_estimation_items_estimation ON estimation_items(estimation_id);

-- Create function to auto-generate estimation number
CREATE OR REPLACE FUNCTION generate_estimation_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_part TEXT;
    sequence_part INTEGER;
BEGIN
    -- Get current year
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(estimation_number FROM 'EST-' || year_part || '-([0-9]+)') 
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_part
    FROM estimations
    WHERE estimation_number LIKE 'EST-' || year_part || '-%';
    
    -- Format: EST-2024-001
    new_number := 'EST-' || year_part || '-' || LPAD(sequence_part::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate estimation number
CREATE OR REPLACE FUNCTION set_estimation_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estimation_number IS NULL OR NEW.estimation_number = '' THEN
        NEW.estimation_number := generate_estimation_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_estimation_number
    BEFORE INSERT ON estimations
    FOR EACH ROW
    EXECUTE FUNCTION set_estimation_number();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_estimations_updated_at
    BEFORE UPDATE ON estimations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for estimations
CREATE POLICY "Users can view their own estimations"
    ON estimations FOR SELECT
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Users can create estimations"
    ON estimations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Users can update their own estimations"
    ON estimations FOR UPDATE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Users can delete their own estimations"
    ON estimations FOR DELETE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Create RLS policies for estimation_items
CREATE POLICY "Users can view estimation items"
    ON estimation_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM estimations
            WHERE estimations.id = estimation_items.estimation_id
            AND (
                estimations.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role IN ('admin', 'staff')
                )
            )
        )
    );

CREATE POLICY "Users can create estimation items"
    ON estimation_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM estimations
            WHERE estimations.id = estimation_items.estimation_id
            AND (
                estimations.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role IN ('admin', 'staff')
                )
            )
        )
    );

CREATE POLICY "Users can update estimation items"
    ON estimation_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM estimations
            WHERE estimations.id = estimation_items.estimation_id
            AND (
                estimations.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role IN ('admin', 'staff')
                )
            )
        )
    );

CREATE POLICY "Users can delete estimation items"
    ON estimation_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM estimations
            WHERE estimations.id = estimation_items.estimation_id
            AND (
                estimations.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role IN ('admin', 'staff')
                )
            )
        )
    );

-- Add comments for documentation
COMMENT ON TABLE estimations IS 'Quick cost estimations before formal quotations';
COMMENT ON TABLE estimation_items IS 'Line items for estimations';
COMMENT ON COLUMN estimations.estimation_type IS 'rough: ±20%, detailed: ±10%, fixed: exact price';
COMMENT ON COLUMN estimations.margin_percent IS 'Profit margin percentage';
COMMENT ON COLUMN estimations.validity_days IS 'Number of days the estimation is valid';
COMMENT ON COLUMN estimations.converted_to_quotation_id IS 'Reference to quotation if converted';
