# 🗄️ Database Migration Execution Order

**Important:** Run these migrations in the exact order specified below.

---

## ✅ Migration Execution Steps

### **Step 1: Add GST Fields to Existing Tables**
**File:** `001_add_gst_fields.sql`

**What it does:**
- Adds GST columns to `clients` table (gstin, state_code, pan, client_type)
- Adds GST columns to `quotations` table (gst_rate, gst_amount, cgst, sgst, igst, etc.)
- Adds GST columns to `quote_items` table (hsn_sac_code, taxable_value, tax_rate, etc.)
- Creates indexes for performance

**Run in Supabase SQL Editor:**
```sql
-- Copy and paste the entire contents of 001_add_gst_fields.sql
```

---

### **Step 2: Create New GST Tables**
**File:** `002_create_gst_tables.sql`

**What it does:**
- Creates `company_settings` table (company info, GST details, bank details)
- Creates `hsn_sac_master` table (HSN/SAC codes catalog)
- Creates `gst_audit_log` table (audit trail for GST changes)

**Run in Supabase SQL Editor:**
```sql
-- Copy and paste the entire contents of 002_create_gst_tables.sql
```

---

### **Step 3: Add Row Level Security Policies**
**File:** `003_add_gst_rls_policies.sql`

**What it does:**
- Enables RLS on all new GST tables
- Creates policies for admin access to company settings
- Creates policies for HSN/SAC master data
- Creates policies for audit logs

**Run in Supabase SQL Editor:**
```sql
-- Copy and paste the entire contents of 003_add_gst_rls_policies.sql
```

---

### **Step 4: Insert PASADA Company Data**
**File:** `004_insert_pasada_company_data.sql`

**What it does:**
- Inserts PASADA company details (GSTIN: 29CGRPB3179A1ZD)
- Inserts common HSN/SAC codes for interior design
- Pre-loads 20+ HSN/SAC codes

**Run in Supabase SQL Editor:**
```sql
-- Copy and paste the entire contents of 004_insert_pasada_company_data.sql
```

---

## 🔍 Verification Steps

### **After Migration 001:**
```sql
-- Check if GST columns were added to clients
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name IN ('gstin', 'state_code', 'pan', 'client_type');

-- Check if GST columns were added to quotations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotations' 
AND column_name IN ('gst_rate', 'gst_amount', 'cgst_amount', 'sgst_amount', 'igst_amount');
```

### **After Migration 002:**
```sql
-- Check if new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('company_settings', 'hsn_sac_master', 'gst_audit_log');

-- Check table structure
\d company_settings
\d hsn_sac_master
\d gst_audit_log
```

### **After Migration 003:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('company_settings', 'hsn_sac_master', 'gst_audit_log');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('company_settings', 'hsn_sac_master', 'gst_audit_log');
```

### **After Migration 004:**
```sql
-- Check if PASADA company data was inserted
SELECT company_name, gstin, state_code, city 
FROM company_settings;

-- Check if HSN/SAC codes were inserted
SELECT code, description, type, gst_rate 
FROM hsn_sac_master 
ORDER BY code 
LIMIT 10;

-- Count total HSN/SAC codes
SELECT COUNT(*) as total_codes FROM hsn_sac_master;
```

---

## ⚠️ Troubleshooting

### **Error: relation "company_settings" does not exist**
**Solution:** Run migration 002 before migration 004

### **Error: column "gstin" already exists**
**Solution:** Migration 001 was already run. Skip to next migration.

### **Error: policy already exists**
**Solution:** Migration 003 was already run. Skip to next migration.

### **Error: duplicate key value violates unique constraint**
**Solution:** Data already exists. Check if migration 004 was already run.

---

## 🔄 Rollback (If Needed)

### **Rollback Migration 004:**
```sql
DELETE FROM hsn_sac_master;
DELETE FROM company_settings;
```

### **Rollback Migration 003:**
```sql
DROP POLICY IF EXISTS "Admin can view company settings" ON company_settings;
DROP POLICY IF EXISTS "Admin can insert company settings" ON company_settings;
DROP POLICY IF EXISTS "Admin can update company settings" ON company_settings;
DROP POLICY IF EXISTS "Authenticated users can view HSN/SAC codes" ON hsn_sac_master;
DROP POLICY IF EXISTS "Admin can insert HSN/SAC codes" ON hsn_sac_master;
DROP POLICY IF EXISTS "Admin can update HSN/SAC codes" ON hsn_sac_master;
DROP POLICY IF EXISTS "Admin can delete HSN/SAC codes" ON hsn_sac_master;
DROP POLICY IF EXISTS "Admin can view audit logs" ON gst_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON gst_audit_log;

ALTER TABLE company_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE hsn_sac_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE gst_audit_log DISABLE ROW LEVEL SECURITY;
```

### **Rollback Migration 002:**
```sql
DROP TABLE IF EXISTS gst_audit_log;
DROP TABLE IF EXISTS hsn_sac_master;
DROP TABLE IF EXISTS company_settings;
```

### **Rollback Migration 001:**
```sql
-- Remove columns from clients
ALTER TABLE clients 
DROP COLUMN IF EXISTS gstin,
DROP COLUMN IF EXISTS state_code,
DROP COLUMN IF EXISTS pan,
DROP COLUMN IF EXISTS client_type;

-- Remove columns from quotations
ALTER TABLE quotations 
DROP COLUMN IF EXISTS gst_rate,
DROP COLUMN IF EXISTS gst_amount,
DROP COLUMN IF EXISTS cgst_amount,
DROP COLUMN IF EXISTS sgst_amount,
DROP COLUMN IF EXISTS igst_amount,
DROP COLUMN IF EXISTS total_with_gst,
DROP COLUMN IF EXISTS is_tax_inclusive,
DROP COLUMN IF EXISTS buyer_gstin,
DROP COLUMN IF EXISTS seller_gstin,
DROP COLUMN IF EXISTS place_of_supply,
DROP COLUMN IF EXISTS invoice_type,
DROP COLUMN IF EXISTS irn,
DROP COLUMN IF EXISTS qr_code_url,
DROP COLUMN IF EXISTS signed_invoice_json,
DROP COLUMN IF EXISTS einvoice_status,
DROP COLUMN IF EXISTS einvoice_generated_at;

-- Remove columns from quote_items
ALTER TABLE quote_items 
DROP COLUMN IF EXISTS hsn_sac_code,
DROP COLUMN IF EXISTS taxable_value,
DROP COLUMN IF EXISTS tax_rate,
DROP COLUMN IF EXISTS gst_amount,
DROP COLUMN IF EXISTS cgst_amount,
DROP COLUMN IF EXISTS sgst_amount,
DROP COLUMN IF EXISTS igst_amount;
```

---

## 📝 Quick Start (Copy-Paste Ready)

### **Run All Migrations in Supabase SQL Editor:**

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste each migration file content one by one
4. Click "Run" after each migration
5. Verify results using the verification queries above

---

## ✅ Success Checklist

After running all migrations, you should have:

- [x] GST columns added to clients, quotations, quote_items
- [x] company_settings table created with PASADA data
- [x] hsn_sac_master table created with 20+ codes
- [x] gst_audit_log table created
- [x] RLS policies enabled on all GST tables
- [x] PASADA company data inserted (GSTIN: 29CGRPB3179A1ZD)
- [x] HSN/SAC codes pre-loaded

---

**Status:** Ready to run migrations in Supabase!

**Next Step:** Open Supabase SQL Editor and execute migrations 001 → 002 → 003 → 004 in order.
