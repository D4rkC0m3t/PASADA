# 🔐 PASADA CRM - Database Setup Guide

## Current Status: ✅ Code Ready, ⏳ Database Pending

### What's Working:
- ✅ Main website deployed at www.pasada.in
- ✅ Client dashboard code with security fixes
- ✅ Build successful (12 routes)
- ✅ RLS policies created in code
- ✅ Secure authentication flow implemented

### What's Pending:
- ⏳ Apply database migrations in Supabase
- ⏳ Link user accounts to client records
- ⏳ Test client dashboard with real data

---

## 📋 Step-by-Step Database Setup

### Step 1: Apply Migration 001 (Schema Updates)

**File:** `database/migrations/001_add_client_id_to_user_profiles.sql`

**What it does:**
- Adds `client_id` column to `user_profiles` table
- Adds `client_id` column to `quotations` table
- Adds `completion_percentage` to `projects` table
- Adds `is_active` to `clients` table
- Creates performance indexes

**How to apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `001_add_client_id_to_user_profiles.sql`
3. Paste and click "Run"
4. Verify: Should see "Success. No rows returned"

---

### Step 2: Verify RLS Policies (Already Applied)

**Status:** ✅ Already applied in previous session

**Verification query:**
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('clients', 'projects', 'quotations', 'bookings', 'user_profiles')
GROUP BY tablename
ORDER BY tablename;
```

**Expected results:**
- bookings: 4 policies
- clients: 5-9 policies
- projects: 5-9 policies
- quotations: 5-6 policies
- user_profiles: 3 policies

---

### Step 3: Link Users to Clients

After Migration 001, you need to link each client user to their client record.

**For each client user:**
```sql
-- Find the user's auth ID (from Supabase Auth dashboard)
-- Find the client's ID (from clients table)

UPDATE user_profiles
SET client_id = 'CLIENT_UUID_HERE'
WHERE id = 'USER_AUTH_UUID_HERE' AND role = 'client';
```

**Example:**
```sql
-- Link john@example.com to their client record
UPDATE user_profiles
SET client_id = (SELECT id FROM clients WHERE email = 'john@example.com')
WHERE id = (SELECT id FROM auth.users WHERE email = 'john@example.com');
```

---

### Step 4: Update Existing Quotations

The migration includes this, but verify:
```sql
-- This should already be done by migration 001
UPDATE quotations q
SET client_id = p.client_id
FROM projects p
WHERE q.project_id = p.id
AND q.client_id IS NULL;

-- Verify
SELECT COUNT(*) as quotations_with_client_id
FROM quotations
WHERE client_id IS NOT NULL;
```

---

### Step 5: Test Client Dashboard

1. **Create a test client user:**
   - Go to Supabase Auth → Users
   - Create new user with email/password
   - Note the user ID

2. **Create a test client record:**
   ```sql
   INSERT INTO clients (name, contact_name, email, phone, is_active)
   VALUES ('Test Client', 'John Doe', 'test@client.com', '+91 9876543210', true)
   RETURNING id;
   ```

3. **Link user to client:**
   ```sql
   UPDATE user_profiles
   SET client_id = 'CLIENT_ID_FROM_STEP_2', role = 'client'
   WHERE id = 'USER_ID_FROM_STEP_1';
   ```

4. **Create test project:**
   ```sql
   INSERT INTO projects (client_id, name, status, completion_percentage, start_date)
   VALUES (
     'CLIENT_ID_FROM_STEP_2',
     'Test Kitchen Project',
     'in_progress',
     45,
     CURRENT_DATE
   );
   ```

5. **Test login:**
   - Go to http://localhost:3000/client/dashboard
   - Login with test client credentials
   - Should see the test project with 45% completion

---

## 🔍 Verification Queries

### Check user_profiles structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clients', 'projects', 'quotations', 'bookings', 'user_profiles')
ORDER BY tablename;
```

### Check client data access:
```sql
-- As a client user, this should only return their data
SELECT * FROM projects;
SELECT * FROM quotations;
SELECT * FROM bookings;
```

---

## 🚨 Troubleshooting

### Issue: "Not linked to client record"
**Solution:**
```sql
UPDATE user_profiles
SET client_id = (SELECT id FROM clients WHERE email = 'USER_EMAIL_HERE')
WHERE id = 'USER_AUTH_ID_HERE';
```

### Issue: RLS blocking access
**Solution:** Verify role is set correctly:
```sql
SELECT id, email, role, client_id
FROM user_profiles
WHERE id = 'USER_AUTH_ID_HERE';

-- Should show: role = 'client', client_id = valid UUID
```

### Issue: No projects showing
**Solution:** Verify client_id matches:
```sql
SELECT p.id, p.name, p.client_id, c.name as client_name
FROM projects p
JOIN clients c ON p.client_id = c.id
WHERE c.email = 'CLIENT_EMAIL_HERE';
```

---

## 📊 Current Database State

### Tables with RLS:
- ✅ user_profiles
- ✅ clients
- ✅ projects
- ✅ quotations
- ✅ quote_items
- ✅ bookings

### Columns Added (Pending Migration 001):
- ⏳ user_profiles.client_id
- ⏳ quotations.client_id
- ⏳ projects.completion_percentage
- ⏳ clients.is_active

---

## 🎯 Next Steps

1. **Apply Migration 001** in Supabase SQL Editor
2. **Link existing users** to their client records
3. **Test client dashboard** with real data
4. **Deploy to production** once verified
5. **Restore other CRM routes** (admin, login, signup)

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Verify RLS policies with verification queries
3. Test with a fresh test user
4. Check browser console for errors

---

**Created:** November 4, 2025  
**Status:** Ready for database migration  
**Next:** Apply Migration 001 in Supabase
