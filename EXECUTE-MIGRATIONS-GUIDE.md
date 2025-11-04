# 🚀 Database Migrations Execution Guide

**Date:** 2025-11-03  
**Task:** Execute Estimations & Invoices table migrations  
**Priority:** HIGH - Required for next development phase

---

## 📋 **Pre-Execution Checklist**

### ✅ **Before You Start:**
- [ ] Backup your Supabase database
- [ ] Ensure you have admin access to Supabase Dashboard
- [ ] Confirm `update_updated_at_column()` function exists
- [ ] Verify `quotations` and `clients` tables exist

---

## 🎯 **Migration Files to Execute**

### **Migration 1: Estimations Tables**
**File:** `database/migrations/005_create_estimation_tables.sql`

**Creates:**
- ✅ `estimations` table (main estimation records)
- ✅ `estimation_items` table (line items)
- ✅ Auto-number generation (EST-2024-001)
- ✅ RLS policies for security
- ✅ Indexes for performance
- ✅ Triggers for automation

**Estimated Time:** 30 seconds

---

### **Migration 2: Invoices & E-Invoice Tables**
**File:** `database/migrations/006_create_invoice_tables.sql`

**Creates:**
- ✅ `invoices` table (GST-compliant invoices)
- ✅ `invoice_items` table (line items with GST)
- ✅ `payments` table (payment tracking)
- ✅ `e_invoice_logs` table (audit trail)
- ✅ Auto-number generation (INV-202411-001)
- ✅ Payment tracking automation
- ✅ Outstanding amount calculation
- ✅ Status auto-updates
- ✅ RLS policies
- ✅ Indexes

**Estimated Time:** 45 seconds

---

## 🔧 **Execution Steps**

### **Step 1: Open Supabase SQL Editor**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your PASADA CRM project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

---

### **Step 2: Execute Estimations Migration**

#### **A. Copy SQL Content**
1. Open: `database/migrations/005_create_estimation_tables.sql`
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)

#### **B. Paste and Run**
1. Paste into SQL Editor
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for success message

#### **C. Verify Success**
```sql
-- Run this verification query
SELECT 
    'estimations' as table_name,
    COUNT(*) as row_count
FROM estimations
UNION ALL
SELECT 
    'estimation_items' as table_name,
    COUNT(*) as row_count
FROM estimation_items;
```

**Expected Result:** Both tables return 0 rows (empty but created)

---

### **Step 3: Execute Invoices Migration**

#### **A. Copy SQL Content**
1. Open: `database/migrations/006_create_invoice_tables.sql`
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)

#### **B. Paste and Run**
1. Paste into SQL Editor (new query)
2. Click **Run** button
3. Wait for success message

#### **C. Verify Success**
```sql
-- Run this verification query
SELECT 
    table_name,
    COUNT(*) as row_count
FROM (
    SELECT 'invoices' as table_name, COUNT(*) as row_count FROM invoices
    UNION ALL
    SELECT 'invoice_items' as table_name, COUNT(*) as row_count FROM invoice_items
    UNION ALL
    SELECT 'payments' as table_name, COUNT(*) as row_count FROM payments
    UNION ALL
    SELECT 'e_invoice_logs' as table_name, COUNT(*) as row_count FROM e_invoice_logs
) t
GROUP BY table_name;
```

**Expected Result:** All 4 tables return 0 rows

---

## ✅ **Complete Verification**

### **Run Full System Check:**

```sql
-- Check all new tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename IN (
    'estimations',
    'estimation_items',
    'invoices',
    'invoice_items',
    'payments',
    'e_invoice_logs'
)
ORDER BY tablename;
```

**Expected:** 6 tables listed

---

### **Check RLS Policies:**

```sql
-- Verify RLS is enabled and policies exist
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN (
    'estimations',
    'estimation_items',
    'invoices',
    'invoice_items',
    'payments',
    'e_invoice_logs'
)
ORDER BY tablename, cmd;
```

**Expected:** Multiple policies for each table

---

### **Check Indexes:**

```sql
-- Verify indexes are created
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'estimations',
    'estimation_items',
    'invoices',
    'invoice_items',
    'payments',
    'e_invoice_logs'
)
ORDER BY tablename, indexname;
```

**Expected:** Multiple indexes per table

---

### **Test Auto-Number Generation:**

```sql
-- Test estimation number generation
SELECT generate_estimation_number() as next_estimation_number;

-- Test invoice number generation
SELECT generate_invoice_number() as next_invoice_number;
```

**Expected:**
- `EST-2024-001` (or current year)
- `INV-202411-001` (current year+month)

---

## 🎉 **Success Indicators**

### ✅ **All Migrations Complete When:**

1. **Tables Created:**
   - ✅ estimations
   - ✅ estimation_items
   - ✅ invoices
   - ✅ invoice_items
   - ✅ payments
   - ✅ e_invoice_logs

2. **Functions Working:**
   - ✅ `generate_estimation_number()`
   - ✅ `generate_invoice_number()`
   - ✅ `set_estimation_number()`
   - ✅ `set_invoice_number()`
   - ✅ `update_invoice_outstanding()`
   - ✅ `update_invoice_on_payment()`

3. **Triggers Active:**
   - ✅ Auto-generate estimation numbers
   - ✅ Auto-generate invoice numbers
   - ✅ Auto-update outstanding amounts
   - ✅ Auto-update invoice status
   - ✅ Auto-update timestamps

4. **Security Enabled:**
   - ✅ RLS enabled on all tables
   - ✅ Policies created for all operations
   - ✅ Role-based access working

---

## 🐛 **Troubleshooting**

### **Error: Function `update_updated_at_column()` does not exist**

**Solution:** Create the function first:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### **Error: Table `quotations` does not exist**

**Solution:** The estimations table references quotations. If quotations doesn't exist, remove the foreign key constraint temporarily:

```sql
-- In 005_create_estimation_tables.sql, change line 32:
-- FROM:
converted_to_quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,

-- TO:
converted_to_quotation_id UUID,
```

---

### **Error: Extension `uuid-ossp` not available**

**Solution:** Enable the extension:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

### **Error: Permission denied**

**Solution:** Ensure you're logged in as a superuser or database owner. Contact Supabase support if needed.

---

## 📊 **Post-Migration Tasks**

### **1. Update API Routes**

Create these API route files:

```
app/api/
├── estimations/
│   ├── route.ts              # List & Create
│   └── [id]/
│       ├── route.ts          # Get, Update, Delete
│       └── convert/
│           └── route.ts      # Convert to Quotation
│
└── invoices/
    ├── route.ts              # List & Create
    └── [id]/
        ├── route.ts          # Get, Update, Delete
        ├── generate-irn/
        │   └── route.ts      # Generate IRN
        ├── cancel-irn/
        │   └── route.ts      # Cancel IRN
        ├── pdf/
        │   └── route.ts      # Generate PDF
        └── payments/
            └── route.ts      # Payment CRUD
```

---

### **2. Create UI Pages**

**Estimations:**
- `/admin/estimations/[id]/page.tsx` - Detail view
- `/admin/estimations/[id]/edit/page.tsx` - Edit form
- `/admin/estimations/[id]/convert/page.tsx` - Convert to quotation

**Invoices:**
- `/admin/invoices/list/page.tsx` - List view
- `/admin/invoices/new/page.tsx` - Create form
- `/admin/invoices/[id]/page.tsx` - Detail view
- `/admin/invoices/[id]/edit/page.tsx` - Edit form
- `/admin/invoices/[id]/payments/page.tsx` - Payment tracking

---

### **3. Test Data Creation**

Create sample records to test:

```sql
-- Sample estimation
INSERT INTO estimations (
    title,
    client_id,
    estimation_type,
    subtotal,
    total,
    status,
    created_by
) VALUES (
    'Sample Kitchen Renovation',
    (SELECT id FROM clients LIMIT 1),
    'detailed',
    50000.00,
    50000.00,
    'draft',
    auth.uid()
);

-- Sample invoice
INSERT INTO invoices (
    project_id,
    client_id,
    invoice_date,
    due_date,
    subtotal,
    gst_rate,
    gst_amount,
    total_with_gst,
    seller_gstin,
    place_of_supply,
    invoice_type,
    created_by
) VALUES (
    (SELECT id FROM projects LIMIT 1),
    (SELECT id FROM clients LIMIT 1),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    100000.00,
    18.00,
    18000.00,
    118000.00,
    '29ABCDE1234F1Z5',
    'Karnataka',
    'B2B',
    auth.uid()
);
```

---

## 🎯 **Next Steps After Migration**

1. ✅ **Migrations Complete** ← You are here
2. ⏳ **Create Estimation Pages** (6-8 hours)
3. ⏳ **Create Invoice Pages** (12-16 hours)
4. ⏳ **Implement Conversions** (6-8 hours)
5. ⏳ **Test E-Invoice Integration** (4-6 hours)

---

## 📝 **Migration Log**

Keep track of your migration execution:

```
Date: _____________
Executed by: _____________
Estimations Migration: ☐ Success ☐ Failed
Invoices Migration: ☐ Success ☐ Failed
Verification Passed: ☐ Yes ☐ No
Issues Encountered: _____________
Notes: _____________
```

---

## 🆘 **Need Help?**

If you encounter any issues:

1. Check Supabase logs in Dashboard → Logs
2. Review error messages carefully
3. Verify all prerequisite tables exist
4. Ensure you have proper permissions
5. Contact Supabase support if needed

---

**Ready to execute? Start with Step 1!** 🚀

**Estimated Total Time:** 5-10 minutes (including verification)
