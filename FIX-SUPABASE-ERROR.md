# Fix Supabase 500 Error - User Profiles

## Error Details
```
GET https://eoahwxdhvdfgllolzoxd.supabase.co/rest/v1/user_profiles?select=role%2Cis_active&id=eq.7404ea0d-7e5c-46eb-ac7b-16d6ccf383c0 500 (Internal Server Error)
```

## Root Cause
The `user_profiles` table either:
1. Doesn't exist in your Supabase database
2. Has incorrect RLS (Row Level Security) policies
3. Needs proper permissions

---

## ✅ Quick Fix Steps

### 1. **Run the Migration SQL**

Go to your Supabase dashboard and execute the migration:

**Supabase Dashboard Steps:**
1. Open https://supabase.com/dashboard
2. Select your project: `eoahwxdhvdfgllolzoxd`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire content from:
   - `database/migrations/fix_user_profiles_rls.sql`
6. Click **Run** (or press `Ctrl+Enter`)

### 2. **Verify Table Creation**

After running the migration, verify in SQL Editor:

```sql
-- Check if table exists
SELECT * FROM user_profiles LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Check your user's profile
SELECT * FROM user_profiles WHERE id = auth.uid();
```

### 3. **Create Your Admin Profile** (if needed)

If the table is empty, create your admin profile:

```sql
-- Insert admin profile for your user
INSERT INTO user_profiles (id, full_name, role, is_active)
VALUES (
  auth.uid(),  -- Your current user ID
  'Admin User',  -- Your name
  'admin',  -- Role
  true  -- Active status
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_active = true;
```

---

## 🔍 Verify Your User ID

To find your user ID, run in SQL Editor:

```sql
SELECT auth.uid();
```

Or check in your Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Find your email
3. Copy the UUID

---

## 🛠️ Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```powershell
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref eoahwxdhvdfgllolzoxd

# Run migration
supabase db push
```

---

## 📋 What the Migration Does

### 1. **Creates user_profiles Table**
```sql
- id: UUID (references auth.users)
- full_name: TEXT
- role: TEXT ('admin', 'staff', 'client')
- phone: TEXT
- company_id: UUID
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 2. **Enables RLS Policies**
- Users can view/update own profile
- Users can insert own profile on signup
- Admins can view/update/delete all profiles

### 3. **Creates Indexes**
- On role (for filtering by role)
- On company_id (for company queries)
- On is_active (for active user queries)

### 4. **Grants Permissions**
- `authenticated` role: SELECT, INSERT, UPDATE
- `service_role`: Full access (SELECT, INSERT, UPDATE, DELETE)

---

## 🔐 RLS Policies Explained

### For Regular Users:
```sql
-- Can read own profile
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Can update own profile
UPDATE user_profiles SET full_name = 'New Name' WHERE id = auth.uid();
```

### For Admins:
```sql
-- Can read all profiles
SELECT * FROM user_profiles;

-- Can update any profile
UPDATE user_profiles SET is_active = false WHERE id = '...';

-- Can delete profiles
DELETE FROM user_profiles WHERE id = '...';
```

---

## 🧪 Test After Fix

### 1. **Restart Dev Server**
```powershell
# In your terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

### 2. **Hard Refresh Browser**
- Press `Ctrl + Shift + R`

### 3. **Test Login**
1. Go to http://localhost:3000/login?type=admin
2. Login with your credentials
3. Should redirect to dashboard without errors

### 4. **Check Browser Console**
- Press `F12`
- No more 500 errors
- No Supabase errors

---

## 🔄 If Still Getting Errors

### Check Environment Variables

Verify in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eoahwxdhvdfgllolzoxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Verify Supabase Connection

Create a test file `test-supabase.ts`:

```typescript
import { createBrowserClient } from '@/lib/supabase/client';

const supabase = createBrowserClient();

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
  
  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Supabase Connected! Data:', data);
  }
};

testConnection();
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Logs** (left sidebar)
3. Look for errors in **Postgres Logs**
4. Check for RLS policy violations

---

## 📝 Common Issues

### Issue 1: "relation user_profiles does not exist"
**Fix:** Run the migration SQL to create the table

### Issue 2: "permission denied for table user_profiles"
**Fix:** RLS policies not set correctly - run migration again

### Issue 3: "new row violates check constraint"
**Fix:** Role must be 'admin', 'staff', or 'client' (lowercase)

### Issue 4: "null value in column id violates not-null constraint"
**Fix:** User not authenticated - check `auth.uid()` returns valid UUID

---

## 🚀 After Successful Fix

You should be able to:
✅ Login without 500 errors
✅ Access client/admin dashboards
✅ View user profiles
✅ Update profile information
✅ Role-based access working

---

## 📞 Need Help?

If errors persist, check:
1. Supabase project is not paused
2. Database connection is active
3. API keys are correct in `.env.local`
4. User is authenticated (has valid JWT)

---

**Migration File:** `database/migrations/fix_user_profiles_rls.sql`
**Status:** Ready to run in Supabase SQL Editor
**Last Updated:** November 5, 2025
