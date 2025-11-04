# 🔍 Authentication Issue - Complete Diagnosis

**Problem:** Clients can still access admin portal after AuthGuard implementation

---

## 🎯 Quick Test

**1. Open the debug page I created:**
```
http://localhost:3000/debug-auth
```

This will show you:
- Your current session
- Your user profile
- Your role
- What access you should have

---

## 🔴 Most Likely Root Causes

### Issue #1: user_profiles Table Doesn't Exist ⚠️
**Check:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_profiles LIMIT 1;
```

**If it fails:** Table doesn't exist!

**Fix:**
```sql
-- Run the schema
-- File: database/schema.sql
-- Or manually create:

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'client')),
    phone TEXT,
    avatar_url TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Issue #2: User Has No Profile Record ⚠️
**Check:**
```sql
-- In Supabase SQL Editor
SELECT 
  u.id,
  u.email,
  p.role,
  p.is_active
FROM auth.users u
LEFT JOIN user_profiles p ON p.id = u.id
WHERE u.email = 'YOUR_EMAIL_HERE';
```

**If role is NULL:** User has no profile!

**Fix - Set Yourself as Admin:**
```sql
-- Replace with your actual user ID from above query
INSERT INTO user_profiles (id, role, full_name, is_active)
VALUES (
  'YOUR-USER-ID-HERE',
  'admin',
  'Your Name',
  true
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

**Fix - Set Another User as Client:**
```sql
INSERT INTO user_profiles (id, role, full_name, is_active)
VALUES (
  'CLIENT-USER-ID-HERE',
  'client',
  'Client Name',
  true
)
ON CONFLICT (id) DO UPDATE SET role = 'client';
```

---

### Issue #3: RLS Policies Blocking Query ⚠️
**Check:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';
```

**If rowsecurity = true:** RLS might be blocking!

**Quick Fix - Disable RLS (Testing Only):**
```sql
-- ⚠️ ONLY FOR TESTING - NOT FOR PRODUCTION
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

**Proper Fix - Add RLS Policy:**
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff')
  )
);
```

---

## 🧪 Step-by-Step Diagnosis

### Step 1: Check if You're Logged In
```
1. Go to: http://localhost:3000/debug-auth
2. Look for "Session Status"
3. Should show: user_id, email, created_at
```

**If NULL:** You're not logged in! Go to `/login` first.

---

### Step 2: Check if Profile Exists
```
1. Still on debug page
2. Look for "User Profile" section
3. Should show: id, role, full_name, is_active
```

**If NULL or Error:**
- Table might not exist
- Profile might not be created
- RLS might be blocking

---

### Step 3: Check Role
```
1. Look for "Role Analysis" section
2. Should show your current role (admin/staff/client)
3. Check "Access Permissions"
```

**If role is NULL:** Profile doesn't exist
**If role is 'client':** You should be blocked from admin ✅
**If role is 'admin':** You should access admin ✅

---

### Step 4: Test Access
```
1. Click "Try Admin Portal" button
2. If you're a client: Should redirect to /login?error=unauthorized
3. If you're admin: Should show admin dashboard
```

---

## 🔧 Complete Fix Process

### Step 1: Create/Verify Table
```sql
-- In Supabase SQL Editor
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'client')),
    phone TEXT,
    avatar_url TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 2: Create Admin User
```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL';

-- Create admin profile
INSERT INTO user_profiles (id, role, full_name, is_active)
SELECT 
  id,
  'admin',
  email,
  true
FROM auth.users
WHERE email = 'YOUR_EMAIL'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Step 3: Create Client User
```sql
-- Create client profile for testing
INSERT INTO user_profiles (id, role, full_name, is_active)
SELECT 
  id,
  'client',
  email,
  true
FROM auth.users
WHERE email = 'CLIENT_EMAIL'
ON CONFLICT (id) DO UPDATE SET role = 'client';
```

### Step 4: Verify Setup
```sql
-- Check all users and roles
SELECT 
  u.id,
  u.email,
  p.role,
  p.is_active,
  p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
```

---

## 🎯 Testing Checklist

After running the fixes:

### Test as Admin:
- [ ] Login as admin user
- [ ] Go to: http://localhost:3000/debug-auth
- [ ] Verify role shows "admin"
- [ ] Click "Try Admin Portal" → Should work ✅
- [ ] Navigate to `/admin/dashboard` → Should work ✅

### Test as Client:
- [ ] Logout admin
- [ ] Login as client user
- [ ] Go to: http://localhost:3000/debug-auth
- [ ] Verify role shows "client"
- [ ] Click "Try Admin Portal" → Should redirect to login ✅
- [ ] Manually go to `/admin/dashboard` → Should redirect ✅
- [ ] Access `/client/dashboard` → Should work ✅

---

## 🚀 Quick Start Commands

### 1. Check Everything in Supabase:
```sql
-- Run these in order in Supabase SQL Editor

-- 1. List all users
SELECT id, email, created_at FROM auth.users;

-- 2. Check user_profiles table
SELECT * FROM user_profiles;

-- 3. See who has what role
SELECT 
  u.email,
  COALESCE(p.role, 'NO PROFILE') as role
FROM auth.users u
LEFT JOIN user_profiles p ON p.id = u.id;
```

### 2. Quick Admin Setup:
```sql
-- Replace YOUR_EMAIL with your actual email
INSERT INTO user_profiles (id, role, full_name, is_active)
SELECT id, 'admin', email, true
FROM auth.users
WHERE email = 'YOUR_EMAIL'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 3. Quick Client Setup (for testing):
```sql
-- Replace CLIENT_EMAIL with test client email
INSERT INTO user_profiles (id, role, full_name, is_active)
SELECT id, 'client', email, true
FROM auth.users
WHERE email = 'CLIENT_EMAIL'
ON CONFLICT (id) DO UPDATE SET role = 'client';
```

---

## 📞 Still Not Working?

If after all fixes clients can still access admin:

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - "relation 'user_profiles' does not exist"
   - "permission denied"
   - "profile is null"

### Check Network Tab:
1. Go to Network tab
2. Navigate to `/admin/dashboard`
3. Look for API calls to Supabase
4. Check if profile query succeeded

### Enable Debug Mode:
Add this to AuthGuard temporarily:
```typescript
// In AuthGuard.tsx after line 44
console.log('🔐 AUTH DEBUG:', {
  userId: session.user.id,
  profile,
  profileError,
  requiredRole,
  shouldBlock: requiredRole === 'admin' && profile?.role !== 'admin' && profile?.role !== 'staff'
});
```

---

## 📋 Common Issues & Solutions

### "relation 'user_profiles' does not exist"
**Solution:** Run `database/schema.sql` in Supabase

### "profile is null"
**Solution:** Create profile with INSERT statement above

### "permission denied for table user_profiles"
**Solution:** Disable RLS or add proper policies

### AuthGuard shows loading forever
**Solution:** Check Supabase connection in `.env.local`

### Redirects don't work
**Solution:** Clear browser cache, check router configuration

---

## ✅ Success Criteria

You know it's fixed when:
1. ✅ Admin can access `/admin/dashboard`
2. ✅ Client gets redirected from `/admin/dashboard`
3. ✅ Debug page shows correct roles
4. ✅ No console errors
5. ✅ Network tab shows successful profile fetch

---

**Need Help?** Run the debug page first: http://localhost:3000/debug-auth
