# 📋 Estimation, Quotation & E-Invoice - Complete Roadmap

## 🎯 Overview

This document outlines the complete implementation plan for the **Estimation → Quotation → E-Invoice** workflow in PASADA CRM, ensuring GST compliance and professional document generation.

---

## 🔄 Workflow Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │      │             │
│ ESTIMATION  │─────▶│  QUOTATION  │─────▶│   INVOICE   │─────▶│  E-INVOICE  │
│  (Draft)    │      │  (Approved) │      │   (Issued)  │      │   (IRN)     │
│             │      │             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
     │                     │                     │                     │
     ├─ Internal use       ├─ Client approval    ├─ Payment tracking   ├─ GST portal
     ├─ Quick calc         ├─ PDF generation     ├─ GST compliance     ├─ Auto-reporting
     └─ No GST details     └─ Full GST breakdown └─ Legal document     └─ IRN/QR code
```

---

## 📊 Current Status

### ✅ **Completed (Phase 1 & 2)**
1. ✅ GST database migrations
2. ✅ GST calculation utilities
3. ✅ Company Settings page with GST details
4. ✅ Client form with GSTIN validation
5. ✅ **Quotation Builder with GST** (Just completed!)
   - Transaction info header
   - HSN/SAC code integration
   - Smart GST calculations
   - Professional GST breakdown
   - Database integration

### ⏳ **Pending (Phase 3 & 4)**
6. ⏳ **Estimation Module** (New requirement)
7. ⏳ **Quotation PDF Templates** with GST
8. ⏳ **Invoice Module** with GST
9. ⏳ **E-Invoice Integration** with NIC/GSP

---

## 🎯 Phase 3: Estimation & PDF Templates

### **A. Estimation Module** (New Feature)

#### **Purpose:**
- Quick cost calculations for internal use
- Pre-quotation rough estimates
- No GST compliance required
- Fast turnaround for clients

#### **Features:**
1. **Simple Line Items**
   - Item name, quantity, unit price
   - No HSN/SAC codes required
   - Basic total calculation
   - Optional discount

2. **Estimation Types**
   - Rough Estimate (±20%)
   - Detailed Estimate (±10%)
   - Fixed Price Estimate

3. **Convert to Quotation**
   - One-click conversion
   - Auto-adds HSN/SAC codes
   - Applies GST calculations
   - Generates quotation number

4. **UI/UX**
   - Simplified interface
   - Faster data entry
   - Mobile-friendly
   - Print-friendly format

#### **Database Schema:**
```sql
-- Estimations Table
CREATE TABLE estimations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimation_number TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id),
    client_id UUID REFERENCES clients(id),
    title TEXT NOT NULL,
    description TEXT,
    estimation_type TEXT CHECK (estimation_type IN ('rough', 'detailed', 'fixed')),
    subtotal NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    margin_percent NUMERIC(5,2) DEFAULT 20,
    validity_days INTEGER DEFAULT 7,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'converted', 'expired')),
    converted_to_quotation_id UUID REFERENCES quotations(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Estimation Items Table
CREATE TABLE estimation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimation_id UUID NOT NULL REFERENCES estimations(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    category TEXT,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    unit_price NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Implementation Files:**
- `app/admin/estimations/page.tsx` - List view
- `app/admin/estimations/new/page.tsx` - Create estimation
- `app/admin/estimations/[id]/page.tsx` - View/edit estimation
- `app/admin/estimations/[id]/convert/page.tsx` - Convert to quotation
- `lib/estimation/calculator.ts` - Estimation calculations

---

### **B. Quotation PDF Templates** (High Priority)

#### **Purpose:**
- Professional GST-compliant quotation PDFs
- Client-ready documents
- Email-ready format
- Print-ready layout

#### **Features:**
1. **GST-Compliant Layout**
   - Company GSTIN and details
   - Client GSTIN (if B2B)
   - HSN/SAC codes per item
   - Detailed GST breakdown
   - Place of supply
   - Transaction type (B2B/B2C, Intra/Inter-state)

2. **Professional Design**
   - PASADA branding
   - Clean, modern layout
   - Color-coded sections
   - QR code for payment (optional)

3. **Multiple Templates**
   - Standard Template (detailed)
   - Compact Template (summary)
   - Luxury Template (premium projects)

4. **Dynamic Content**
   - Terms & conditions
   - Payment terms
   - Validity period
   - Notes and special instructions

#### **Technical Stack:**
- **Library:** `react-pdf` or `pdfmake`
- **Styling:** Custom CSS for PDF
- **Storage:** Supabase Storage
- **Generation:** Server-side API route

#### **PDF Structure:**
```
┌─────────────────────────────────────────────────┐
│ PASADA INTERIORS                    QUOTATION   │
│ [Logo]                              QT-2024-001 │
│                                                  │
│ GSTIN: 29ABCDE1234F1Z5              Date: ...   │
│ Address: ...                        Valid: ...  │
├─────────────────────────────────────────────────┤
│ BILL TO:                                        │
│ Client Name                                     │
│ GSTIN: 29XYZAB5678G1H2 (if B2B)                │
│ Address: ...                                    │
├─────────────────────────────────────────────────┤
│ Transaction: B2B (Intra-State)                  │
│ Place of Supply: 29 (Karnataka)                 │
├─────────────────────────────────────────────────┤
│ # │ Item │ HSN │ Qty │ Rate │ Taxable │ GST │ Total │
├───┼──────┼─────┼─────┼──────┼─────────┼─────┼───────┤
│ 1 │ ... │ ... │ ... │ ...  │ ...     │ ... │ ...   │
├─────────────────────────────────────────────────┤
│                              Subtotal: ₹...     │
│                              CGST 9%: ₹...      │
│                              SGST 9%: ₹...      │
│                              ─────────────       │
│                              Total: ₹...        │
├─────────────────────────────────────────────────┤
│ Terms & Conditions:                             │
│ 1. ...                                          │
│ 2. ...                                          │
├─────────────────────────────────────────────────┤
│ Authorized Signatory                            │
│ PASADA INTERIORS                                │
└─────────────────────────────────────────────────┘
```

#### **Implementation Files:**
- `app/api/quotations/[id]/pdf/route.ts` - PDF generation API
- `lib/pdf/quotation-template.tsx` - PDF template component
- `lib/pdf/pdf-generator.ts` - PDF generation utility
- `components/pdf/QuotationPDF.tsx` - React PDF component

---

## 🎯 Phase 4: Invoice & E-Invoice Integration

### **A. Invoice Module**

#### **Purpose:**
- Convert approved quotations to invoices
- Track payments and due dates
- GST-compliant invoicing
- Legal document for transactions

#### **Features:**
1. **Invoice Generation**
   - Auto-generate from approved quotation
   - Unique invoice number (INV-2024-001)
   - Invoice date and due date
   - Payment terms

2. **Payment Tracking**
   - Partial payments
   - Payment history
   - Outstanding balance
   - Payment reminders

3. **Invoice Status**
   - Draft
   - Issued
   - Partially Paid
   - Fully Paid
   - Overdue
   - Cancelled

4. **GST Compliance**
   - All GST fields from quotation
   - Invoice-specific GST details
   - Tax invoice format
   - Ready for e-invoice generation

#### **Database Schema:**
```sql
-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    quotation_id UUID REFERENCES quotations(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Invoice Details
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_terms TEXT,
    
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
    invoice_type TEXT CHECK (invoice_type IN ('B2B', 'B2C')),
    reverse_charge TEXT DEFAULT 'N' CHECK (reverse_charge IN ('Y', 'N')),
    
    -- Payment Tracking
    paid_amount NUMERIC(12,2) DEFAULT 0,
    outstanding_amount NUMERIC(12,2),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partially_paid', 'fully_paid', 'overdue', 'cancelled')),
    
    -- E-Invoice Fields
    irn TEXT UNIQUE, -- Invoice Reference Number from GST portal
    ack_no TEXT, -- Acknowledgement number
    ack_date TIMESTAMP WITH TIME ZONE,
    qr_code_data TEXT, -- QR code data from e-invoice
    e_invoice_status TEXT CHECK (e_invoice_status IN ('pending', 'generated', 'cancelled', 'failed')),
    e_invoice_error TEXT,
    
    -- Documents
    pdf_url TEXT,
    e_invoice_pdf_url TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Invoice Items Table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    category TEXT,
    description TEXT NOT NULL,
    hsn_sac_code TEXT,
    quantity NUMERIC(10,2) NOT NULL,
    unit TEXT DEFAULT 'pcs',
    unit_price NUMERIC(12,2) NOT NULL,
    taxable_value NUMERIC(12,2) NOT NULL,
    tax_rate NUMERIC(5,2) NOT NULL,
    gst_amount NUMERIC(12,2) NOT NULL,
    cgst_amount NUMERIC(12,2),
    sgst_amount NUMERIC(12,2),
    igst_amount NUMERIC(12,2),
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other')),
    transaction_id TEXT,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);
```

#### **Implementation Files:**
- `app/admin/invoices/page.tsx` - Invoice list
- `app/admin/invoices/new/page.tsx` - Create invoice
- `app/admin/invoices/[id]/page.tsx` - View/edit invoice
- `app/admin/invoices/[id]/payments/page.tsx` - Payment tracking
- `lib/invoice/calculator.ts` - Invoice calculations

---

### **B. E-Invoice Integration** (GST Portal)

#### **Purpose:**
- Comply with Indian GST e-invoicing mandate
- Generate IRN (Invoice Reference Number)
- Auto-report to GST portal
- QR code generation for verification

#### **E-Invoice Requirements:**
1. **Mandatory for:**
   - B2B transactions
   - Turnover > ₹5 crore (current limit)
   - All invoices above ₹50,000

2. **GST Portal Integration:**
   - NIC (National Informatics Centre) API
   - GSP (GST Suvidha Provider) API
   - Real-time IRN generation
   - QR code with invoice details

3. **E-Invoice Workflow:**
```
1. Create Invoice in CRM
2. Validate all GST fields
3. Generate JSON payload (as per GST schema)
4. Send to NIC/GSP API
5. Receive IRN and QR code
6. Update invoice with IRN
7. Generate e-invoice PDF with QR code
8. Send to client
```

#### **E-Invoice JSON Schema (GST Standard):**
```json
{
  "Version": "1.1",
  "TranDtls": {
    "TaxSch": "GST",
    "SupTyp": "B2B",
    "RegRev": "N",
    "IgstOnIntra": "N"
  },
  "DocDtls": {
    "Typ": "INV",
    "No": "INV-2024-001",
    "Dt": "31/10/2024"
  },
  "SellerDtls": {
    "Gstin": "29ABCDE1234F1Z5",
    "LglNm": "PASADA INTERIORS",
    "Addr1": "...",
    "Loc": "Bangalore",
    "Pin": 560001,
    "Stcd": "29"
  },
  "BuyerDtls": {
    "Gstin": "29XYZAB5678G1H2",
    "LglNm": "Client Name",
    "Pos": "29",
    "Addr1": "...",
    "Loc": "Bangalore",
    "Pin": 560002,
    "Stcd": "29"
  },
  "ItemList": [
    {
      "SlNo": "1",
      "PrdDesc": "Kitchen Cabinet",
      "IsServc": "N",
      "HsnCd": "9403",
      "Qty": 1,
      "Unit": "PCS",
      "UnitPrice": 10000,
      "TotAmt": 10000,
      "Discount": 0,
      "AssAmt": 10000,
      "GstRt": 18,
      "CgstAmt": 900,
      "SgstAmt": 900,
      "TotItemVal": 11800
    }
  ],
  "ValDtls": {
    "AssVal": 10000,
    "CgstVal": 900,
    "SgstVal": 900,
    "TotInvVal": 11800
  }
}
```

#### **API Integration Options:**

##### **Option 1: NIC Direct API** (Free, Complex)
- Direct integration with GST portal
- Requires digital signature
- Complex authentication
- Free of cost

##### **Option 2: GSP Provider** (Paid, Easy)
Popular GSPs:
- **ClearTax** - ₹500-1000/month
- **Tally** - ₹1500/month
- **Busy** - ₹800/month
- **Masters India** - ₹600/month

Benefits:
- Simple REST API
- Better documentation
- Support and maintenance
- Sandbox for testing

#### **Implementation Files:**
- `app/api/e-invoice/generate/route.ts` - Generate IRN
- `app/api/e-invoice/cancel/route.ts` - Cancel e-invoice
- `lib/e-invoice/nic-api.ts` - NIC API integration
- `lib/e-invoice/gsp-api.ts` - GSP API integration
- `lib/e-invoice/validator.ts` - E-invoice validation
- `lib/e-invoice/json-generator.ts` - JSON payload generator
- `components/e-invoice/QRCode.tsx` - QR code display

---

## 📅 Implementation Timeline

### **Phase 3A: Estimation Module** (1-2 weeks)
- Week 1: Database schema, basic CRUD
- Week 2: UI/UX, convert to quotation

### **Phase 3B: Quotation PDF** (1 week)
- Days 1-3: PDF template design
- Days 4-5: PDF generation logic
- Days 6-7: Testing and refinement

### **Phase 4A: Invoice Module** (2 weeks)
- Week 1: Database, invoice generation, payment tracking
- Week 2: UI/UX, PDF templates

### **Phase 4B: E-Invoice Integration** (2-3 weeks)
- Week 1: GSP provider selection, API setup
- Week 2: JSON generation, IRN integration
- Week 3: QR code, testing, error handling

**Total Estimated Time: 6-8 weeks**

---

## 🎯 Priority Recommendations

### **Immediate (Next 2 weeks):**
1. ✅ **Quotation PDF Templates** - High priority, client-facing
2. ⏳ **Estimation Module** - Internal efficiency

### **Short-term (Next 4 weeks):**
3. ⏳ **Invoice Module** - Essential for business operations
4. ⏳ **Payment Tracking** - Cash flow management

### **Medium-term (Next 8 weeks):**
5. ⏳ **E-Invoice Integration** - GST compliance (if turnover > ₹5 crore)

---

## 🔧 Technical Stack Summary

### **Frontend:**
- Next.js 14 with App Router
- TypeScript
- React components
- Tailwind CSS

### **Backend:**
- Supabase (PostgreSQL)
- Next.js API routes
- Server-side PDF generation

### **PDF Generation:**
- **Option 1:** `react-pdf` (React-based)
- **Option 2:** `pdfmake` (JavaScript-based)
- **Option 3:** `puppeteer` (HTML to PDF)

### **E-Invoice:**
- REST API integration
- JSON payload generation
- QR code generation (`qrcode` library)
- Digital signature (if NIC direct)

---

## 📊 Feature Comparison

| Feature | Estimation | Quotation | Invoice | E-Invoice |
|---------|-----------|-----------|---------|-----------|
| **Purpose** | Quick calc | Client approval | Payment doc | GST compliance |
| **GST Details** | ❌ No | ✅ Full | ✅ Full | ✅ Full + IRN |
| **HSN/SAC** | ❌ Optional | ✅ Required | ✅ Required | ✅ Required |
| **PDF** | ✅ Simple | ✅ Professional | ✅ Tax invoice | ✅ With QR code |
| **Legal Status** | ❌ Internal | ⚠️ Proposal | ✅ Legal doc | ✅ GST portal |
| **Client Facing** | ⚠️ Optional | ✅ Yes | ✅ Yes | ✅ Yes |
| **Payment Track** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **GST Reporting** | ❌ No | ❌ No | ⚠️ Manual | ✅ Automatic |

---

## 🎓 Best Practices

### **Estimation:**
- Keep it simple and fast
- Use rough margins (±20%)
- Quick turnaround (same day)
- Easy conversion to quotation

### **Quotation:**
- Detailed GST breakdown
- Professional PDF
- Clear terms and conditions
- Validity period (7-30 days)

### **Invoice:**
- Generate from approved quotation
- Unique invoice numbering
- Clear payment terms
- Track payments diligently

### **E-Invoice:**
- Validate all fields before submission
- Handle errors gracefully
- Store IRN securely
- Keep audit trail

---

## 🚀 Next Steps

### **Immediate Action Items:**

1. **Review this roadmap** - Confirm priorities
2. **Choose PDF library** - react-pdf vs pdfmake
3. **Design PDF template** - Get approval on layout
4. **Start Phase 3A** - Estimation module database
5. **Start Phase 3B** - Quotation PDF implementation

### **Decision Points:**

1. **Estimation Module:**
   - Do you need it immediately?
   - Or focus on PDF first?

2. **E-Invoice:**
   - What's your current turnover?
   - Is e-invoice mandatory for you?
   - NIC direct or GSP provider?

3. **PDF Design:**
   - Standard template first?
   - Multiple templates needed?
   - Custom branding requirements?

---

## 📞 Questions to Answer

1. **Estimation Priority:**
   - Is estimation module needed immediately?
   - Or can we focus on quotation PDF first?

2. **E-Invoice Requirement:**
   - Is your turnover > ₹5 crore?
   - Do you need e-invoice now or later?

3. **GSP Provider:**
   - Budget for GSP subscription?
   - Preference for specific provider?

4. **PDF Design:**
   - Any specific design requirements?
   - Logo, colors, layout preferences?

---

## ✅ Summary

**Current Status:**
- ✅ Quotation Builder with GST - **COMPLETE**
- ⏳ PDF Templates - **NEXT**
- ⏳ Estimation Module - **PLANNED**
- ⏳ Invoice Module - **PLANNED**
- ⏳ E-Invoice Integration - **PLANNED**

**Recommended Next Steps:**
1. Implement Quotation PDF templates (1 week)
2. Build Estimation module (2 weeks)
3. Create Invoice module (2 weeks)
4. Integrate E-Invoice (3 weeks)

**Total Timeline: 6-8 weeks for complete system**

---

**Last Updated:** 2025-10-31 18:36 IST  
**Status:** 📋 Planning & Roadmap Complete  
**Next Phase:** PDF Templates & Estimation Module
