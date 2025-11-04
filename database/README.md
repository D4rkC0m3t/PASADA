# 🚀 Database Setup - Simple & Working

## ⚡ One File, One Click

### **Step 1: Copy the SQL File**

📁 Open: `database/migrations/FINAL_MIGRATION.sql`

This file contains EVERYTHING you need.

---

### **Step 2: Run in Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Select your project: **eoahwxdhvdfgllolzoxd**
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Copy the ENTIRE `FINAL_MIGRATION.sql` file
6. Paste it
7. Click: **RUN** (or Ctrl+Enter)

**That's it!** ✅

---

### **Step 3: Make Yourself Admin**

After signing up through your app, run this in SQL Editor:

```sql
-- Replace with your email
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify
SELECT email, role FROM public.user_profiles WHERE role = 'admin';
```

---

## ✅ What Gets Created

- ✅ `user_profiles` table (with proper foreign key to auth.users)
- ✅ `leads` table (38 service types support)
- ✅ `audit_logs` table (compliance tracking)
- ✅ `lead_analytics` view (dashboard analytics)
- ✅ All indexes (15 total)
- ✅ All RLS policies (10 total)
- ✅ All triggers (2 total)
- ✅ All permissions

---

## 🧪 Test It

```sql
-- Test 1: Insert a lead (should work)
INSERT INTO public.leads (
  name, email, phone, service_type, message
) VALUES (
  'Test User', 'test@test.com', '7090004948', 
  'Retail Interiors', 'Test message'
) RETURNING *;

-- Test 2: Read leads (should work if you're admin)
SELECT * FROM public.leads ORDER BY created_at DESC LIMIT 5;

-- Test 3: Check analytics
SELECT * FROM public.lead_analytics LIMIT 10;
```

---

## 🎯 Why This Works

1. **Uses `public.` schema** - Explicit schema reference
2. **Proper foreign keys** - Correct syntax for auth.users reference
3. **No user_id column errors** - Foreign key constraint handles it
4. **All in one file** - No dependencies, no order issues
5. **Idempotent** - Safe to run multiple times (uses IF NOT EXISTS)

---

## 📞 Your Supabase Details

**Project**: eoahwxdhvdfgllolzoxd  
**URL**: https://eoahwxdhvdfgllolzoxd.supabase.co  
**Dashboard**: https://supabase.com/dashboard/project/eoahwxdhvdfgllolzoxd

---

## 🔧 If You Get Errors

### "relation already exists"
**Solution**: The tables are already there! Just update your admin role and start using it.

### "permission denied"
**Solution**: Make sure you're using the SQL Editor in Supabase Dashboard, not a local client.

### "column does not exist"
**Solution**: This migration fixes that! It uses proper foreign key constraints instead of column references.

---

## 🎉 Done!

After running `FINAL_MIGRATION.sql`:

1. ✅ Sign up through your app
2. ✅ Set yourself as admin (SQL above)
3. ✅ Submit a test lead from contact form
4. ✅ Check it appears in dashboard

**Total time: 2 minutes** ⏱️

---

*This is the correct, working approach using Supabase's native features.*
