# 🎯 Database Setup - Correct Order

## ⚡ Run These Files in Order

### **Step 1: Create User Profiles** (Required First!)

📁 **File**: `migrations/01_create_user_profiles_first.sql`

**What it does**:
- Creates `user_profiles` table
- Sets up RLS policies
- Creates auto-signup trigger
- Adds indexes

**Run this in Supabase SQL Editor** - Copy entire file and click Run.

**Expected Output**:
```
✅ user_profiles table created successfully!
📊 Table structure: id, user_id, role, full_name, email, phone, company
🔐 Row Level Security enabled
✅ Auto-create profile trigger enabled
🚀 Next step: Run 20251101_create_leads_and_audit_system.sql
```

---

### **Step 2: Create Leads & Audit System**

📁 **File**: `migrations/20251101_create_leads_and_audit_system.sql`

**What it does**:
- Creates `leads` table
- Creates `audit_logs` table
- Sets up RLS policies (uses `user_profiles.role`)
- Creates analytics view
- Adds all indexes and triggers

**Run this in Supabase SQL Editor** - Copy entire file and click Run.

**Expected Output**:
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

### **Step 3: Create Your Admin User**

```sql
-- Sign up first through your app, then run this:
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, role, full_name 
FROM user_profiles 
WHERE role = 'admin';
```

---

### **Step 4: Test Everything**

```sql
-- Test 1: Insert a lead (public access)
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
  'Test message from setup',
  'high',
  'new'
) RETURNING id, name, service_type, created_at;

-- Test 2: Read leads (admin only - should work if you're admin)
SELECT id, name, email, service_type, priority, status, created_at
FROM leads
ORDER BY created_at DESC
LIMIT 5;

-- Test 3: Check analytics view
SELECT 
  service_category,
  service_type,
  total_leads,
  new_leads,
  urgent_leads
FROM lead_analytics
ORDER BY total_leads DESC
LIMIT 10;

-- Test 4: Check audit logs
SELECT 
  action,
  entity_type,
  details,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;
```

---

## ✅ Complete Checklist

- [ ] **Step 1**: Run `01_create_user_profiles_first.sql`
- [ ] **Step 2**: Run `20251101_create_leads_and_audit_system.sql`
- [ ] **Step 3**: Sign up through your app
- [ ] **Step 4**: Set yourself as admin
- [ ] **Step 5**: Test lead insertion
- [ ] **Step 6**: Test lead reading (as admin)
- [ ] **Step 7**: Test analytics view
- [ ] **Step 8**: Submit form from website
- [ ] **Step 9**: Verify lead appears in dashboard
- [ ] **Step 10**: Check audit logs working

---

## 🔧 If You Get Errors

### Error: "relation already exists"

**Solution**: Tables partially created. Clean up first:

```sql
-- Clean up everything
DROP VIEW IF EXISTS lead_analytics CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_log_lead_update ON leads;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS log_lead_update() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Now start from Step 1 again
```

### Error: "permission denied"

**Solution**: Check you're logged in and have correct role:

```sql
-- Check current user
SELECT auth.uid();

-- Check your role
SELECT role FROM user_profiles WHERE user_id = auth.uid();

-- Set as admin if needed
UPDATE user_profiles SET role = 'admin' WHERE user_id = auth.uid();
```

### Error: "user_profiles.user_id does not exist"

**Solution**: You skipped Step 1! Run `01_create_user_profiles_first.sql` first.

---

## 📊 What Gets Created

### Tables:
1. **user_profiles** - User accounts with roles
2. **leads** - Contact form submissions
3. **audit_logs** - Audit trail for compliance

### Views:
1. **lead_analytics** - Analytics dashboard data

### Functions:
1. **update_updated_at_column()** - Auto-update timestamps
2. **log_lead_update()** - Log changes to leads
3. **handle_new_user()** - Auto-create profile on signup

### Triggers:
1. **on_auth_user_created** - Auto-create profile
2. **update_user_profiles_updated_at** - Update timestamp
3. **update_leads_updated_at** - Update timestamp

### Indexes:
- 8 indexes on `leads` table
- 4 indexes on `audit_logs` table
- 3 indexes on `user_profiles` table

### RLS Policies:
- 4 policies on `leads` table
- 2 policies on `audit_logs` table
- 3 policies on `user_profiles` table

---

## 🎉 Success Indicators

You'll know it worked when:

1. ✅ No errors in SQL Editor
2. ✅ Success messages appear
3. ✅ Test queries return data
4. ✅ You can insert a lead
5. ✅ You can read leads as admin
6. ✅ Contact form submissions work
7. ✅ Leads appear in dashboard
8. ✅ Audit logs are created

---

## 📞 Quick Reference

**Migration Files** (run in order):
1. `01_create_user_profiles_first.sql` ← **START HERE**
2. `20251101_create_leads_and_audit_system.sql`

**Documentation**:
- `QUICK-START.md` - Fast setup guide
- `MIGRATION-GUIDE.md` - Detailed guide
- `CONTACT-FORM-CRM-INTEGRATION.md` - Full integration docs

**Total Time**: ~5 minutes  
**Difficulty**: Easy  
**Status**: Production Ready 🚀

---

*Last Updated: 2025-11-01*  
*Version: 1.0.0*
