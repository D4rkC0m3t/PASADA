# 🔧 COMPLETE CONTACT FORM FIX - Step by Step

## Current Status
Contact form returning 500 error despite RLS policy fixes.

## Root Cause Analysis
The issue could be:
1. ❌ RLS policies not applied correctly
2. ❌ Table doesn't exist or has wrong structure
3. ❌ Permissions not granted to anon role
4. ❌ Environment variables incorrect

## 🚀 COMPLETE FIX (2 Options)

---

## Option 1: Run Complete Diagnosis Script (RECOMMENDED)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **PASADA CRM**
3. Click **SQL Editor** in left sidebar

### Step 2: Run Diagnosis Script
1. Open file: `d:/Projects/Pasada/CRM/Pasada/database/DIAGNOSE_AND_FIX.sql`
2. **Copy ALL content** (entire file)
3. **Paste** into Supabase SQL Editor
4. Click **Run** or press `Ctrl + Enter`

### Step 3: Review Results
The script will:
- ✅ Show current table structure
- ✅ Show current RLS policies
- ✅ Show current permissions
- ✅ Drop all conflicting policies
- ✅ Recreate tables if needed
- ✅ Grant proper permissions
- ✅ Create correct RLS policies (handles both `id` and `user_id` columns)
- ✅ Run a test insert
- ✅ Show verification results

### Step 4: Test Contact Form
1. Go to: http://localhost:3000/pasada.design/en/contant-us.html
2. Fill out form and submit
3. Should now work without 500 error

---

## Option 2: Quick Manual Fix (if Option 1 fails)

### 1. Check Supabase Connection

Run in terminal:
```powershell
cd d:/Projects/Pasada/CRM/Pasada
$env:NEXT_PUBLIC_SUPABASE_URL
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Should output:
- URL: `https://eoahwxdhvdfgllolzoxd.supabase.co`
- Key: `eyJhbGciOi...` (long string)

### 2. Verify Tables Exist

In Supabase SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'audit_logs', 'user_profiles');
```

**Expected output:** All 3 tables should exist.

### 3. Check RLS Status

```sql
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'leads';
```

**Expected:** `rowsecurity = true`

### 4. Manual RLS Fix

If tables exist but RLS is broken, run this minimal fix:

```sql
-- Disable RLS
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON public.leads TO anon;

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create simple policy
DROP POLICY IF EXISTS "allow_anon_insert" ON public.leads;
CREATE POLICY "allow_anon_insert"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);
```

---

## 🧪 Testing & Verification

### Test 1: Direct Database Insert
Run in Supabase SQL Editor:
```sql
SET ROLE anon;
INSERT INTO public.leads (name, email, phone, service_type, message)
VALUES ('Test', 'test@test.com', '1234567890', 'Test', 'Test');
RESET ROLE;
```

**Expected:** Insert succeeds without error.

### Test 2: API Route
Open browser console (F12) and run:
```javascript
fetch('/api/contact/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'test@test.com',
    phone: '1234567890',
    service: 'Interior Design',
    message: 'Test',
    termsAccepted: true
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected:** 
```json
{
  "success": true,
  "message": "Thank you! Your inquiry has been received..."
}
```

### Test 3: Form Submission
1. Fill contact form
2. Submit
3. Check browser Network tab (F12 → Network)
4. Look for `submit` request
5. Should return status **200** (not 500)

---

## 🔍 Debugging Steps

### If Still Getting 500 Error

#### Check Server Logs
Look at your terminal where `npm run dev` is running.

**Look for:**
- "Supabase error details"
- Error code (42501 = RLS issue, 42P01 = table not found, etc.)

#### Check Browser Console
Press F12 → Console tab

**Look for:**
- Red error messages
- Network request details
- Response body

#### Verify Environment Variables
1. Check `.env.local` file exists
2. Verify it contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://eoahwxdhvdfgllolzoxd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. Restart dev server after any .env changes

---

## 🎯 Common Errors & Solutions

### Error: "new row violates row-level security policy"
- **Cause:** RLS policy not allowing anonymous inserts
- **Fix:** Run DIAGNOSE_AND_FIX.sql script

### Error: "relation 'public.leads' does not exist"
- **Cause:** Table not created
- **Fix:** Run table creation part of DIAGNOSE_AND_FIX.sql

### Error: "column user_profiles.user_id does not exist"
- **Cause:** Using wrong column name in policies
- **Fix:** Already handled in DIAGNOSE_AND_FIX.sql (uses both `id` and `user_id`)

### Error: "permission denied for table leads"
- **Cause:** anon role doesn't have INSERT permission
- **Fix:** Run `GRANT SELECT, INSERT ON public.leads TO anon;`

---

## 📋 What the Complete Fix Does

### Database Structure
```
public.leads
├── id (UUID, primary key)
├── name (TEXT, not null)
├── email (TEXT, not null)
├── phone (TEXT, not null)
├── message (TEXT, not null)
├── service_type (TEXT, not null)
├── service_tag (TEXT, nullable)
├── service_category (TEXT, nullable)
├── status (TEXT, default 'new')
├── priority (TEXT, default 'medium')
├── source (TEXT, default 'website_contact_form')
├── ip_address (TEXT, nullable)
├── user_agent (TEXT, nullable)
├── submitted_at (TIMESTAMPTZ, nullable)
├── created_at (TIMESTAMPTZ, default NOW())
└── updated_at (TIMESTAMPTZ, default NOW())
```

### RLS Policies Created
1. **allow_anon_insert_leads** - Lets anyone insert new leads
2. **allow_admin_select_leads** - Lets admins read all leads
3. **allow_admin_update_leads** - Lets admins update leads
4. **allow_admin_delete_leads** - Lets admins delete leads

### Permissions Granted
- **anon**: SELECT, INSERT on leads and audit_logs
- **authenticated**: SELECT, INSERT, UPDATE, DELETE on both tables
- **service_role**: ALL privileges

---

## ✅ Success Checklist

After running the fix, verify:

- [ ] SQL script executed without errors
- [ ] Verification queries show policies created
- [ ] Test insert from SQL Editor succeeds
- [ ] Contact form submits without 500 error
- [ ] Success message appears in UI
- [ ] Lead appears in Supabase Table Editor
- [ ] Browser console shows no errors
- [ ] Server terminal shows "Received form data" log

---

## 🆘 If Nothing Works

### Nuclear Option (Recreate Everything)

1. **Backup existing data** (if any):
   ```sql
   SELECT * FROM leads;  -- Copy results
   ```

2. **Drop and recreate**:
   ```sql
   DROP TABLE IF EXISTS public.leads CASCADE;
   DROP TABLE IF EXISTS public.audit_logs CASCADE;
   -- Then run DIAGNOSE_AND_FIX.sql
   ```

3. **Verify in Supabase Dashboard**:
   - Go to Table Editor
   - See if `leads` table appears
   - Check if you can manually insert a row

4. **Contact Support**:
   - If still failing, there may be a project-level permission issue
   - Check Supabase project settings
   - Verify RLS is not disabled at project level

---

## 📞 Need Help?

If the issue persists:
1. Copy the **exact error message** from terminal
2. Copy the **response body** from Network tab in browser
3. Run the diagnosis queries and share results
4. Check if user_profiles table exists and has correct structure

---

**The DIAGNOSE_AND_FIX.sql script should solve the issue completely. Run it now!**
