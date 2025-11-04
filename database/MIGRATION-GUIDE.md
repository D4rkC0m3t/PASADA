# 🗄️ Database Migration Guide - PASADA CRM

## 📋 Overview

This guide walks you through setting up the complete database schema for the PASADA CRM contact form integration.

---

## ⚠️ Prerequisites

Before running the migration, ensure:

1. ✅ **Supabase Project Created** - You have an active Supabase project
2. ✅ **Admin Access** - You can access the Supabase SQL Editor
3. ✅ **User Profiles Table** - The `user_profiles` table exists with a `role` column

---

## 🔍 Check User Profiles Table

First, verify your `user_profiles` table exists:

```sql
-- Check if user_profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'user_profiles'
);

-- Check user_profiles structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
```

### Expected Structure:
```sql
user_profiles
├── id (UUID)
├── user_id (UUID) - References auth.users(id)
├── role (TEXT) - 'admin' or 'client'
├── full_name (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### If User Profiles Doesn't Exist:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

---

## 🚀 Run the Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Copy Migration Script

Copy the entire contents of:
```
database/migrations/20251101_create_leads_and_audit_system.sql
```

### Step 3: Execute Migration

1. Paste the script into the SQL Editor
2. Click **Run** (or press Ctrl/Cmd + Enter)
3. Wait for completion message

### Expected Output:
```
✅ Migration completed successfully!
📊 Created leads table with 38 service types support
📝 Created audit_logs table for compliance tracking
🔐 Enabled Row Level Security (RLS) on both tables
📈 Created lead_analytics view for dashboard
🎯 All indexes and triggers configured

🚀 Ready to accept lead submissions!
```

---

## ✅ Verify Migration

### Check Tables Created:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('leads', 'audit_logs', 'user_profiles');
```

### Check Leads Table Structure:

```sql
-- View leads table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;
```

### Check RLS Policies:

```sql
-- View RLS policies on leads table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'leads';
```

### Check Indexes:

```sql
-- View indexes on leads table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'leads';
```

---

## 🧪 Test the Setup

### Test 1: Insert a Lead (Public Access)

```sql
-- This should work (public can insert)
INSERT INTO leads (
  name, email, phone, 
  service_type, service_tag, service_category,
  message, priority, status, source
) VALUES (
  'Test User',
  'test@example.com',
  '7090004948',
  'Retail Interiors',
  'retail_interiors',
  '🏢 Sector-Based Services',
  'Test message',
  'high',
  'new',
  'website_contact_form'
) RETURNING id, name, service_type, created_at;
```

### Test 2: Read Leads (Admin Only)

```sql
-- This should only work if you're logged in as admin
SELECT id, name, email, service_type, priority, status, created_at
FROM leads
ORDER BY created_at DESC
LIMIT 5;
```

### Test 3: Check Audit Logs

```sql
-- View recent audit log entries
SELECT action, entity_type, details, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Test 4: Check Analytics View

```sql
-- View lead analytics
SELECT 
  service_category,
  service_type,
  total_leads,
  converted_leads,
  new_leads,
  urgent_leads
FROM lead_analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY total_leads DESC;
```

---

## 🔧 Troubleshooting

### Error: "relation user_profiles does not exist"

**Solution**: Create the `user_profiles` table first (see Prerequisites section above)

### Error: "permission denied for table leads"

**Solution**: Check RLS policies are created correctly:
```sql
-- Re-run RLS policy creation
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Recreate policies (see migration file)
```

### Error: "duplicate key value violates unique constraint"

**Solution**: Email already exists. Check for duplicates:
```sql
SELECT email, COUNT(*) 
FROM leads 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### Can't Read Leads in Dashboard

**Solution**: Verify your user has admin role:
```sql
-- Check your role
SELECT role FROM user_profiles WHERE user_id = auth.uid();

-- Update to admin if needed
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = auth.uid();
```

---

## 🎯 Create Your First Admin User

```sql
-- After signing up, set yourself as admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify
SELECT user_id, email, role, full_name 
FROM user_profiles 
WHERE role = 'admin';
```

---

## 📊 Useful Queries

### Count Leads by Status:
```sql
SELECT status, COUNT(*) as count
FROM leads
GROUP BY status
ORDER BY count DESC;
```

### Recent Urgent Leads:
```sql
SELECT name, email, service_type, message, created_at
FROM leads
WHERE priority = 'urgent'
AND status = 'new'
ORDER BY created_at DESC;
```

### Conversion Rate by Service:
```sql
SELECT 
  service_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
  ROUND(100.0 * SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM leads
GROUP BY service_type
ORDER BY total DESC;
```

### Leads by Date:
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as leads_count
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔄 Rollback (If Needed)

If you need to remove everything and start over:

```sql
-- ⚠️ WARNING: This will delete all data!

-- Drop views
DROP VIEW IF EXISTS lead_analytics;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_log_lead_update ON leads;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;

-- Drop functions
DROP FUNCTION IF EXISTS log_lead_update();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (CASCADE removes all dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Now you can re-run the migration
```

---

## 📝 Post-Migration Checklist

- [ ] ✅ Tables created (leads, audit_logs)
- [ ] ✅ RLS policies enabled
- [ ] ✅ Indexes created
- [ ] ✅ Analytics view created
- [ ] ✅ Test lead inserted successfully
- [ ] ✅ Admin user created
- [ ] ✅ Can read leads in dashboard
- [ ] ✅ Audit logs working
- [ ] ✅ API endpoint tested
- [ ] ✅ Contact form submitted successfully

---

## 🚀 Next Steps

1. **Test Contact Form**: Submit a test lead from `/pasada.design/en/contant-us.html`
2. **Check Dashboard**: Verify lead appears in admin dashboard
3. **Test Filters**: Try filtering by status, priority, service type
4. **Export CSV**: Test the CSV export functionality
5. **Monitor Audit Logs**: Check audit trail is recording actions

---

## 📞 Support

**Migration File**: `database/migrations/20251101_create_leads_and_audit_system.sql`  
**Documentation**: `CONTACT-FORM-CRM-INTEGRATION.md`  
**Sector Services**: `SECTOR-BASED-SERVICES-INTEGRATION.md`  

---

*Last Updated: 2025-11-01*  
*Version: 1.0.0*  
*Status: Production Ready*
