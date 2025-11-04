-- ================================================
-- GST Implementation - Migration 004
-- Insert PASADA Company Data (Actual GST Details)
-- ================================================

-- Insert PASADA company settings with actual GST details
INSERT INTO company_settings (
    company_name,
    gstin,
    pan,
    state_code,
    address,
    city,
    state,
    pincode,
    country,
    email,
    phone,
    
    -- Bank Details (to be updated)
    bank_name,
    bank_account_number,
    bank_ifsc,
    bank_branch,
    
    -- GST Settings
    gst_enabled,
    default_gst_rate,
    
    -- E-Invoice Settings
    einvoice_enabled
) VALUES (
    -- Company Information
    'PASADA',  -- Trade name
    '29CGRPB3179A1ZD',  -- Actual GSTIN from certificate
    'CGRPB3179A',  -- PAN extracted from GSTIN
    '29',  -- Karnataka state code
    'Floor No.: Khatha No/Survey No 314/12/11B, Building No./Flat No.: Property bearing No.47, Road/Street: K Narayanapura Village, Locality: Kothnur Narayanapura',
    'Bengaluru',
    'Karnataka',
    '560077',
    'India',
    'hello@pasada.in',  -- Update with actual email
    '+91-98765-43210',  -- Update with actual phone
    
    -- Bank Details (Update these with actual bank details)
    'HDFC Bank Ltd',  -- Update with actual bank name
    '50200012345678',  -- Update with actual account number
    'HDFC0000155',  -- Update with actual IFSC
    'Indiranagar, Bengaluru',  -- Update with actual branch
    
    -- GST Settings
    TRUE,  -- GST enabled
    18.00,  -- Default 18% GST rate
    
    -- E-Invoice Settings
    FALSE  -- E-invoice disabled initially (enable after API setup)
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    gstin = EXCLUDED.gstin,
    pan = EXCLUDED.pan,
    state_code = EXCLUDED.state_code,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    pincode = EXCLUDED.pincode,
    updated_at = NOW();

-- ================================================
-- Add Legal Name as Additional Field
-- ================================================

-- Add legal_name column if not exists
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS legal_name TEXT;

-- Update with legal name
UPDATE company_settings
SET legal_name = 'SAJEEDA BEGUM'
WHERE gstin = '29CGRPB3179A1ZD';

-- Add constitution type
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS constitution_type TEXT;

UPDATE company_settings
SET constitution_type = 'Proprietorship'
WHERE gstin = '29CGRPB3179A1ZD';

-- Add GST registration date
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS gst_registration_date DATE;

UPDATE company_settings
SET gst_registration_date = '2025-10-29'
WHERE gstin = '29CGRPB3179A1ZD';

-- ================================================
-- Insert Common HSN/SAC Codes for Interior Design
-- ================================================

INSERT INTO hsn_sac_master (code, description, type, category, gst_rate) VALUES
-- Services
('998361', 'Interior Design Services', 'SAC', 'Design Services', 18.00),
('995415', 'Architectural Services', 'SAC', 'Professional Services', 18.00),
('998366', 'Specialty Design Services', 'SAC', 'Design Services', 18.00),

-- Furniture & Fittings
('940330', 'Wooden Furniture for Offices', 'HSN', 'Furniture', 18.00),
('940340', 'Wooden Furniture for Kitchens', 'HSN', 'Furniture', 18.00),
('940350', 'Wooden Furniture for Bedrooms', 'HSN', 'Furniture', 18.00),
('940360', 'Other Wooden Furniture', 'HSN', 'Furniture', 18.00),
('940380', 'Furniture of Other Materials', 'HSN', 'Furniture', 18.00),

-- Materials
('392190', 'Plastic Sheets/Films/Laminates', 'HSN', 'Materials', 18.00),
('392010', 'Plastic Plates/Sheets', 'HSN', 'Materials', 18.00),
('441400', 'Wooden Articles', 'HSN', 'Materials', 18.00),
('701000', 'Glass Products', 'HSN', 'Materials', 18.00),
('830241', 'Door Fittings', 'HSN', 'Hardware', 18.00),
('830242', 'Cabinet Fittings', 'HSN', 'Hardware', 18.00),

-- Lighting
('940510', 'Chandeliers and Electric Ceiling Lights', 'HSN', 'Lighting', 18.00),
('940520', 'Electric Table/Desk/Bedside Lamps', 'HSN', 'Lighting', 18.00),
('940540', 'Other Electric Lamps', 'HSN', 'Lighting', 18.00),

-- Textiles
('630392', 'Curtains and Interior Blinds', 'HSN', 'Textiles', 12.00),
('570110', 'Carpets of Wool', 'HSN', 'Textiles', 12.00)

ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description,
    gst_rate = EXCLUDED.gst_rate,
    updated_at = NOW();

-- ================================================
-- IMPORTANT NOTES
-- ================================================

-- TODO: Update the following with actual details:
-- 1. Bank account number
-- 2. Bank IFSC code
-- 3. Bank branch name
-- 4. Company email (if different)
-- 5. Company phone (if different)
-- 6. Logo URL (after uploading company logo)
-- 7. Signature URL (after uploading authorized signatory signature)

-- For E-Invoice:
-- 1. Register on e-invoice portal: https://einvoice1.gst.gov.in/
-- 2. Get API credentials from GSP (ClearTax, Zoho, IRIS, etc.)
-- 3. Update einvoice_api_url, einvoice_api_key, einvoice_username
-- 4. Set einvoice_enabled = TRUE after testing

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
