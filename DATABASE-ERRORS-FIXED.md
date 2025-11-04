# Database Errors - Root Cause Analysis & Fix

## 🔍 Root Cause Analysis

### Error 1: **404 on `/rest/v1/visitors` table**

**Console Errors:**
```
eoahwxdhvdfgllolzoxd.supabase.co/rest/v1/visitors?select=*&visited_at=gte.2025-10-04...
Failed to load resource: the server responded with a status of 404
```

**Root Cause:**
- The `visitors` table **does not exist** in your Supabase database
- The `VisitorAnalytics.tsx` component (lines 31-88) is trying to query this non-existent table
- Multiple queries are failing:
  - Total visits count
  - Unique visitors by session_id
  - Average duration
  - Top pages
  - Top referrers

**Why it's happening:**
The visitor analytics feature was added to the code, but the database migration was never run to create the table.

---

### Error 2: **400 on `/rest/v1/projects?id=eq.44e34b52...`**

**Console Error:**
```
eoahwxdhvdfgllolzoxd.supabase.co/rest/v1/projects?id=eq.44e34b52-1101-410c-b3c9-bbbbd512e015
Failed to load resource: the server responded with a status of 400
```

**Root Cause:**
- The query URL format is incorrect
- Supabase REST API expects filters in a specific format
- The query should use `.eq('id', projectId)` in the client library
- OR the URL should be: `/rest/v1/projects?id=eq.44e34b52...` (without the extra parameter formatting)

**Likely cause:**
This might be coming from a direct fetch/axios call instead of using the Supabase client library properly.

---

### Error 3: **"Error updating project" in Edit Page**

**Console Error:**
```
hook.js:608 Error updating project: Object
```

**Root Cause (Multiple Issues):**

#### Issue 3a: Missing Database Columns
The edit page (lines 119-135 in `app/admin/projects/[id]/edit/page.tsx`) tries to update these fields:
- `timeline_days` ❌ Missing in database
- `area_sqft` ❌ May be missing
- `budget` ❌ May be missing
- `site_location` ❌ May be missing
- `notes` ❌ May be missing
- `updated_by` ❌ Missing in database
- `updated_at` ❌ May be missing

#### Issue 3b: RLS Policy Issues
- Row Level Security (RLS) policies might be blocking the UPDATE operation
- The policy might not allow authenticated users to update projects
- Or the policy might have incorrect conditions

#### Issue 3c: Data Type Mismatches
- `area_sqft` is being sent as string but database expects NUMERIC
- `budget` is being sent as string but database expects NUMERIC
- `timeline_days` is being sent as string but database expects INTEGER

---

## ✅ Complete Fix Solution

### Step 1: Run the SQL Migration

Execute the file: `database/FIX_ALL_ERRORS.sql` in your Supabase SQL Editor

This will:
1. ✅ Create the `visitors` table with all required columns
2. ✅ Add missing columns to `projects` table
3. ✅ Create proper RLS policies for both tables
4. ✅ Create indexes for performance

### Step 2: Verify the Fix

After running the SQL, verify:

```sql
-- Check visitors table exists
SELECT COUNT(*) FROM visitors;

-- Check projects table has all columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'projects';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('visitors', 'projects');
```

### Step 3: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete → Clear cache

---

## 📊 What Each Fix Does

### Fix 1: Visitors Table
```sql
CREATE TABLE visitors (
    id UUID PRIMARY KEY,
    session_id TEXT,
    page_url TEXT NOT NULL,
    page_name TEXT,
    referrer TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER,
    ...
);
```

**RLS Policies:**
- Anonymous users can INSERT (for tracking)
- Authenticated users can SELECT (for analytics)

### Fix 2: Projects Table Columns
```sql
ALTER TABLE projects ADD COLUMN timeline_days INTEGER;
ALTER TABLE projects ADD COLUMN area_sqft NUMERIC(10,2);
ALTER TABLE projects ADD COLUMN budget NUMERIC(12,2);
ALTER TABLE projects ADD COLUMN site_location TEXT;
ALTER TABLE projects ADD COLUMN notes TEXT;
ALTER TABLE projects ADD COLUMN updated_by UUID;
ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ;
```

### Fix 3: Projects RLS Policies
```sql
-- Allow authenticated users to UPDATE
CREATE POLICY "Allow authenticated users to update projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

---

## 🧪 Testing After Fix

### Test 1: Visitor Analytics
1. Navigate to Admin Dashboard
2. Check if "Visitor Analytics" widget loads without errors
3. Verify stats are displayed (may be 0 if no visitors yet)

### Test 2: Project Edit
1. Go to `/admin/projects/[id]/edit`
2. Make changes to any field
3. Click "Save Changes"
4. Should see success message and redirect

### Test 3: Console Errors
1. Open DevTools Console (F12)
2. Navigate through the app
3. Should see NO 404 or 400 errors

---

## 🔧 Code Changes Needed (Optional)

### Optional Fix: Better Error Handling in VisitorAnalytics.tsx

Add error handling to gracefully handle missing table:

```typescript
// In VisitorAnalytics.tsx, line 97
} catch (error: any) {
  console.error('Error fetching visitor stats:', error);
  
  // Check if it's a table not found error
  if (error?.message?.includes('relation "visitors" does not exist')) {
    console.warn('Visitors table not found. Please run database migration.');
  }
  
  setStats({
    totalVisits: 0,
    uniqueVisitors: 0,
    avgDuration: 0,
    topPages: [],
    topReferrers: []
  });
}
```

### Optional Fix: Better Error Messages in Edit Page

```typescript
// In edit page, line 140
} catch (error: any) {
  console.error('Error updating project:', error);
  
  // Show specific error message
  const errorMessage = error?.message || 'Unknown error';
  alert(`Failed to update project: ${errorMessage}`);
}
```

---

## 📝 Prevention for Future

### 1. Always Run Migrations
When adding new features that require database changes:
1. Create migration SQL file
2. Document in README
3. Run migration before deploying code

### 2. Use Database Migrations Folder
Store all migrations in `database/migrations/` with timestamps:
```
database/migrations/
  20251103_create_visitors_table.sql
  20251103_add_project_columns.sql
```

### 3. Add Migration Checklist
Before deploying:
- [ ] Database migrations created
- [ ] Migrations tested locally
- [ ] Migrations run on production
- [ ] RLS policies configured
- [ ] Indexes created

---

## 🎯 Summary

**Root Causes:**
1. ❌ `visitors` table doesn't exist → 404 errors
2. ❌ `projects` table missing columns → Update fails
3. ❌ RLS policies not configured → Permission denied

**Solution:**
1. ✅ Run `FIX_ALL_ERRORS.sql` in Supabase
2. ✅ Clear browser cache
3. ✅ Test all features

**Result:**
- ✅ No more 404 errors on visitors endpoint
- ✅ Project edit page works correctly
- ✅ Analytics dashboard displays data
- ✅ All database operations succeed

---

## 🚀 Next Steps

1. **Immediate:** Run the SQL migration file
2. **Short-term:** Add error boundaries to components
3. **Long-term:** Implement proper migration system with version tracking

---

**Status:** ✅ Ready to fix - Run the SQL file now!
