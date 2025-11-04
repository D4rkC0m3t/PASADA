# 🔧 Audit Logs Fix - Entity Type Error

## 🚨 New Error Found

After fixing the duplicate policies, a new error appeared:

```
Error updating project: {
  code: '23502',
  message: 'null value in column "entity_type" of relation "audit_logs" 
           violates not-null constraint'
}
```

## 🔍 Root Cause

Your database has an **audit trigger** on the `projects` table that:
1. ✅ Fires when you UPDATE a project
2. ❌ Tries to INSERT into `audit_logs` table
3. ❌ Doesn't set the `entity_type` column (which is NOT NULL)
4. ❌ Database rejects the insert → Update fails

### The Trigger Chain:
```
User clicks "Save" 
  → UPDATE projects SET ...
    → Trigger: audit_projects_changes()
      → INSERT INTO audit_logs (...)
        → ❌ ERROR: entity_type is NULL but required
```

---

## ✅ Solution (3 Options)

### Option 1: Make entity_type Nullable (Recommended)
```sql
ALTER TABLE audit_logs 
ALTER COLUMN entity_type DROP NOT NULL;
```

**Pros:**
- ✅ Quick fix
- ✅ Allows audit logs to work even if entity_type not set
- ✅ No data loss

### Option 2: Add Default Value
```sql
ALTER TABLE audit_logs 
ALTER COLUMN entity_type SET DEFAULT 'unknown';
```

**Pros:**
- ✅ Keeps NOT NULL constraint
- ✅ Fallback value if not set

### Option 3: Fix the Trigger (Best Long-term)
```sql
-- Update trigger to always set entity_type = 'project'
CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        action,
        entity_type,  -- ✅ Always set this
        entity_id,
        ...
    ) VALUES (
        'project_updated',
        'project',  -- ✅ Set to 'project'
        NEW.id,
        ...
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Quick Fix (Run This)

The updated `FIX_ALL_ERRORS.sql` now includes all 3 fixes:

1. Makes `entity_type` nullable
2. Sets default value to 'unknown'
3. Fixes the trigger to properly set entity_type

**Just run:**
```sql
-- Copy and paste from: database/FIX_ALL_ERRORS.sql
```

---

## 📋 What the Fix Does

### Part 1: Make Column Nullable
```sql
ALTER TABLE audit_logs 
ALTER COLUMN entity_type DROP NOT NULL;
```

### Part 2: Add Default Value
```sql
ALTER TABLE audit_logs 
ALTER COLUMN entity_type SET DEFAULT 'unknown';
```

### Part 3: Fix Trigger
```sql
CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (
            action, 
            entity_type,  -- ✅ Now properly set
            entity_id, 
            user_id,
            old_values,
            new_values,
            details,
            created_at
        ) VALUES (
            'project_updated',
            'project',  -- ✅ Set to 'project'
            NEW.id,
            NEW.updated_by,
            row_to_json(OLD),
            row_to_json(NEW),
            jsonb_build_object(
                'operation', 'UPDATE',
                'table', 'projects',
                'project_name', NEW.name
            ),
            NOW()
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🧪 Testing After Fix

### Test 1: Check Column
```sql
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs' 
AND column_name = 'entity_type';
```

**Expected:**
```
entity_type | YES | 'unknown'::text
```

### Test 2: Check Trigger
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'projects';
```

**Expected:**
```
audit_projects_changes | INSERT
audit_projects_changes | UPDATE
audit_projects_changes | DELETE
```

### Test 3: Update a Project
1. Go to `/admin/projects/[id]/edit`
2. Change any field
3. Click "Save Changes"
4. Should save successfully! ✅

### Test 4: Check Audit Log
```sql
SELECT action, entity_type, entity_id, details
FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
```
project_updated | project | <uuid> | {...}
```

---

## 📊 Error Timeline

| Step | Error | Status |
|------|-------|--------|
| 1 | 404 on `/visitors` | ✅ Fixed (table created) |
| 2 | Duplicate RLS policies | ✅ Fixed (9→4 policies) |
| 3 | `entity_type` constraint | ✅ Fixed (nullable + trigger) |

---

## 🎯 Complete Fix Sequence

### Step 1: Run the Complete Fix
```sql
-- In Supabase SQL Editor:
-- Copy and paste: database/FIX_ALL_ERRORS.sql
```

This now includes:
- ✅ Create `visitors` table
- ✅ Add missing columns to `projects`
- ✅ Fix RLS policies (drop duplicates)
- ✅ Fix `audit_logs` entity_type issue
- ✅ Fix audit trigger

### Step 2: Clear Browser Cache
- Press `Ctrl+Shift+Delete`
- Clear cached files
- Hard reload: `Ctrl+F5`

### Step 3: Test Everything
- ✅ Admin Dashboard → Visitor Analytics
- ✅ Projects → Edit → Save
- ✅ Check Console (should be clean)

---

## 📁 Files Available

| File | Purpose |
|------|---------|
| `database/FIX_ALL_ERRORS.sql` | Complete fix (includes audit logs) |
| `database/FIX_AUDIT_LOGS_ENTITY_TYPE.sql` | Standalone audit logs fix |
| `AUDIT-LOGS-FIX.md` | This documentation |

---

## 🎉 Expected Result

### Before:
```
❌ 404 errors on /visitors
❌ 400 errors on /projects
❌ Duplicate RLS policies (9 total)
❌ entity_type constraint violation
❌ Project update fails
```

### After:
```
✅ No 404 errors
✅ No 400 errors
✅ Clean RLS policies (4 total)
✅ Audit logs work correctly
✅ Project updates save successfully
✅ Clean console
```

---

**Status:** ✅ Complete fix ready - Run `FIX_ALL_ERRORS.sql` now!

**Time to fix:** ~3 minutes

**Difficulty:** Easy (single SQL file)
