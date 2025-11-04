# 🧾 GST & E-Invoice Implementation Plan - PASADA CRM

**Status:** 🚧 In Progress  
**Priority:** High (Compliance & Audit-Ready)  
**Target Completion:** Sprint 3

---

## 📋 Implementation Checklist

### **Phase 1: Database Schema Updates** ⏳

#### **1.1 Clients Table Enhancement**
- [ ] Add `gstin` field (string, 15 chars)
- [ ] Add `state_code` field (string, 2 chars)
- [ ] Add `pan` field (string, 10 chars)
- [ ] Add `client_type` enum ('B2B', 'B2C')
- [ ] Add validation for GSTIN format
- [ ] Create index on `gstin` for faster lookups

#### **1.2 Quotations Table Enhancement**
- [ ] Add `gst_rate` (decimal, default 18%)
- [ ] Add `gst_amount` (decimal, calculated)
- [ ] Add `cgst_amount` (decimal)
- [ ] Add `sgst_amount` (decimal)
- [ ] Add `igst_amount` (decimal)
- [ ] Add `total_with_gst` (decimal)
- [ ] Add `is_tax_inclusive` (boolean, default false)
- [ ] Add `buyer_gstin` (string)
- [ ] Add `seller_gstin` (string)
- [ ] Add `place_of_supply` (string)
- [ ] Add `invoice_type` enum ('B2B', 'B2C')
- [ ] Add `irn` (string, for e-invoice)
- [ ] Add `qr_code_url` (string)
- [ ] Add `signed_invoice_json` (jsonb)
- [ ] Add `einvoice_status` enum ('pending', 'generated', 'failed', 'cancelled')
- [ ] Add `einvoice_generated_at` (timestamp)

#### **1.3 Quote Items Table Enhancement**
- [ ] Add `hsn_sac_code` (string, 6-8 chars)
- [ ] Add `taxable_value` (decimal)
- [ ] Add `tax_rate` (decimal)
- [ ] Add `gst_amount` (decimal)
- [ ] Add `cgst_amount` (decimal)
- [ ] Add `sgst_amount` (decimal)
- [ ] Add `igst_amount` (decimal)

#### **1.4 Company Settings Table (New)**
- [ ] Create `company_settings` table
- [ ] Add `company_name` (string)
- [ ] Add `gstin` (string)
- [ ] Add `pan` (string)
- [ ] Add `cin` (string)
- [ ] Add `state_code` (string)
- [ ] Add `address` (text)
- [ ] Add `email` (string)
- [ ] Add `phone` (string)
- [ ] Add `bank_name` (string)
- [ ] Add `bank_account_number` (string)
- [ ] Add `bank_ifsc` (string)
- [ ] Add `bank_branch` (string)
- [ ] Add `logo_url` (string)
- [ ] Add `gst_enabled` (boolean, default true)
- [ ] Add `einvoice_enabled` (boolean, default false)

#### **1.5 HSN/SAC Master Table (New)**
- [ ] Create `hsn_sac_master` table
- [ ] Add `code` (string, primary key)
- [ ] Add `description` (text)
- [ ] Add `type` enum ('HSN', 'SAC')
- [ ] Add `gst_rate` (decimal)
- [ ] Add `is_active` (boolean)

#### **1.6 GST Audit Log Table (New)**
- [ ] Create `gst_audit_log` table
- [ ] Add `quotation_id` (uuid, foreign key)
- [ ] Add `action` enum ('created', 'updated', 'einvoice_generated', 'cancelled')
- [ ] Add `old_values` (jsonb)
- [ ] Add `new_values` (jsonb)
- [ ] Add `user_id` (uuid)
- [ ] Add `timestamp` (timestamp)
- [ ] Add `ip_address` (string)

---

### **Phase 2: Backend Logic Implementation** ⏳

#### **2.1 GST Calculation Utilities**
- [ ] Create `lib/gst/calculator.ts`
  - [ ] `calculateGST(amount, rate)` - Basic GST calculation
  - [ ] `calculateIntraStateGST(amount, rate)` - CGST + SGST
  - [ ] `calculateInterStateGST(amount, rate)` - IGST
  - [ ] `determineGSTType(sellerState, buyerState)` - Intra vs Inter
  - [ ] `roundGSTAmount(amount)` - Round to 2 decimals
  - [ ] `calculateTotalWithGST(subtotal, gstAmount, discount)`

#### **2.2 GSTIN Validation**
- [ ] Create `lib/gst/validation.ts`
  - [ ] `validateGSTIN(gstin)` - Format validation (15 chars)
  - [ ] `extractStateCode(gstin)` - Get state from GSTIN
  - [ ] `extractPAN(gstin)` - Get PAN from GSTIN
  - [ ] `validateHSNCode(code)` - HSN format validation
  - [ ] `validateSACCode(code)` - SAC format validation

#### **2.3 E-Invoice Integration**
- [ ] Create `lib/gst/einvoice.ts`
  - [ ] `generateEInvoice(quotationId)` - Main function
  - [ ] `prepareInvoicePayload(quotation)` - Format data
  - [ ] `callEInvoiceAPI(payload)` - API integration
  - [ ] `storeIRN(quotationId, irn, qrCode)` - Save response
  - [ ] `cancelEInvoice(quotationId, reason)` - Cancellation
  - [ ] `retryFailedInvoice(quotationId)` - Retry logic

#### **2.4 PDF Generation with GST**
- [ ] Update `lib/pdf/quotation-template.tsx`
  - [ ] Add GST breakdown section
  - [ ] Add GSTIN display
  - [ ] Add HSN/SAC codes in line items
  - [ ] Add tax calculation table
  - [ ] Add bank details section
  - [ ] Add e-invoice QR code (if available)
  - [ ] Add IRN display
  - [ ] Add declaration text

#### **2.5 API Routes**
- [ ] Create `app/api/gst/calculate/route.ts` - Calculate GST
- [ ] Create `app/api/gst/validate-gstin/route.ts` - Validate GSTIN
- [ ] Create `app/api/einvoice/generate/route.ts` - Generate e-invoice
- [ ] Create `app/api/einvoice/cancel/route.ts` - Cancel e-invoice
- [ ] Create `app/api/einvoice/status/route.ts` - Check status
- [ ] Create `app/api/settings/company/route.ts` - Company settings CRUD

---

### **Phase 3: Frontend Implementation** ⏳

#### **3.1 Company Settings Page**
- [ ] Create `app/admin/settings/company/page.tsx`
  - [ ] Company details form
  - [ ] GST information section
  - [ ] Bank details section
  - [ ] E-invoice settings toggle
  - [ ] Logo upload
  - [ ] Validation and save

#### **3.2 Enhanced Quotation Builder**
- [ ] Update `app/admin/quotations/builder/page.tsx`
  - [ ] Add GST rate selector (5%, 12%, 18%, 28%)
  - [ ] Add HSN/SAC code input per item
  - [ ] Add tax-inclusive toggle
  - [ ] Show GST breakdown in preview
  - [ ] Auto-calculate CGST/SGST or IGST
  - [ ] Display total with GST
  - [ ] Add client GSTIN field
  - [ ] Auto-detect invoice type (B2B/B2C)

#### **3.3 Quotation Preview/View**
- [ ] Update `app/admin/quotations/[id]/page.tsx`
  - [ ] Display GST breakdown
  - [ ] Show HSN/SAC codes
  - [ ] Display GSTIN of both parties
  - [ ] Show tax calculation details
  - [ ] Add "Generate E-Invoice" button
  - [ ] Display IRN and QR code if generated
  - [ ] Show e-invoice status badge

#### **3.4 Client Form Enhancement**
- [ ] Update `app/admin/clients/new/page.tsx`
  - [ ] Add GSTIN input field
  - [ ] Add state code dropdown (GST state codes)
  - [ ] Add PAN input field
  - [ ] Add client type selector (B2B/B2C)
  - [ ] Add GSTIN validation
  - [ ] Auto-extract state from GSTIN

#### **3.5 GST Reports Dashboard**
- [ ] Create `app/admin/reports/gst/page.tsx`
  - [ ] Monthly GST summary
  - [ ] CGST/SGST/IGST breakdown
  - [ ] B2B vs B2C analysis
  - [ ] E-invoice generation status
  - [ ] Export to Excel/CSV
  - [ ] GSTR-1 ready format

#### **3.6 HSN/SAC Master Management**
- [ ] Create `app/admin/settings/hsn-sac/page.tsx`
  - [ ] List all HSN/SAC codes
  - [ ] Add/Edit/Delete codes
  - [ ] Import from CSV
  - [ ] Search and filter
  - [ ] Set default GST rates

---

### **Phase 4: PDF Template Enhancement** ⏳

#### **4.1 Professional Quotation Template**
- [ ] Create `components/pdf/EnhancedQuotationTemplate.tsx`
  - [ ] Header with company logo and GSTIN
  - [ ] Client details with GSTIN
  - [ ] Quotation metadata (number, date, validity)
  - [ ] Line items table with HSN/SAC
  - [ ] Subtotal calculation
  - [ ] GST breakdown (CGST/SGST or IGST)
  - [ ] Total with GST
  - [ ] Amount in words
  - [ ] Terms and conditions
  - [ ] Bank details section
  - [ ] Authorized signatory
  - [ ] E-invoice QR code (if applicable)
  - [ ] Footer with declaration

#### **4.2 Invoice Template**
- [ ] Create `components/pdf/InvoiceTemplate.tsx`
  - [ ] Similar to quotation but with "INVOICE" header
  - [ ] Add invoice-specific fields
  - [ ] Add payment status
  - [ ] Add due date
  - [ ] IRN and QR code mandatory for e-invoice

---

### **Phase 5: Testing & Validation** ⏳

#### **5.1 Unit Tests**
- [ ] Test GST calculation functions
- [ ] Test GSTIN validation
- [ ] Test HSN/SAC validation
- [ ] Test intra vs inter-state logic
- [ ] Test rounding functions

#### **5.2 Integration Tests**
- [ ] Test quotation creation with GST
- [ ] Test e-invoice generation flow
- [ ] Test PDF generation with GST
- [ ] Test GST reports
- [ ] Test audit log creation

#### **5.3 Manual Testing**
- [ ] Create B2B quotation (intra-state)
- [ ] Create B2B quotation (inter-state)
- [ ] Create B2C quotation
- [ ] Generate e-invoice
- [ ] Cancel e-invoice
- [ ] Export GST reports
- [ ] Verify PDF output

---

## 🗂️ Database Migration Scripts

### **Migration 1: Add GST fields to existing tables**
```sql
-- File: database/migrations/001_add_gst_fields.sql

-- Clients table
ALTER TABLE clients
ADD COLUMN gstin VARCHAR(15),
ADD COLUMN state_code VARCHAR(2),
ADD COLUMN pan VARCHAR(10),
ADD COLUMN client_type VARCHAR(10) DEFAULT 'B2C' CHECK (client_type IN ('B2B', 'B2C'));

CREATE INDEX idx_clients_gstin ON clients(gstin);

-- Quotations table
ALTER TABLE quotations
ADD COLUMN gst_rate DECIMAL(5,2) DEFAULT 18.00,
ADD COLUMN gst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN cgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN sgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN igst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN total_with_gst DECIMAL(12,2) DEFAULT 0,
ADD COLUMN is_tax_inclusive BOOLEAN DEFAULT FALSE,
ADD COLUMN buyer_gstin VARCHAR(15),
ADD COLUMN seller_gstin VARCHAR(15),
ADD COLUMN place_of_supply VARCHAR(50),
ADD COLUMN invoice_type VARCHAR(10) CHECK (invoice_type IN ('B2B', 'B2C')),
ADD COLUMN irn VARCHAR(64),
ADD COLUMN qr_code_url TEXT,
ADD COLUMN signed_invoice_json JSONB,
ADD COLUMN einvoice_status VARCHAR(20) DEFAULT 'pending' CHECK (einvoice_status IN ('pending', 'generated', 'failed', 'cancelled')),
ADD COLUMN einvoice_generated_at TIMESTAMP WITH TIME ZONE;

-- Quote items table
ALTER TABLE quote_items
ADD COLUMN hsn_sac_code VARCHAR(8),
ADD COLUMN taxable_value DECIMAL(12,2),
ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 18.00,
ADD COLUMN gst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN cgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN sgst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN igst_amount DECIMAL(12,2) DEFAULT 0;
```

### **Migration 2: Create new tables**
```sql
-- File: database/migrations/002_create_gst_tables.sql

-- Company Settings
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    gstin VARCHAR(15) NOT NULL,
    pan VARCHAR(10),
    cin VARCHAR(21),
    state_code VARCHAR(2) NOT NULL,
    address TEXT,
    city TEXT,
    pincode VARCHAR(6),
    email TEXT,
    phone TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc VARCHAR(11),
    bank_branch TEXT,
    logo_url TEXT,
    gst_enabled BOOLEAN DEFAULT TRUE,
    einvoice_enabled BOOLEAN DEFAULT FALSE,
    einvoice_api_url TEXT,
    einvoice_api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HSN/SAC Master
CREATE TABLE IF NOT EXISTS hsn_sac_master (
    code VARCHAR(8) PRIMARY KEY,
    description TEXT NOT NULL,
    type VARCHAR(3) CHECK (type IN ('HSN', 'SAC')),
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GST Audit Log
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

CREATE INDEX idx_gst_audit_quotation ON gst_audit_log(quotation_id);
CREATE INDEX idx_gst_audit_created_at ON gst_audit_log(created_at);

-- Insert default company settings
INSERT INTO company_settings (
    company_name, gstin, pan, state_code, 
    address, city, email, phone
) VALUES (
    'PASADA INTERIOR DESIGN',
    '29ABCDE1234F1Z5',
    'ABCDE1234F',
    '29',
    'Indiranagar, Bengaluru',
    'Bengaluru',
    'hello@pasada.in',
    '+91-98765-43210'
) ON CONFLICT DO NOTHING;

-- Insert common HSN/SAC codes for interior design
INSERT INTO hsn_sac_master (code, description, type, gst_rate) VALUES
('998361', 'Interior Design Services', 'SAC', 18.00),
('392190', 'Plastic Sheets/Films', 'HSN', 18.00),
('441400', 'Wooden Furniture', 'HSN', 18.00),
('940330', 'Wooden Furniture for Offices', 'HSN', 18.00),
('940340', 'Wooden Furniture for Kitchens', 'HSN', 18.00),
('940350', 'Wooden Furniture for Bedrooms', 'HSN', 18.00),
('940360', 'Other Wooden Furniture', 'HSN', 18.00),
('701000', 'Glass Products', 'HSN', 18.00),
('392010', 'Plastic Plates/Sheets', 'HSN', 18.00)
ON CONFLICT DO NOTHING;
```

### **Migration 3: Add RLS policies**
```sql
-- File: database/migrations/003_add_gst_rls_policies.sql

-- Company Settings RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

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

-- HSN/SAC Master RLS
ALTER TABLE hsn_sac_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view HSN/SAC codes"
ON hsn_sac_master FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage HSN/SAC codes"
ON hsn_sac_master FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- GST Audit Log RLS
ALTER TABLE gst_audit_log ENABLE ROW LEVEL SECURITY;

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
```

---

## 📊 GST State Codes Reference

```typescript
// File: lib/gst/state-codes.ts

export const GST_STATE_CODES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory'
} as const;

export type StateCode = keyof typeof GST_STATE_CODES;
```

---

## 🎯 Success Criteria

- [ ] All quotations show accurate GST calculations
- [ ] PDF templates display GST breakdown correctly
- [ ] E-invoice generation works for B2B transactions
- [ ] Audit logs capture all GST-related changes
- [ ] GST reports are accurate and exportable
- [ ] GSTIN validation prevents invalid entries
- [ ] System handles both intra-state and inter-state transactions
- [ ] All amounts rounded to 2 decimal places
- [ ] Company settings are configurable
- [ ] HSN/SAC codes are manageable

---

## 📅 Timeline

- **Week 1:** Database migrations + Backend utilities
- **Week 2:** API routes + GST calculation logic
- **Week 3:** Frontend forms + Quotation builder
- **Week 4:** PDF templates + E-invoice integration
- **Week 5:** Testing + Bug fixes + Documentation

---

## 🔒 Security Considerations

1. **GSTIN Masking:** Mask GSTIN in public-facing UIs (show only last 4 digits)
2. **API Key Security:** Store e-invoice API keys in environment variables
3. **Audit Trail:** Log all GST calculations and modifications
4. **Access Control:** Only admins can modify company GST settings
5. **Data Validation:** Server-side validation for all GST-related inputs
6. **Rate Limiting:** Implement rate limiting on e-invoice API calls

---

## 📚 References

- [GST Portal](https://www.gst.gov.in/)
- [E-Invoice Portal](https://einvoice1.gst.gov.in/)
- [HSN/SAC Codes](https://cbic-gst.gov.in/gst-goods-services-rates.html)
- [GSTIN Format](https://tutorial.gst.gov.in/userguide/returns/gstin.htm)

---

**Last Updated:** 2025-10-31  
**Next Review:** After Phase 1 completion
