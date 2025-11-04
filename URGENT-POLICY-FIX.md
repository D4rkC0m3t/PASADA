# 🚨 URGENT: Duplicate RLS Policies Found

## Problem Identified

Your `projects` table has **9 RLS policies** when it should only have **4**.

### Current State (BROKEN):
```
✓ Allow authenticated users to read projects (authenticated)
✓ Allow authenticated users to insert projects (authenticated)
✓ Allow authenticated users to update projects (authenticated)
✓ Allow authenticated users to delete projects (authenticated)
❌ Admins can view all projects (public) ← DUPLICATE
❌ Clients can view own projects (public) ← DUPLICATE
❌ Admins can create projects (public) ← DUPLICATE
❌ Admins can update projects (public) ← DUPLICATE
❌ Admins can delete projects (public) ← DUPLICATE
```

### Why This Causes Errors:

1. **Conflicting Policies**: `public` role policies conflict with `authenticated` policies
2. **Permission Confusion**: Supabase doesn't know which policy to apply
3. **400/403 Errors**: Requests fail due to policy conflicts
4. **Update Failures**: The "Error updating project" is caused by this

---

## ✅ Quick Fix (2 Steps)

### Step 1: Run Cleanup Script

**In Supabase SQL Editor:**

```sql
-- Copy and paste from: database/CLEANUP_DUPLICATE_POLICIES.sql
```

This will:
- ✅ Drop all 9 existing policies
- ✅ Create 4 clean policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ All for `authenticated` role only
- ✅ Show before/after comparison

### Step 2: Run Main Fix

**Then run:**

```sql
-- Copy and paste from: database/FIX_ALL_ERRORS.sql
```

This will:
- ✅ Create `visitors` table
- ✅ Add missing columns to `projects`
- ✅ Ensure policies are correct

---

## 🎯 Expected Result

### After Fix:
```
✅ Allow authenticated users to read projects (authenticated)
✅ Allow authenticated users to insert projects (authenticated)
✅ Allow authenticated users to update projects (authenticated)
✅ Allow authenticated users to delete projects (authenticated)
```

**Total: 4 policies** (not 9)

---

## 🔧 Manual Fix (If Needed)

If you prefer to do it manually in Supabase Dashboard:

### 1. Go to Authentication → Policies → projects table

### 2. Delete these 5 policies:
- ❌ "Admins can view all projects"
- ❌ "Clients can view own projects"
- ❌ "Admins can create projects"
- ❌ "Admins can update projects"
- ❌ "Admins can delete projects"

### 3. Keep these 4 policies:
- ✅ "Allow authenticated users to read projects"
- ✅ "Allow authenticated users to insert projects"
- ✅ "Allow authenticated users to update projects"
- ✅ "Allow authenticated users to delete projects"

---

## 📊 Verification Query

Run this to check your policies:

```sql
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;
```

**Should return exactly 4 rows**, all with `roles = {authenticated}`

---

## 🚀 Quick Start

**Fastest way:**

1. Open Supabase SQL Editor
2. Copy content from `database/CLEANUP_DUPLICATE_POLICIES.sql`
3. Click "Run"
4. Verify you see "Total policies: 4"
5. Clear browser cache
6. Test project edit page

**Time:** ~2 minutes

---

## Why This Happened

You likely ran multiple migration scripts that created overlapping policies:
- First script created `authenticated` policies ✓
- Second script created `public` policies ✗
- Both are active, causing conflicts

**Solution:** Always drop existing policies before creating new ones.

---

## 🎯 Files to Use

| Order | File | Purpose |
|-------|------|---------|
| 1️⃣ | `database/CLEANUP_DUPLICATE_POLICIES.sql` | Remove duplicates |
| 2️⃣ | `database/FIX_ALL_ERRORS.sql` | Complete fix |

---

**Status:** 🔴 Critical - Fix immediately to restore project edit functionality
