# 🗄️ PASADA CRM - Database Migration Guide

**Time Required**: 5 minutes  
**Prerequisite**: Supabase project created at `https://eoahwxdhvdfgllolzoxd.supabase.co`

---

## Step 1: Open Supabase SQL Editor

1. Go to: [Supabase SQL Editor](https://app.supabase.com/project/eoahwxdhvdfgllolzoxd/sql/new)
2. You should see a blank SQL editor

---

## Step 2: Run Schema Migration

1. Open `database/schema.sql` in your code editor
2. **Copy ALL contents** (Ctrl+A, Ctrl+C)
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** button (bottom right)
5. Wait for "Success. No rows returned" message

**What this does:**
- Creates 10 tables (clients, projects, quotations, etc.)
- Sets up auto-generated quotation numbers (PASADA-2025-0001)
- Creates automatic total calculations
- Sets up audit logging triggers
- Inserts sample data (1 template + 5 materials)

**Verification Query:**
```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected: 10 tables
-- audit_logs, bookings, clients, materials, projects,
-- quote_items, quotations, templates, user_profiles, vendors
```

---

## Step 3: Apply Security Policies

1. Open `database/rls-policies.sql` in your code editor
2. **Copy ALL contents**
3. **Paste** into a NEW SQL Editor tab
4. Click **"Run"**
5. Wait for "Success" message

**What this does:**
- Enables Row Level Security on all tables
- Creates helper functions (is_admin, is_staff, is_client)
- Sets up role-based access policies
- Ensures data isolation between users

**Verification Query:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- All tables should show rowsecurity = true
```

---

## Step 4: Set Up Storage Buckets

1. Open `database/storage-setup.sql` in your code editor
2. **Copy ALL contents**
3. **Paste** into a NEW SQL Editor tab
4. Click **"Run"**
5. Wait for "Success" message

**What this does:**
- Creates 5 storage buckets:
  - `logos` (public) - Company/client logos
  - `quotations` (private) - PDF files
  - `projects` (public) - Project images
  - `materials` (public) - Material photos
  - `avatars` (public) - User avatars
- Sets up bucket policies for uploads/downloads
- Configures file size limits

**Verification:**
1. Go to [Storage](https://app.supabase.com/project/eoahwxdhvdfgllolzoxd/storage/buckets)
2. You should see 5 buckets listed

---

## Step 5: Create Your Admin User

1. Go to [Authentication → Users](https://app.supabase.com/project/eoahwxdhvdfgllolzoxd/auth/users)
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: (choose a strong password)
   - **✅ Auto Confirm User**: Check this box
4. Click **"Create user"**
5. **Copy the User UUID** from the users list

6. Go back to SQL Editor and run:
```sql
-- Insert admin user profile
INSERT INTO user_profiles (id, full_name, role, is_active)
VALUES (
  'paste-your-user-uuid-here',  -- Replace with your UUID
  'Your Name',                   -- Replace with your name
  'admin',                       -- Role: admin
  true                           -- Active
);
```

**Verification:**
```sql
-- Check your user profile exists
SELECT * FROM user_profiles WHERE role = 'admin';

-- Should return 1 row with your details
```

---

## Step 6: Final Verification

Run this comprehensive check:

```sql
-- 1. Check all tables exist
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 10

-- 2. Check RLS enabled
SELECT COUNT(*) as rls_enabled_count 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Expected: 10

-- 3. Check storage buckets
SELECT COUNT(*) as bucket_count FROM storage.buckets;
-- Expected: 5

-- 4. Check sample data
SELECT COUNT(*) as template_count FROM templates;
-- Expected: 1

SELECT COUNT(*) as material_count FROM materials;
-- Expected: 5

-- 5. Check admin user
SELECT COUNT(*) as admin_count FROM user_profiles WHERE role = 'admin';
-- Expected: 1
```

**All checks should pass! ✅**

---

## ❌ Troubleshooting

### Error: "relation already exists"
- **Solution**: Tables already created. Skip schema.sql
- **Action**: Proceed to rls-policies.sql

### Error: "permission denied"
- **Solution**: Using wrong API key
- **Action**: Make sure you're logged into Supabase dashboard

### Error: "RLS policy violation"
- **Solution**: User profile not created
- **Action**: Run Step 5 again with correct UUID

### Error: "bucket already exists"
- **Solution**: Buckets already created
- **Action**: Verify in Storage tab, skip storage-setup.sql

---

## ✅ Migration Complete Checklist

- [ ] Schema migration completed (10 tables)
- [ ] RLS policies applied (all tables secured)
- [ ] Storage buckets created (5 buckets)
- [ ] Admin user created and verified
- [ ] Sample data loaded (1 template, 5 materials)
- [ ] All verification queries passed

**Time to complete**: ~5 minutes  
**Status**: Ready for development! 🚀

---

## 🎯 What's Next?

1. **Update .env.local** - Add service role key (if not done)
2. **Restart dev server** - `npm run dev`
3. **Test authentication** - Try logging in with your admin user
4. **Build features** - Start with Client Management

Your database is now fully configured and ready for the PASADA CRM application!
