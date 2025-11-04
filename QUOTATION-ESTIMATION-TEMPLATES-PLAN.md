# 📄 Quotation & Estimation Templates - Complete System

**Generated:** 2025-11-01 19:25 IST  
**Status:** Planning & Implementation Guide

---

## 🎯 Current Status

### ✅ What Exists (Production Ready)

| Template | File | Status | Features |
|----------|------|--------|----------|
| **Quotation (Standard)** | `lib/pdf/quotation-template.tsx` | ✅ Complete | Basic quotation without GST |
| **Quotation (GST)** | `lib/pdf/quotation-gst-template.tsx` | ✅ Complete | GST-compliant with CGST/SGST/IGST |
| **Invoice (GST)** | `lib/pdf/invoice-template.tsx` | ✅ Complete | Full invoice with GST breakdown |

### ❌ What's Missing

| Template | Priority | Purpose |
|----------|----------|---------|
| **Estimation PDF** | 🔴 High | Quick cost estimates (no GST) |
| **Email Templates** | 🟡 Medium | Send quotes/estimates via email |
| **Template Variants** | 🟢 Low | Modern/Classic/Luxury designs |
| **Preview System** | 🟢 Low | Preview before generating |

---

## 📊 Template Requirements

### **1. Estimation Template** 🔴 HIGH PRIORITY

**Purpose:** Quick cost estimates before formal quotations

**Key Differences from Quotations:**
- ❌ No GST calculations (estimates are pre-tax)
- ❌ No invoice numbers or legal compliance
- ✅ Margin percentage shown
- ✅ Validity days (e.g., "Valid for 15 days")
- ✅ Estimation type badge (Rough ±20%, Detailed ±10%, Fixed)
- ✅ Quick conversion note to quotation
- ✅ Simpler line items (no HSN/SAC codes)

**Database Schema** (Already Exists):
```sql
estimations (
  id, estimation_number, project_id, client_id,
  estimation_type: 'rough' | 'detailed' | 'fixed',
  subtotal, discount, total,
  margin_percent, validity_days,
  converted_to_quotation_id, status, notes
)

estimation_items (
  id, estimation_id, item_number,
  description, category, quantity, unit,
  unit_price, total
)
```

**Design Specs:**
- **Color Scheme:** Orange/Amber (vs Gold for quotations)
- **Header:** "COST ESTIMATION" (large, bold)
- **Type Badge:** Prominent display of estimation type
- **Simplified Table:** No tax columns
- **Footer:** "This is not a quotation" disclaimer
- **Validity Banner:** Days remaining until expiry

---

### **2. Email Templates** 🟡 MEDIUM PRIORITY

**Purpose:** Professional email notifications for quotes & estimates

**Templates Needed:**
1. **Quotation Sent** - Email when quotation is created
2. **Estimation Sent** - Email when estimation is shared
3. **Quotation Approved** - Thank you + next steps
4. **Quotation Rejected** - Feedback request
5. **Quotation Reminder** - Follow-up before expiry

**Tech Stack:**
- React Email (`@react-email/components`)
- Responsive HTML emails
- PDF attachment support
- Supabase Edge Functions (for sending)

**Design:**
- PASADA branding (gold accents)
- Mobile-responsive
- Clear CTAs (View Online, Download PDF, Approve/Reject)
- Professional signature

---

### **3. Template Variants** 🟢 LOW PRIORITY

**Purpose:** Different design styles for client preferences

**Variants:**

#### **Modern Template** (Current Default)
- Clean, minimalist design
- Sans-serif fonts (Helvetica)
- Gold accents (#EAB308)
- Glassmorphism effects
- QR codes for digital access

#### **Classic Template**
- Traditional business format
- Serif fonts (Times New Roman)
- Navy blue accents (#1E3A8A)
- Formal table borders
- Conservative spacing

#### **Luxury Template**
- Premium, elegant design
- Serif display fonts (Playfair Display)
- Black & gold color scheme
- Textured backgrounds
- Embossed logo effect
- Signature line with gold border

---

## 🛠️ Implementation Plan

### **Phase 1: Estimation PDF Template** (Priority: High)

**File:** `lib/pdf/estimation-template.tsx`

**Features to Implement:**
```typescript
interface EstimationData {
  id: string
  estimation_number: string
  created_at: string
  valid_until: string  // calculated from validity_days
  
  // Estimation specific
  estimation_type: 'rough' | 'detailed' | 'fixed'
  margin_percent: number
  validity_days: number
  
  // Amounts (no GST)
  subtotal: number
  discount: number
  total: number
  
  // Project & Client
  project: {
    name: string
    location: string | null
    client: {
      name: string
      email: string | null
      phone: string | null
      address: string | null
    }
  }
  
  // Line items (simplified)
  estimation_items: Array<{
    description: string
    category: string | null
    quantity: number
    unit: string
    unit_price: number
    total: number
  }>
  
  notes: string | null
}
```

**Design Elements:**
- **Header:** Orange/amber color scheme
- **Type Badge:** Visible estimation type with accuracy range
- **Validity Banner:** "Valid until [DATE] ([X] days remaining)"
- **Simple Table:** No tax columns
- **Margin Display:** "Includes [X]% margin" note
- **Disclaimer:** "This is a cost estimation, not a formal quotation"
- **Conversion CTA:** "Convert to Quotation" button reference

---

### **Phase 2: Email Templates** (Priority: Medium)

**Files to Create:**
- `lib/email/quotation-sent.tsx`
- `lib/email/estimation-sent.tsx`
- `lib/email/quotation-approved.tsx`
- `lib/email/quotation-rejected.tsx`
- `lib/email/quotation-reminder.tsx`

**Sample Structure:**
```tsx
import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

export const QuotationSentEmail = ({ data }: { data: QuotationEmailData }) => (
  <Html>
    <Head>
      <title>Your Quotation from PASADA Interiors</title>
    </Head>
    <Body style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <Container>
        <Img src="https://pasada.in/logo.png" alt="PASADA" width="150" />
        <Section>
          <Text>Dear {data.clientName},</Text>
          <Text>Thank you for your interest in PASADA Interiors.</Text>
          <Text>Please find attached your quotation #{data.quotationNumber}</Text>
          <Button href={data.viewOnlineUrl}>View Online</Button>
          <Button href={data.downloadPdfUrl}>Download PDF</Button>
        </Section>
      </Container>
    </Body>
  </Html>
)
```

**API Routes:**
- `app/api/quotations/[id]/send-email/route.ts`
- `app/api/estimations/[id]/send-email/route.ts`

---

### **Phase 3: Template Variants** (Priority: Low)

**Files to Create:**
- `lib/pdf/quotation-template-modern.tsx` (current default)
- `lib/pdf/quotation-template-classic.tsx`
- `lib/pdf/quotation-template-luxury.tsx`
- `lib/pdf/estimation-template-modern.tsx`
- `lib/pdf/estimation-template-classic.tsx`
- `lib/pdf/estimation-template-luxury.tsx`

**Template Selection System:**
- Company settings table: `preferred_quotation_template`
- Per-quotation override: `quotations.template_variant`
- UI dropdown in quotation builder

---

## 📐 Design Specifications

### **Estimation Template Design**

#### **Header Section:**
```
┌─────────────────────────────────────────────────────┐
│ PASADA INTERIORS              Estimation Type:      │
│ Tailored Furniture            [ROUGH ±20%]          │
│ Address, Contact              Valid until: 15 Nov   │
└─────────────────────────────────────────────────────┘
```

#### **Info Banner:**
```
┌─────────────────────────────────────────────────────┐
│ 📋 COST ESTIMATION                                  │
│ Est #: EST-2024-001 | Date: 1 Nov 2024              │
│ Validity: 15 days remaining                         │
└─────────────────────────────────────────────────────┘
```

#### **Line Items Table:**
```
┌───┬──────────────┬─────┬────┬────────┬──────────┐
│ # │ Description  │ Cat │ Qty│  Rate  │   Total  │
├───┼──────────────┼─────┼────┼────────┼──────────┤
│ 1 │ Kitchen      │ Furn│ 1  │ 50,000 │  50,000  │
│   │ Cabinet Set  │     │    │        │          │
└───┴──────────────┴─────┴────┴────────┴──────────┘
```

#### **Totals Section:**
```
┌───────────────────────────┐
│ Subtotal:      ₹50,000.00 │
│ Margin (20%):  ₹10,000.00 │
│ Discount:      - ₹0.00    │
│ TOTAL:         ₹60,000.00 │
└───────────────────────────┘
```

#### **Footer Disclaimer:**
```
⚠️ IMPORTANT NOTICE
This is a cost estimation only and not a formal quotation.
Actual prices may vary based on final specifications.
Margin: 20% | Accuracy: ±20% (Rough Estimate)
```

---

## 🎨 Color Schemes

### **Quotation Templates:**
- **Primary:** #EAB308 (Gold)
- **Secondary:** #D4A017 (Dark Gold)
- **Text:** #333333 (Dark Gray)
- **Background:** #FFFFFF (White)
- **Accent:** #FEF3C7 (Light Gold)

### **Estimation Templates:**
- **Primary:** #F97316 (Orange)
- **Secondary:** #EA580C (Dark Orange)
- **Text:** #333333 (Dark Gray)
- **Background:** #FFFFFF (White)
- **Accent:** #FED7AA (Light Orange)

### **Invoice Templates:**
- **Primary:** #10B981 (Green)
- **Secondary:** #059669 (Dark Green)
- **Text:** #333333 (Dark Gray)
- **Background:** #FFFFFF (White)
- **Accent:** #D1FAE5 (Light Green)

---

## 📋 Feature Comparison

| Feature | Estimation | Quotation | Invoice |
|---------|-----------|-----------|---------|
| **GST Calculation** | ❌ No | ✅ Yes | ✅ Yes |
| **HSN/SAC Codes** | ❌ No | ✅ Yes | ✅ Yes |
| **Legal Validity** | ❌ No | ✅ Yes | ✅ Yes |
| **Margin Display** | ✅ Yes | ❌ No | ❌ No |
| **Accuracy Range** | ✅ Yes (±%) | ❌ No | ❌ No |
| **Validity Days** | ✅ Yes | ✅ Yes | ❌ No |
| **Payment Terms** | ❌ No | ✅ Yes | ✅ Yes |
| **Signature Section** | ❌ No | ✅ Yes | ✅ Yes |
| **Convert to Quote** | ✅ Yes | ✅ Convert to Invoice | ❌ No |
| **Quick Creation** | ✅ Fast | ⏱️ Detailed | ⏱️ Detailed |

---

## 🚀 Implementation Steps

### **Step 1: Create Estimation PDF Template** (2-3 hours)

1. **Create file:** `lib/pdf/estimation-template.tsx`
2. **Define types:** EstimationData interface
3. **Design header:** Orange color scheme, type badge
4. **Create table:** Simplified line items (no GST)
5. **Add totals:** Include margin display
6. **Add footer:** Disclaimer and conversion note
7. **Test rendering:** Verify PDF generation

### **Step 2: Create API Route** (30 min)

1. **Create:** `app/api/estimations/[id]/pdf/route.ts`
2. **Fetch data:** From estimations + estimation_items tables
3. **Generate PDF:** Using @react-pdf/renderer
4. **Return file:** With proper headers

### **Step 3: Add Download Button** (15 min)

1. **Update:** `app/admin/estimations/page.tsx`
2. **Add button:** Download PDF action
3. **Handle click:** Call API and download

### **Step 4: Email Templates** (3-4 hours)

1. **Install:** `npm install @react-email/components`
2. **Create templates:** 5 email templates
3. **Create API routes:** Send email endpoints
4. **Integrate:** Supabase Edge Functions or Resend API
5. **Test emails:** Send test emails

### **Step 5: Template Variants** (4-5 hours)

1. **Create classic variant:** Traditional design
2. **Create luxury variant:** Premium design
3. **Add template selector:** Company settings
4. **Update PDF routes:** Support variant parameter
5. **Test all variants:** Verify rendering

---

## 🧪 Testing Checklist

### **Estimation PDF:**
- [ ] Header displays company info correctly
- [ ] Estimation type badge shows with correct color
- [ ] Validity days calculated correctly
- [ ] Line items table renders all items
- [ ] Margin percentage displayed
- [ ] Totals calculate correctly (subtotal + margin - discount)
- [ ] Disclaimer text visible
- [ ] PDF downloads with correct filename
- [ ] Mobile responsive (if viewing online)

### **Email Templates:**
- [ ] All placeholders replaced with actual data
- [ ] Links work correctly (view online, download PDF)
- [ ] Images load (logo, icons)
- [ ] Mobile responsive
- [ ] Test in multiple email clients (Gmail, Outlook)
- [ ] Spam score acceptable
- [ ] Unsubscribe link present (if required)

### **Template Variants:**
- [ ] Classic template renders correctly
- [ ] Luxury template renders correctly
- [ ] Template selector works in settings
- [ ] PDF generation uses selected template
- [ ] All variants maintain data accuracy

---

## 📊 Database Changes Needed

### **Already Exist:**
✅ `estimations` table (from migration 005)
✅ `estimation_items` table
✅ Auto-number generation (EST-2024-001)
✅ RLS policies

### **Need to Add:**

**Company Settings for Templates:**
```sql
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS 
  preferred_quotation_template VARCHAR(50) DEFAULT 'modern';

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS 
  preferred_estimation_template VARCHAR(50) DEFAULT 'modern';
```

**Template Variant Column (Optional):**
```sql
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS 
  template_variant VARCHAR(50) DEFAULT 'modern';

ALTER TABLE estimations ADD COLUMN IF NOT EXISTS 
  template_variant VARCHAR(50) DEFAULT 'modern';
```

---

## 📦 Dependencies Needed

### **Already Installed:**
- ✅ `@react-pdf/renderer` - PDF generation
- ✅ `@supabase/supabase-js` - Database
- ✅ `next` - API routes

### **Need to Install:**
```bash
npm install @react-email/components
npm install resend  # For email sending (alternative to Supabase)
```

---

## 🎯 Quick Wins (Implement First)

1. **Estimation PDF Template** (2-3 hours)
   - Immediate value for sales team
   - Uses existing database schema
   - Simple implementation

2. **Basic Email Template for Quotations** (1-2 hours)
   - Quotation sent notification
   - Professional client communication
   - Easy to test

3. **Download Button for Estimations** (15 min)
   - Complete the estimations feature
   - One-click PDF generation

---

## 📈 Success Metrics

### **After Implementation:**
- ✅ Estimations have professional PDF output
- ✅ Quotations sent via email automatically
- ✅ Template variants available for customization
- ✅ Faster quote/estimate generation (<2 min)
- ✅ Professional client-facing documents
- ✅ Reduced manual work in sales process

---

## 🔗 Files to Create

### **Priority 1 (High):**
1. `lib/pdf/estimation-template.tsx` (new)
2. `app/api/estimations/[id]/pdf/route.ts` (new)
3. Update `app/admin/estimations/page.tsx` (add download)

### **Priority 2 (Medium):**
4. `lib/email/quotation-sent.tsx` (new)
5. `lib/email/estimation-sent.tsx` (new)
6. `app/api/quotations/[id]/send-email/route.ts` (new)
7. `app/api/estimations/[id]/send-email/route.ts` (new)

### **Priority 3 (Low):**
8. `lib/pdf/quotation-template-classic.tsx` (new)
9. `lib/pdf/quotation-template-luxury.tsx` (new)
10. `lib/pdf/estimation-template-classic.tsx` (new)
11. `lib/pdf/estimation-template-luxury.tsx` (new)
12. Template selector UI component

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Estimation PDF Template | 2-3 hrs | 🔴 High |
| Estimation PDF API Route | 30 min | 🔴 High |
| Download Button Integration | 15 min | 🔴 High |
| Email Templates (5) | 3-4 hrs | 🟡 Medium |
| Email API Routes | 1-2 hrs | 🟡 Medium |
| Template Variants (4) | 4-5 hrs | 🟢 Low |
| Template Selector UI | 1 hr | 🟢 Low |
| Testing & Polish | 2 hrs | 🟡 Medium |
| **TOTAL** | **14-20 hrs** | - |

---

## 🎉 Final Deliverables

After full implementation, you'll have:

1. **✅ 3 Document Types:**
   - Estimations (quick, no GST)
   - Quotations (formal, with GST)
   - Invoices (payment, with GST)

2. **✅ 9 PDF Templates:**
   - Estimation: Modern, Classic, Luxury
   - Quotation: Modern, Classic, Luxury
   - Invoice: Modern, Classic, Luxury

3. **✅ 5 Email Templates:**
   - Quotation sent
   - Estimation sent
   - Quotation approved
   - Quotation rejected
   - Quotation reminder

4. **✅ Professional Workflow:**
   - Estimation → Quotation → Invoice
   - Automated email notifications
   - One-click PDF generation
   - Template customization per client

---

**Ready to implement?** Let me know which priority level to start with! 🚀

**Recommendation:** Start with Priority 1 (Estimation PDF) as it's the missing piece and provides immediate value.
