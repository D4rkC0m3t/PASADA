# ⚡ Quick Action Plan - PASADA CRM

**Date:** 2025-11-03  
**Focus:** High Priority Tasks Only

---

## 🎯 Materials Status: ✅ **100% COMPLETE**

**No action needed on Materials!** The system is fully functional with:
- ✅ CRUD operations
- ✅ Search & filtering
- ✅ Stock tracking
- ✅ Supplier management
- ✅ Image uploads
- ✅ Category management
- ✅ Archive functionality

---

## 🔴 HIGH PRIORITY TASKS (Next 2 Weeks)

### **Task 1: Execute Database Migrations** ⏱️ 15 minutes

**Why:** Required for Estimations & Invoices to work

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy content from `database/migrations/005_create_estimation_tables.sql`
3. Click "Run"
4. Copy content from `database/migrations/006_create_invoice_tables.sql`
5. Click "Run"
6. Verify tables created

**Verification:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('estimations', 'estimation_items', 'invoices', 'invoice_items');
```

---

### **Task 2: Fix Minor Issues** ⏱️ 5 minutes

#### **A. Remove Unused Import**
**File:** `app/admin/settings/company/page.tsx`

```typescript
// Line 6 - Remove this line
import { Upload } from 'lucide-react'
```

#### **B. Fix Invoice Builder Placeholder**
**File:** `lib/e-invoice/invoice-builder.ts` (Line 314)

**Current:**
```typescript
return { success: false, errors: ['Not implemented'] }
```

**Action:** Mark as TODO for now, implement in E-Invoice phase

---

### **Task 3: Complete Estimation Module** ⏱️ 6-8 hours

#### **A. Estimation Detail Page**
**File:** `app/admin/estimations/[id]/page.tsx`

**Features:**
- Display estimation header (number, client, date, status)
- Show all line items with quantities and prices
- Display totals (subtotal, tax, discount, total)
- Show notes and terms
- Action buttons (Edit, Convert to Quotation, Delete, PDF)

**Reference:** Copy structure from `app/admin/quotations/[id]/page.tsx`

---

#### **B. Estimation Edit Page**
**File:** `app/admin/estimations/[id]/edit/page.tsx`

**Features:**
- Load existing estimation data
- Edit all fields
- Update line items
- Recalculate totals
- Save changes

**Reference:** Copy structure from `app/admin/quotations/[id]/edit/page.tsx`

---

#### **C. Convert to Quotation**
**File:** `app/admin/estimations/[id]/convert/page.tsx`

**Features:**
- Load estimation data
- Add HSN/SAC codes to items
- Apply GST calculations
- Create quotation
- Link back to estimation
- Update estimation status to 'converted'

**API Route:** `app/api/estimations/[id]/convert/route.ts`

```typescript
// Conversion logic
1. Fetch estimation with items
2. Create new quotation
3. Copy items with GST calculations
4. Update estimation status
5. Return new quotation ID
```

---

### **Task 4: E-Invoice UI Pages** ⏱️ 12-16 hours

#### **A. Invoice List Page** ⏱️ 3 hours
**File:** `app/admin/invoices/list/page.tsx`

**Features:**
- Table view with invoice number, client, date, amount, status
- Search by invoice number, client name
- Filter by status (draft, sent, paid, overdue, cancelled)
- Filter by date range
- Pagination
- Actions (View, Edit, Delete, Generate IRN)

**Reference:** Copy structure from `app/admin/quotations/page.tsx`

---

#### **B. New Invoice Form** ⏱️ 4 hours
**File:** `app/admin/invoices/new/page.tsx`

**Features:**
- Select client (with GSTIN)
- Select project (optional)
- Invoice date and due date
- Add line items with HSN/SAC codes
- GST calculations (CGST, SGST, IGST)
- Discount and additional charges
- Terms and conditions
- Payment terms
- Save as draft or finalize

**Reference:** Copy structure from `app/admin/quotations/new/page.tsx`

---

#### **C. Invoice Detail View** ⏱️ 2 hours
**File:** `app/admin/invoices/[id]/page.tsx`

**Features:**
- Display invoice header
- Show all line items with GST breakdown
- Display totals
- Show payment status
- Show IRN and QR code (if generated)
- Action buttons (Edit, Record Payment, Generate IRN, Cancel IRN, PDF, Email)

---

#### **D. Edit Invoice Page** ⏱️ 2 hours
**File:** `app/admin/invoices/[id]/edit/page.tsx`

**Features:**
- Load existing invoice
- Edit all fields (only if not finalized)
- Update line items
- Recalculate GST
- Save changes

**Note:** Disable editing if IRN generated

---

#### **E. Payment Recording** ⏱️ 3 hours
**File:** `app/admin/invoices/[id]/payments/page.tsx`

**Features:**
- View payment history
- Add new payment
- Payment date, amount, method
- Reference number
- Update invoice status (partially paid, fully paid)
- Generate payment receipt

---

### **Task 5: Convert Quotation to Invoice** ⏱️ 3-4 hours

**File:** `app/admin/quotations/[id]/convert/page.tsx`

**Features:**
- Load quotation data
- Set invoice date and due date
- Copy all items with GST
- Create invoice
- Link invoice to quotation
- Update quotation status to 'converted'

**API Route:** `app/api/quotations/[id]/convert/route.ts`

```typescript
// Conversion logic
1. Fetch quotation with items
2. Create new invoice
3. Copy items with GST (already calculated)
4. Update quotation status
5. Return new invoice ID
```

---

## 📋 Task Checklist

### **Week 1:**
- [ ] Execute database migrations (15 min)
- [ ] Fix Upload icon warning (1 min)
- [ ] Create Estimation detail page (2-3 hours)
- [ ] Create Estimation edit page (2-3 hours)
- [ ] Create Convert Estimation to Quotation (3-4 hours)

**Total:** ~10-12 hours

---

### **Week 2:**
- [ ] Create Invoice list page (3 hours)
- [ ] Create New invoice form (4 hours)
- [ ] Create Invoice detail view (2 hours)
- [ ] Create Edit invoice page (2 hours)
- [ ] Create Payment recording page (3 hours)
- [ ] Create Convert Quotation to Invoice (3-4 hours)

**Total:** ~17-18 hours

---

## 🎯 Success Criteria

### **Estimations Complete:**
- ✅ Can view estimation details
- ✅ Can edit existing estimations
- ✅ Can convert estimation to quotation
- ✅ Quotation linked back to estimation

### **E-Invoice Complete:**
- ✅ Can create new invoices
- ✅ Can view invoice details
- ✅ Can edit invoices (before IRN)
- ✅ Can record payments
- ✅ Can convert quotation to invoice
- ✅ Invoice linked to quotation

---

## 🚀 Quick Start Commands

### **1. Check Database Tables:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **2. Check Estimations:**
```sql
SELECT * FROM estimations ORDER BY created_at DESC LIMIT 10;
```

### **3. Check Invoices:**
```sql
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10;
```

### **4. Check RLS Policies:**
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('estimations', 'invoices')
ORDER BY tablename, cmd;
```

---

## 📁 File Structure to Create

```
app/admin/
├── estimations/
│   └── [id]/
│       ├── page.tsx          ⏳ Create
│       ├── edit/
│       │   └── page.tsx      ⏳ Create
│       └── convert/
│           └── page.tsx      ⏳ Create
│
└── invoices/
    ├── list/
    │   └── page.tsx          ⏳ Create
    ├── new/
    │   └── page.tsx          ⏳ Create
    └── [id]/
        ├── page.tsx          ⏳ Create
        ├── edit/
        │   └── page.tsx      ⏳ Create
        ├── payments/
        │   └── page.tsx      ⏳ Create
        └── convert/
            └── page.tsx      ⏳ Create (for quotation)

app/api/
├── estimations/
│   └── [id]/
│       └── convert/
│           └── route.ts      ⏳ Create
│
├── invoices/
│   ├── route.ts              ⏳ Create
│   └── [id]/
│       ├── route.ts          ⏳ Create
│       ├── generate-irn/
│       │   └── route.ts      ⏳ Create
│       ├── cancel-irn/
│       │   └── route.ts      ⏳ Create
│       ├── pdf/
│       │   └── route.ts      ⏳ Create
│       └── payments/
│           └── route.ts      ⏳ Create
│
└── quotations/
    └── [id]/
        └── convert/
            └── route.ts      ⏳ Create
```

---

## 🎉 Summary

### **Materials:** ✅ **COMPLETE - No work needed!**

### **High Priority Work:**
1. **Database Migrations** - 15 min
2. **Estimations** - 6-8 hours
3. **E-Invoice UI** - 12-16 hours
4. **Conversions** - 6-8 hours

**Total High Priority:** ~25-30 hours (2 weeks of focused work)

---

**Ready to start? Begin with Task 1: Execute Database Migrations!** 🚀
