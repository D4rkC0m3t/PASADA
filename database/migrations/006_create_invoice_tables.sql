-- ================================================
-- INVOICE & E-INVOICE TABLES MIGRATION
-- Version: 1.0
-- Purpose: Create tables for GST-compliant invoicing with IRN
-- ================================================

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    
    -- Invoice Details
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_terms TEXT DEFAULT 'Net 30',
    
    -- Amounts (from quotation)
    subtotal NUMERIC(12,2) NOT NULL,
    gst_rate NUMERIC(5,2) NOT NULL,
    gst_amount NUMERIC(12,2) NOT NULL,
    cgst_amount NUMERIC(12,2),
    sgst_amount NUMERIC(12,2),
    igst_amount NUMERIC(12,2),
    total_with_gst NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0,
    
    -- GST Details
    buyer_gstin TEXT,
    seller_gstin TEXT NOT NULL,
    place_of_supply TEXT NOT NULL,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('B2B', 'B2C')),
    reverse_charge TEXT DEFAULT 'N' CHECK (reverse_charge IN ('Y', 'N')),
    supply_type TEXT DEFAULT 'Goods' CHECK (supply_type IN ('Goods', 'Services', 'Both')),
    
    -- Payment Tracking
    paid_amount NUMERIC(12,2) DEFAULT 0,
    outstanding_amount NUMERIC(12,2),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partially_paid', 'fully_paid', 'overdue', 'cancelled')),
    
    -- E-Invoice Fields (NIC/GSP Integration)
    irn TEXT UNIQUE, -- Invoice Reference Number from GST portal
    ack_no TEXT, -- Acknowledgement number
    ack_date TIMESTAMP WITH TIME ZONE,
    signed_invoice TEXT, -- Digitally signed invoice JSON
    signed_qr_code TEXT, -- QR code data from e-invoice
    qr_code_image TEXT, -- Base64 encoded QR code image
    e_invoice_status TEXT DEFAULT 'pending' CHECK (e_invoice_status IN ('pending', 'generated', 'cancelled', 'failed')),
    e_invoice_error TEXT,
    irn_generated_at TIMESTAMP WITH TIME ZONE,
    irn_cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Documents
    pdf_url TEXT,
    e_invoice_pdf_url TEXT,
    
    -- Metadata
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    
    -- Item details
    category TEXT,
    description TEXT NOT NULL,
    hsn_sac_code TEXT,
    
    -- Pricing
    quantity NUMERIC(10,2) NOT NULL,
    unit TEXT DEFAULT 'pcs',
    unit_price NUMERIC(12,2) NOT NULL,
    taxable_value NUMERIC(12,2) NOT NULL,
    
    -- GST
    tax_rate NUMERIC(5,2) NOT NULL,
    gst_amount NUMERIC(12,2) NOT NULL,
    cgst_amount NUMERIC(12,2),
    sgst_amount NUMERIC(12,2),
    igst_amount NUMERIC(12,2),
    total NUMERIC(12,2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT invoice_items_unique_number UNIQUE (invoice_id, item_number)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    
    -- Payment Details
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other')),
    
    -- Transaction Details
    transaction_id TEXT,
    reference_number TEXT,
    bank_name TEXT,
    cheque_number TEXT,
    upi_id TEXT,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Metadata
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create e_invoice_logs table (for audit trail)
CREATE TABLE IF NOT EXISTS e_invoice_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Log Details
    action TEXT NOT NULL CHECK (action IN ('generate_irn', 'cancel_irn', 'get_irn', 'error')),
    request_payload JSONB,
    response_payload JSONB,
    status_code INTEGER,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quotation ON invoices(quotation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_e_invoice_status ON invoices(e_invoice_status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_irn ON invoices(irn);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_e_invoice_logs_invoice ON e_invoice_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_e_invoice_logs_created ON e_invoice_logs(created_at DESC);

-- Create function to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_part TEXT;
    month_part TEXT;
    sequence_part INTEGER;
BEGIN
    -- Get current year and month
    year_part := TO_CHAR(NOW(), 'YYYY');
    month_part := TO_CHAR(NOW(), 'MM');
    
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(invoice_number FROM 'INV-' || year_part || month_part || '-([0-9]+)') 
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_part
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_part || month_part || '-%';
    
    -- Format: INV-202410-001
    new_number := 'INV-' || year_part || month_part || '-' || LPAD(sequence_part::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- Create trigger to update outstanding amount
CREATE OR REPLACE FUNCTION update_invoice_outstanding()
RETURNS TRIGGER AS $$
BEGIN
    NEW.outstanding_amount := NEW.total_with_gst - NEW.paid_amount;
    
    -- Auto-update status based on payment
    IF NEW.paid_amount = 0 THEN
        IF NEW.status NOT IN ('draft', 'cancelled') THEN
            NEW.status := 'issued';
        END IF;
    ELSIF NEW.paid_amount >= NEW.total_with_gst THEN
        NEW.status := 'fully_paid';
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status := 'partially_paid';
    END IF;
    
    -- Check for overdue
    IF NEW.status IN ('issued', 'partially_paid') AND NEW.due_date < CURRENT_DATE THEN
        NEW.status := 'overdue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_outstanding
    BEFORE INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_outstanding();

-- Create trigger to update invoice paid amount when payment is added
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE invoices
        SET paid_amount = paid_amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE invoices
        SET paid_amount = paid_amount - OLD.amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE invoices
        SET paid_amount = paid_amount - OLD.amount,
            updated_at = NOW()
        WHERE id = OLD.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_on_payment
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_on_payment();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_invoice_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices"
    ON invoices FOR SELECT
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        ) OR
        client_id IN (
            SELECT id FROM clients WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admin/Staff can create invoices"
    ON invoices FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Admin/Staff can update invoices"
    ON invoices FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Admin can delete invoices"
    ON invoices FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Create RLS policies for invoice_items
CREATE POLICY "Users can view invoice items"
    ON invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND (
                invoices.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role IN ('admin', 'staff')
                ) OR
                invoices.client_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admin/Staff can manage invoice items"
    ON invoice_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

-- Create RLS policies for payments
CREATE POLICY "Users can view payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payments.invoice_id
            AND (
                invoices.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role IN ('admin', 'staff')
                ) OR
                invoices.client_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admin/Staff can manage payments"
    ON payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

-- Create RLS policies for e_invoice_logs
CREATE POLICY "Admin/Staff can view e-invoice logs"
    ON e_invoice_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "System can create e-invoice logs"
    ON e_invoice_logs FOR INSERT
    WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE invoices IS 'GST-compliant invoices with e-invoice (IRN) support';
COMMENT ON TABLE invoice_items IS 'Line items for invoices with GST details';
COMMENT ON TABLE payments IS 'Payment records for invoices';
COMMENT ON TABLE e_invoice_logs IS 'Audit trail for e-invoice API interactions';

COMMENT ON COLUMN invoices.irn IS 'Invoice Reference Number from GST portal (64 char alphanumeric)';
COMMENT ON COLUMN invoices.ack_no IS 'Acknowledgement number from GST portal';
COMMENT ON COLUMN invoices.signed_qr_code IS 'QR code data for e-invoice verification';
COMMENT ON COLUMN invoices.e_invoice_status IS 'Status of e-invoice generation';
COMMENT ON COLUMN invoices.reverse_charge IS 'Y if reverse charge applicable, N otherwise';
COMMENT ON COLUMN invoices.supply_type IS 'Type of supply: Goods, Services, or Both';
