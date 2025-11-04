# 🗄️ Database Setup - Complete Guide

**Generated:** 2025-11-01 19:37 IST  
**Status:** 🔧 **SETUP REQUIRED**

---

## 🎯 Current Situation

You're seeing these errors because **database tables haven't been created yet** in Supabase:

```
❌ visitors table → 404 error
❌ clients table → 400 error (might exist with wrong schema)
❌ projects table → 400 error (might exist with wrong schema)
```

**Good News:** All SQL schema files exist in the codebase! You just need to run them.

---

## ✅ VisitorAnalytics Component - Already Fixed!

The `days` variable error you mentioned is **already fixed**. The component now uses:

```typescript
const [selectedDays, setSelectedDays] = useState(initialDays);
// Line 28 correctly uses: since.setDate(since.getDate() - selectedDays);
```

**No action needed** for VisitorAnalytics.tsx ✅

---

## 🚀 Complete Database Setup (Step-by-Step)

### **Step 1: Access Supabase SQL Editor**

1. Go to: https://supabase.com/dashboard
2. Select your project: `eoahwxdhvdfgllolzoxd`
3. Click **SQL Editor** in left sidebar

---

### **Step 2: Run Schemas in This Order**

#### **Schema 1: Main Tables** (REQUIRED)
**File:** `database/schema.sql`

**What it creates:**
- ✅ `clients` table
- ✅ `projects` table
- ✅ `quotations` table
- ✅ `quote_items` table
- ✅ `materials` table
- ✅ `bookings` table
- ✅ All RLS policies

**How to run:**
1. Open `d:/Projects/Pasada/CRM/Pasada/database/schema.sql`
2. Copy ALL content
3. Paste in Supabase SQL Editor
4. Click **RUN**

---

#### **Schema 2: Analytics & Leads** (REQUIRED for Visitors)
**File:** `database/analytics-schema.sql`

**What it creates:**
- ✅ `visitors` table ← **Fixes your 404 error!**
- ✅ `leads` table
- ✅ `lead_activities` table
- ✅ Analytics views
- ✅ RLS policies

**How to run:**
1. Open `d:/Projects/Pasada/CRM/Pasada/database/analytics-schema.sql`
2. Copy ALL content
3. Paste in Supabase SQL Editor
4. Click **RUN**

---

#### **Schema 3: Estimations** (Optional but Recommended)
**File:** `database/migrations/005_create_estimation_tables.sql`

**What it creates:**
- ✅ `estimations` table
- ✅ `estimation_items` table
- ✅ Auto-numbering (EST-2024-001)
- ✅ RLS policies

**How to run:**
1. Open the file
2. Copy ALL content
3. Paste in Supabase SQL Editor
4. Click **RUN**

---

#### **Schema 4: E-Invoice Tables** (Optional)
**File:** `database/migrations/006_create_invoice_tables.sql`

**What it creates:**
- ✅ `invoices` table
- ✅ `invoice_items` table
- ✅ `payments` table
- ✅ `e_invoice_logs` table

**How to run:**
1. Open the file
2. Copy ALL content
3. Paste in Supabase SQL Editor
4. Click **RUN**

---

#### **Schema 5: GST Fields** (If using GST)
**File:** `database/migrations/001_add_gst_fields.sql`

**What it does:**
- Adds GST columns to quotations table
- Adds company GSTIN fields

**How to run:**
1. Open the file
2. Copy ALL content
3. Paste in Supabase SQL Editor
4. Click **RUN**

---

## 🔧 Quick Fix: Essential Tables Only

If you want to **fix the immediate errors**, run this minimal SQL:

```sql
-- ============================================
-- ESSENTIAL TABLES - Quick Fix
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gstin TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'planning',
    budget NUMERIC(12,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. VISITORS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    page_url TEXT NOT NULL,
    page_name TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    country TEXT,
    city TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page_name ON visitors(page_name);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================
-- ENABLE RLS (Row Level Security)
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Permissive for now)
-- ============================================

-- Clients: Allow all authenticated users
CREATE POLICY "Allow authenticated users to read clients"
    ON clients FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert clients"
    ON clients FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update clients"
    ON clients FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Projects: Allow all authenticated users
CREATE POLICY "Allow authenticated users to read projects"
    ON projects FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert projects"
    ON projects FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update projects"
    ON projects FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Visitors: Allow public insert, authenticated read
CREATE POLICY "Allow public to insert visitors"
    ON visitors FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read visitors"
    ON visitors FOR SELECT
    USING (auth.role() = 'authenticated');
```

**Copy this entire SQL block** and run it in Supabase SQL Editor.

---

## 🧪 Verify Setup

After running the schemas, test in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'projects', 'visitors', 'quotations', 'estimations');

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visitors';

-- Test insert (optional)
INSERT INTO visitors (page_name, page_url, session_id)
VALUES ('test', 'http://test.com', 'test-session-123');

-- Verify data
SELECT COUNT(*) FROM visitors;
```

---

## 📊 Complete Schema Checklist

Run these in order:

- [ ] **Step 1:** Run `schema.sql` (main tables)
- [ ] **Step 2:** Run `analytics-schema.sql` (visitors, leads)
- [ ] **Step 3:** Run estimation migration (optional)
- [ ] **Step 4:** Run invoice migration (optional)
- [ ] **Step 5:** Run GST migration (optional)
- [ ] **Step 6:** Verify all tables exist
- [ ] **Step 7:** Test your app (refresh dashboard)

---

## 🔍 Common Issues & Solutions

### **Issue 1: "relation already exists"**
**Solution:** Table already created, skip or use `IF NOT EXISTS`

### **Issue 2: "permission denied"**
**Solution:** You're using the wrong Supabase role. Use the SQL Editor in dashboard (it has full permissions)

### **Issue 3: RLS policy blocks queries**
**Solution:** Make sure you're authenticated when testing the app. RLS policies require authentication.

### **Issue 4: Foreign key constraint fails**
**Solution:** Create tables in the correct order:
1. First: `clients`
2. Then: `projects` (references clients)
3. Then: `quotations` (references projects)

---

## 🎯 After Setup

Once you've run the schemas:

1. **Refresh your app:** `Ctrl+Shift+R` to clear cache
2. **Check dashboard:** Visit `/admin/dashboard`
3. **Test widgets:**
   - Visitor Analytics should load (no 404)
   - Stat cards should show data
   - Estimations should work

---

## 📞 Quick Support

**If errors persist:**

1. **Check Supabase logs:**
   - Supabase Dashboard → Logs → API Logs
   - Look for specific error messages

2. **Verify environment variables:**
   - `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
   - `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Test API manually:**
   - Supabase Dashboard → API
   - Try: `GET /rest/v1/visitors`
   - Should return `[]` if table exists

---

## 🎊 Summary

**Current Status:**
- ❌ Tables not created yet (causing 404 errors)
- ✅ All SQL schema files exist and ready
- ✅ VisitorAnalytics code is correct

**Required Action:**
1. Run `schema.sql` in Supabase SQL Editor
2. Run `analytics-schema.sql` in Supabase SQL Editor
3. Refresh your app

**Estimated Time:** 5-10 minutes

---

**After running these schemas, all your 404 and 400 errors will be resolved!** 🚀

---

**Need help?** Let me know which step you're on and any errors you encounter.
