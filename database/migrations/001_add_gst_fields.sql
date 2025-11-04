-- ================================================
-- GST Implementation - Migration 001
-- Add GST fields to existing tables
-- ================================================

-- ================================================
-- 1. CLIENTS TABLE - Add GST fields
-- ================================================

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS gstin VARCHAR(15),
ADD COLUMN IF NOT EXISTS state_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS pan VARCHAR(10),
ADD COLUMN IF NOT EXISTS client_type VARCHAR(10) DEFAULT 'B2C' CHECK (client_type IN ('B2B', 'B2C'));

-- Add index for faster GSTIN lookups
CREATE INDEX IF NOT EXISTS idx_clients_gstin ON clients(gstin);

-- Add comments
COMMENT ON COLUMN clients.gstin IS 'GST Identification Number (15 characters)';
COMMENT ON COLUMN clients.state_code IS 'GST State Code (2 digits)';
COMMENT ON COLUMN clients.pan IS 'Permanent Account Number (10 characters)';
COMMENT ON COLUMN clients.client_type IS 'B2B (registered) or B2C (unregistered)';

-- ================================================
-- 2. QUOTATIONS TABLE - Add GST fields
-- ================================================

ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5,2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_with_gst DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_tax_inclusive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS buyer_gstin VARCHAR(15),
ADD COLUMN IF NOT EXISTS seller_gstin VARCHAR(15),
ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(50),
ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(10) CHECK (invoice_type IN ('B2B', 'B2C')),
ADD COLUMN IF NOT EXISTS irn VARCHAR(64),
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS signed_invoice_json JSONB,
ADD COLUMN IF NOT EXISTS einvoice_status VARCHAR(20) DEFAULT 'pending' CHECK (einvoice_status IN ('pending', 'generated', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS einvoice_generated_at TIMESTAMP WITH TIME ZONE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quotations_irn ON quotations(irn);
CREATE INDEX IF NOT EXISTS idx_quotations_einvoice_status ON quotations(einvoice_status);
CREATE INDEX IF NOT EXISTS idx_quotations_buyer_gstin ON quotations(buyer_gstin);

-- Add comments
COMMENT ON COLUMN quotations.gst_rate IS 'GST rate percentage (e.g., 18.00 for 18%)';
COMMENT ON COLUMN quotations.gst_amount IS 'Total GST amount';
COMMENT ON COLUMN quotations.cgst_amount IS 'Central GST (for intra-state)';
COMMENT ON COLUMN quotations.sgst_amount IS 'State GST (for intra-state)';
COMMENT ON COLUMN quotations.igst_amount IS 'Integrated GST (for inter-state)';
COMMENT ON COLUMN quotations.total_with_gst IS 'Grand total including GST';
COMMENT ON COLUMN quotations.is_tax_inclusive IS 'Whether prices include tax';
COMMENT ON COLUMN quotations.buyer_gstin IS 'Client GSTIN';
COMMENT ON COLUMN quotations.seller_gstin IS 'Company GSTIN';
COMMENT ON COLUMN quotations.place_of_supply IS 'State where supply is made';
COMMENT ON COLUMN quotations.invoice_type IS 'B2B or B2C transaction';
COMMENT ON COLUMN quotations.irn IS 'Invoice Reference Number (e-invoice)';
COMMENT ON COLUMN quotations.qr_code_url IS 'E-invoice QR code URL';
COMMENT ON COLUMN quotations.signed_invoice_json IS 'Signed e-invoice JSON from GST portal';
COMMENT ON COLUMN quotations.einvoice_status IS 'E-invoice generation status';

-- ================================================
-- 3. QUOTE_ITEMS TABLE - Add GST fields
-- ================================================

ALTER TABLE quote_items
ADD COLUMN IF NOT EXISTS hsn_sac_code VARCHAR(8),
ADD COLUMN IF NOT EXISTS taxable_value DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(12,2) DEFAULT 0;

-- Add index
CREATE INDEX IF NOT EXISTS idx_quote_items_hsn_sac ON quote_items(hsn_sac_code);

-- Add comments
COMMENT ON COLUMN quote_items.hsn_sac_code IS 'HSN (goods) or SAC (services) code';
COMMENT ON COLUMN quote_items.taxable_value IS 'Value before tax';
COMMENT ON COLUMN quote_items.tax_rate IS 'GST rate for this item';
COMMENT ON COLUMN quote_items.gst_amount IS 'Total GST for this item';
COMMENT ON COLUMN quote_items.cgst_amount IS 'CGST for this item';
COMMENT ON COLUMN quote_items.sgst_amount IS 'SGST for this item';
COMMENT ON COLUMN quote_items.igst_amount IS 'IGST for this item';

-- ================================================
-- 4. UPDATE EXISTING RECORDS (Optional)
-- ================================================

-- Set default seller GSTIN for existing quotations
-- UPDATE quotations 
-- SET seller_gstin = '29ABCDE1234F1Z5' 
-- WHERE seller_gstin IS NULL;

-- Set default invoice type based on buyer GSTIN
-- UPDATE quotations 
-- SET invoice_type = CASE 
--     WHEN buyer_gstin IS NOT NULL AND buyer_gstin != '' THEN 'B2B'
--     ELSE 'B2C'
-- END
-- WHERE invoice_type IS NULL;

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
