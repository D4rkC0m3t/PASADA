# Vendor Creation Form - Complete Field List

Based on the provided form image, here are all the required fields:

## 1. Request Information
- **Request Type**: Dropdown (Creation / Modification)
  - Default: CREATION

## 2. Basic Information
- **Title**: Dropdown (Mr/Ms/Mrs/Company)
  - Example: company
- **Vendor Type**: Dropdown (Domestic/Foreign)
  - Example: DOMESTIC
- **Vendor Category (Items)**: Dropdown
  - Options: Capital Items / Consumables / Service provider
  - Example: SERVICE PROVIDER
- **Type of Service/Goods Receipt**: Text field
  - Description: Brief Description of nature of supply by vendor
  - Example: SERVICE AND SPARE

## 3. Vendor Details
- **Name of the vendor**: Text field (Required)
- **Address of the party**: Text area
  - Note: (with postal code & state)

## 4. Communication
- **Telephone**: Text field
- **Mobile**: Text field
- **Fax**: Text field
- **E-mail of Vendor**: Text field
  - Note: (can be more than one)
- **E-mail of TSRL SPOC**: Text field

## 5. Tax Information (if any)
- **PAN**: Text field
- **GSTIN**: Text field
- **MSME No.**: Text field
  - Note: (If Any)(Mention NA if not applicable)

## 6. Bank Details of Indian Vendor
- **Name of the beneficiary**: Text field
- **Bank Name**: Text field
- **Beneficiary A/C No.**: Text field
- **Bank branch name**: Text field
- **Bank IFSC code**: Text field

## 7. Bank Details of Foreign Vendor
- **Name of the beneficiary**: Text field
- **Address of beneficiary**: Text field
- **Beneficiary A/C No.**: Text field
- **Bank Name & Branch**: Text field
- **Bank Address**: Text field
- **ABA Routing**: Text field
- **Sort Code**: Text field
- **IBAN No**: Text field
- **Swift Code**: Text field
- **Beneficiary E-mail**: Text field

## 8. Payment Method
- **Payment Method**: Dropdown
  - Options: Cheque/NEFT/RTGS/Bank Transfer/DD
  - Example: (select from dropdown)

## 9. Payment Terms
- **Payment Terms**: Dropdown with color-coded options
  - Example: "30 days from invoice date" (Code: Z010)
  - Display format: Green background with code

## 10. Mandatory Documents Required
**Information Section** (not input fields):
- Cancelled Cheque (With Name of Party on Cheque) / Bank Certificate
- Copy of PAN / Form 60 if no PAN
- GST Certificate / Provisional GST Certificate / Declaration of No GST Registration
- Copy of Valid MSME Certificate (if any)
- Incorporation certificate in case of a company
- Tax Exemption / Lowertax deduction certificate if any

## 11. Other Clarifications
**Information Section** (not input fields):
- In case Vendor has provided service from more than one state, separate registration will be required for every state
- In case of modification of existing Company only on account but not restricted to Merger, etc will require New Incorporation Certificate and court order
- Any Update for the Vendor Master will require the necessary documents as mentioned above
- Change in name of the Company only on account but not restricted to Merger, etc will require New Incorporation Certificate and court order
- No Update request will be accepted from vendor directly, it should be routed through TSRL SPOC

---

## Form Sections Organization

### Section 1: Request & Basic Info
- Request Type
- Title
- Vendor Type
- Name
- Category
- Service Description

### Section 2: Address
- Full Address (with postal code & state)

### Section 3: Communication
- Telephone
- Mobile
- Fax
- Email (Vendor)
- Email (TSRL SPOC)

### Section 4: Tax Information
- PAN
- GSTIN
- MSME No.

### Section 5: Bank Details (Conditional based on Vendor Type)
**If Domestic:**
- Beneficiary Name
- Bank Name
- Account Number
- Branch Name
- IFSC Code

**If Foreign:**
- Beneficiary Name
- Beneficiary Address
- Account Number
- Bank Name & Branch
- Bank Address
- ABA Routing
- Sort Code
- IBAN No
- Swift Code
- Beneficiary Email

### Section 6: Payment Details
- Payment Method
- Payment Terms

### Section 7: Documents & Notes
- Mandatory Documents (Information display)
- Other Clarifications (Information display)
- Additional Notes (Text area for internal use)

---

## Field Validation Rules

### Required Fields:
- Name of the vendor *
- Vendor Type *
- Vendor Category *

### Conditional Required Fields:
**If Vendor Type = Domestic:**
- Bank Name (Indian)
- Account Number (Indian)
- IFSC Code

**If Vendor Type = Foreign:**
- Beneficiary Name (Foreign)
- Bank Name & Branch (Foreign)
- Swift Code

### Format Validation:
- **PAN**: AAAAA9999A format
- **GSTIN**: 15 characters
- **Email**: Valid email format
- **IFSC**: 11 characters
- **Swift Code**: 8 or 11 characters
- **IBAN**: Country-specific format

---

## Payment Terms Codes (SAP)

| Code | Description | Display |
|------|-------------|---------|
| Z010 | 30 days from invoice date | Green badge |
| Z012 | 45 days from invoice date | Green badge |
| Z014 | 100% Advance | Green badge |
| (Others) | Custom terms | Standard display |

---

## Status Options

- **Pending**: Awaiting approval
- **Active**: Approved and active
- **Inactive**: Temporarily disabled
- **Blacklisted**: Permanently blocked

---

## Implementation Notes

1. **Conditional Rendering**: Show Indian bank fields OR Foreign bank fields based on Vendor Type selection
2. **Dynamic Validation**: Apply different validation rules based on vendor type
3. **Document Upload**: Consider adding file upload functionality for mandatory documents
4. **Auto-fill**: Consider integrating with GST API to auto-fill company details from GSTIN
5. **Duplicate Check**: Validate vendor name/PAN doesn't already exist before submission
6. **Approval Workflow**: New vendors should default to "Pending" status
7. **Audit Trail**: Track who created/modified vendor and when

---

## Database Schema Suggestion

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  request_type VARCHAR(20) DEFAULT 'creation',
  title VARCHAR(20),
  vendor_type VARCHAR(20) NOT NULL, -- 'domestic' or 'foreign'
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- 'service_provider', 'consumables', 'capital_items'
  service_description TEXT,
  
  -- Address
  address TEXT,
  
  -- Communication
  telephone VARCHAR(20),
  mobile VARCHAR(20),
  fax VARCHAR(20),
  email VARCHAR(255),
  email_tsrl_spoc VARCHAR(255),
  
  -- Tax Info
  pan VARCHAR(10),
  gstin VARCHAR(15),
  msme_no VARCHAR(50),
  
  -- Payment
  payment_method VARCHAR(50),
  payment_terms VARCHAR(10), -- SAP code like 'Z010'
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Metadata (JSONB for flexible storage)
  bank_details_indian JSONB,
  bank_details_foreign JSONB,
  documents JSONB,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_vendor_name UNIQUE(name),
  CONSTRAINT valid_vendor_type CHECK (vendor_type IN ('domestic', 'foreign')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive', 'blacklisted'))
);

-- Indexes
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_pan ON vendors(pan);
CREATE INDEX idx_vendors_gstin ON vendors(gstin);
```

---

## Next Steps

1. Update the form UI to include all fields listed above
2. Implement conditional rendering for domestic vs foreign bank details
3. Add proper validation for each field type
4. Create dropdown options for all select fields
5. Add information sections for mandatory documents and clarifications
6. Implement file upload for document attachments
7. Add approval workflow for pending vendors
8. Create vendor detail view page
9. Create vendor edit page with same fields
10. Add export functionality for vendor list

---

**Total Fields**: ~35 input fields + 2 information sections
**Estimated Form Length**: Long scrolling form or multi-step wizard recommended
**Recommended Approach**: Multi-step form with progress indicator
