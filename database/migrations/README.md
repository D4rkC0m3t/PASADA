# Database Migrations - Security Fixes

## Overview
This directory contains SQL migrations to fix critical security issues in the PASADA CRM client dashboard.

## Migrations

### 001_add_client_id_to_user_profiles.sql
**Purpose:** Link user accounts to client records securely

**Changes:**
- Adds `client_id` column to `user_profiles` table
- Links user accounts (auth.users) to client records
- Adds `client_id` to `quotations` table for direct client access
- Adds `completion_percentage` to `projects` table
- Adds `is_active` to `clients` table
- Creates indexes for performance

**Why:** Previously, the system used email matching which was insecure and unreliable.

---

### 002_row_level_security_policies.sql
**Purpose:** Implement Row Level Security (RLS) to protect data

**Changes:**
- Enables RLS on all tables (clients, projects, quotations, bookings, user_profiles)
- Creates policies for clients to view only their own data
- Creates policies for admins/staff to manage all data
- Adds helper functions: `is_admin()`, `is_staff_or_admin()`, `get_user_client_id()`

**Security Benefits:**
- ✅ Clients can ONLY see their own projects
- ✅ Clients can ONLY see their own quotations
- ✅ Clients can ONLY see their own bookings
- ✅ Admins/staff have full access
- ✅ Database-level security (not just application-level)

---

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file
4. Run them in order (001, then 002)
5. Verify no errors in the output

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### Option 3: psql Command Line
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
\i database/migrations/001_add_client_id_to_user_profiles.sql
\i database/migrations/002_row_level_security_policies.sql
```

---

## Verification Steps

After applying migrations, verify they worked:

### 1. Check Tables
```sql
-- Verify client_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'client_id';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'quotations', 'bookings');
```

### 2. Check Policies
```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Test Client Access
```sql
-- As a client user, this should only return their projects
SELECT * FROM projects;

-- As an admin user, this should return all projects
SELECT * FROM projects;
```

---

## Security Improvements Summary

### Before (❌ Insecure):
```typescript
// Used email matching - INSECURE!
const { data: client } = await supabase
  .from('clients')
  .select('id')
  .eq('email', user.email)  // ❌ Can be spoofed
  .single()
```

### After (✅ Secure):
```typescript
// Uses proper user-client relationship
const { data: profile } = await supabase
  .from('user_profiles')
  .select('client_id, role')
  .eq('id', user.id)  // ✅ Secure - uses auth.uid()
  .single()

// RLS policies automatically filter data
const { data: projects } = await supabase
  .from('projects')
  .eq('client_id', profile.client_id)  // ✅ RLS enforces this
```

---

## Data Setup for Testing

### Create Test Client User
```sql
-- 1. Create client record
INSERT INTO clients (name, contact_name, email, phone)
VALUES ('Test Client', 'John Doe', 'client@test.com', '+91 9876543210')
RETURNING id;

-- 2. Create user profile (after user signs up via Supabase Auth)
INSERT INTO user_profiles (id, full_name, role, client_id)
VALUES (
  'USER_AUTH_ID_FROM_SUPABASE',  -- Replace with actual auth.users.id
  'John Doe',
  'client',
  'CLIENT_ID_FROM_STEP_1'  -- Replace with client.id from step 1
);
```

### Create Test Admin User
```sql
-- Create admin profile (after admin signs up)
INSERT INTO user_profiles (id, full_name, role)
VALUES (
  'ADMIN_AUTH_ID_FROM_SUPABASE',
  'Admin User',
  'admin'
);
```

---

## Rollback (If Needed)

If you need to rollback these changes:

```sql
-- Disable RLS
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
-- (repeat for all policies)

-- Remove columns
ALTER TABLE user_profiles DROP COLUMN IF EXISTS client_id;
ALTER TABLE quotations DROP COLUMN IF EXISTS client_id;
ALTER TABLE projects DROP COLUMN IF EXISTS completion_percentage;
```

---

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify your user has proper role in `user_profiles`
3. Ensure `client_id` is set for client users
4. Test RLS policies with different user roles

---

## Next Steps

After applying these migrations:
1. ✅ Test client dashboard with a test client user
2. ✅ Test admin dashboard with an admin user
3. ✅ Verify clients cannot see other clients' data
4. ✅ Update any other pages that query these tables
5. ✅ Deploy the updated client dashboard code
