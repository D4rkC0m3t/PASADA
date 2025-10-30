# 🔧 Fix 403 Forbidden Errors - Complete Guide

## 🔍 Root Cause

The 403 errors occur because of **TWO issues**:

1. **Missing `user_id` column**: The `clients` table doesn't have a `user_id` column to link clients to authenticated users
2. **Wrong RLS policy approach**: RLS policies check `auth.jwt() ->> 'role'` but Supabase JWTs don't include custom roles

## ✅ Solution

1. Add `user_id` column to `clients` table
2. Use database functions to check roles from `user_profiles`
3. Fix all RLS policies to work correctly

## 📋 Step-by-Step Fix

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: `eoahwxdhvdfgllolzoxd`
3. Navigate to **SQL Editor** (left sidebar)

### Step 2: Run the Complete Fix SQL

1. Click **"New Query"**
2. Open the file: `database/FIX_RLS_403_COMPLETE.sql` ⚠️ **Use this file, not the old one!**
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)

**What this does:**
- Adds `user_id` column to `clients` table (if missing)
- Creates helper functions (`get_user_role()`, `is_admin()`, `is_client()`)
- Drops old broken RLS policies
- Creates new working RLS policies
- Grants necessary permissions

### Step 3: Verify the Fix

Run this query to check your role:
```sql
SELECT 
  auth.uid() as user_id,
  get_user_role() as my_role,
  is_admin() as am_i_admin,
  is_client() as am_i_client;
```

Expected output:
- If you're a client: `my_role = 'client'`, `am_i_client = true`
- If you're an admin: `my_role = 'admin'`, `am_i_admin = true`

### Step 4: Test Data Access

Try querying the clients table:
```sql
SELECT * FROM clients LIMIT 5;
```

If this works, your RLS policies are fixed! ✅

### Step 5: Link User to Client Record (If needed)

If you're logging in as a **client user**, you need to link your user account to a client record:

```sql
-- First, find your user ID
SELECT auth.uid();

-- Then, update a client record to link it to your user
UPDATE clients 
SET user_id = auth.uid() 
WHERE email = 'your-email@example.com';  -- Replace with your email
```

**For admin users**: You can skip this step - admins see all data.

### Step 6: Refresh Your Application

1. **Close your browser tab** with the CRM dashboard
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Navigate back to**: `http://localhost:3000/login`
4. **Login again** with your credentials
5. **Check the dashboard** - errors should be gone!

## 🔐 What Changed?

### Before (Broken):
```sql
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin'); -- ❌ role not in JWT
```

### After (Fixed):
```sql
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (is_admin()); -- ✅ Checks user_profiles table
```

## 🛠️ New Helper Functions

### `get_user_role()`
Returns the current user's role from `user_profiles` table.

### `is_admin()`
Returns `true` if user role is 'admin' or 'staff'.

### `is_client()`
Returns `true` if user role is 'client'.

## 🔍 Troubleshooting

### Still Getting 403 Errors?

1. **Check if you have a user_profiles record:**
```sql
SELECT * FROM user_profiles WHERE id = auth.uid();
```

2. **If no record exists, create one:**
```sql
INSERT INTO user_profiles (id, role, is_active, full_name, email)
VALUES (
  auth.uid(),
  'client', -- or 'admin'
  true,
  'Your Name',
  'your-email@example.com'
);
```

3. **Verify RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'user_profiles');
```

All should show `rowsecurity = true`.

### Error: "function get_user_role() does not exist"

Run the SQL script again. The functions must be created first.

### Error: "permission denied for table user_profiles"

```sql
-- Grant select on user_profiles to authenticated users
GRANT SELECT ON user_profiles TO authenticated;
```

## 🎯 Expected Behavior After Fix

### For Clients:
- ✅ Can view own client record
- ✅ Can view own projects
- ✅ Can view own quotations
- ❌ Cannot view other clients
- ❌ Cannot view other projects

### For Admins/Staff:
- ✅ Can view all clients
- ✅ Can view all projects
- ✅ Can create/update/delete records
- ✅ Full system access

## 📊 Database Structure

```
auth.users (Supabase Auth)
    ↓
user_profiles (Custom table with roles)
    ↓
clients (client_id → user_id link)
    ↓
projects (client_id → clients.id link)
```

## 🔄 Alternative Fix: Update JWT Claims

If you want roles in JWT instead (more complex):

1. Create a function to set custom claims
2. Update JWT on every auth event
3. Requires Supabase Edge Functions

**Recommendation**: Use the database function approach (simpler and works immediately).

## ✅ Success Checklist

- [ ] SQL script executed successfully
- [ ] `get_user_role()` function returns correct role
- [ ] Test query on clients table works
- [ ] Cleared browser cache
- [ ] Logged in again
- [ ] Dashboard loads without 403 errors
- [ ] Data displays correctly

## 📞 Support

If issues persist:
1. Check Supabase logs: Dashboard → Logs → Postgres
2. Verify user_profiles table has correct data
3. Check auth.uid() matches user_profiles.id
