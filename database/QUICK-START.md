# 🚀 Quick Start - Database Setup

## ⚡ Fast Track (3 Steps)

### **Step 1: Check & Cleanup** (1 minute)

Run this in Supabase SQL Editor:

```sql
-- Check what exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('leads', 'audit_logs', 'user_profiles');
```

**If you see `leads` or `audit_logs` with errors**, clean up first:

```sql
-- Clean slate
DROP VIEW IF EXISTS lead_analytics CASCADE;
DROP TRIGGER IF EXISTS trigger_log_lead_update ON leads;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP FUNCTION IF EXISTS log_lead_update() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
```

---

### **Step 2: Run Main Migration** (2 minutes)

Copy and run the entire file:
📁 `database/migrations/20251101_create_leads_and_audit_system.sql`

**Expected Output:**
```
✅ Migration completed successfully!
📊 Created leads table with 38 service types support
📝 Created audit_logs table for compliance tracking
🔐 Enabled Row Level Security (RLS) on both tables
📈 Created lead_analytics view for dashboard
```

---

### **Step 3: Create Admin User** (30 seconds)

```sql
-- Make yourself admin (replace with your email)
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify
SELECT email, role FROM user_profiles WHERE role = 'admin';
```

---

## ✅ Test It Works

```sql
-- Test: Insert a lead
INSERT INTO leads (
  name, email, phone, 
  service_type, service_tag, service_category,
  message, priority, status
) VALUES (
  'Test User',
  'test@example.com',
  '7090004948',
  'Retail Interiors',
  'retail_interiors',
  '🏢 Sector-Based Services',
  'This is a test message',
  'high',
  'new'
) RETURNING id, name, service_type, created_at;

-- Test: Read leads (should work if you're admin)
SELECT id, name, email, service_type, priority, status, created_at
FROM leads
ORDER BY created_at DESC
LIMIT 5;

-- Test: Check analytics
SELECT service_category, total_leads, new_leads
FROM lead_analytics
LIMIT 10;
```

---

## 🎯 Done!

Your database is ready. Now:

1. ✅ Test the contact form: `/pasada.design/en/contant-us.html`
2. ✅ Check leads in dashboard
3. ✅ Verify audit logs working

---

## ⚠️ Troubleshooting

### Error: "user_profiles does not exist"

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

### Error: "permission denied"

```sql
-- Check your role
SELECT role FROM user_profiles WHERE user_id = auth.uid();

-- Set as admin
UPDATE user_profiles SET role = 'admin' WHERE user_id = auth.uid();
```

### Can't see leads in dashboard

Make sure you're logged in as admin and RLS policies are created (they're in the main migration).

---

## 📚 Full Documentation

- **Complete Guide**: `database/MIGRATION-GUIDE.md`
- **Integration Docs**: `CONTACT-FORM-CRM-INTEGRATION.md`
- **Sector Services**: `SECTOR-BASED-SERVICES-INTEGRATION.md`

---

*Total Time: ~5 minutes*  
*Difficulty: Easy*  
*Status: Production Ready* 🚀
