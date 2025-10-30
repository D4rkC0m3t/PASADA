# 🚀 PASADA CRM - Supabase Setup Guide

**Complete step-by-step guide to set up your Supabase backend**

---

## 📋 Prerequisites

- [ ] A Supabase account (sign up at [supabase.com](https://supabase.com))
- [ ] Basic knowledge of SQL
- [ ] Access to Supabase SQL Editor

---

## 🎯 Phase 1: Create Supabase Project

### Step 1: Create New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `pasada-crm`
   - **Database Password**: Generate a strong password (save this securely!)
   - **Region**: Choose closest to your users (e.g., `ap-south-1` for India)
   - **Pricing Plan**: Start with Free tier
4. Click **"Create new project"**
5. Wait 2-3 minutes for project provisioning

### Step 2: Save Project Credentials

Navigate to **Project Settings** → **API** and save:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (⚠️ Keep secret!)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

---

## 🗄️ Phase 2: Database Setup

### Step 1: Create Database Schema

1. Open **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy contents from `database/schema.sql`
4. Click **"Run"** to execute
5. Verify tables created in **Table Editor**

**Expected Tables:**
- ✅ clients
- ✅ projects
- ✅ quotations
- ✅ quote_items
- ✅ materials
- ✅ vendors
- ✅ templates
- ✅ bookings
- ✅ audit_logs
- ✅ user_profiles

### Step 2: Set Up Row Level Security (RLS)

1. Open new SQL Editor query
2. Copy contents from `database/rls-policies.sql`
3. Click **"Run"** to execute
4. Verify RLS enabled in **Table Editor** → Select table → **Policies** tab

**Verify RLS Policies:**
- Each table should show "RLS enabled"
- Multiple policies should be listed for each table
- Test policies by checking **Authentication** section

### Step 3: Set Up Storage Buckets

1. Open new SQL Editor query
2. Copy contents from `database/storage-setup.sql`
3. Click **"Run"** to execute
4. Navigate to **Storage** in sidebar
5. Verify buckets created:
   - ✅ logos (public)
   - ✅ quotations (private)
   - ✅ projects (public)
   - ✅ materials (public)
   - ✅ avatars (public)

---

## 🔐 Phase 3: Authentication Setup

### Step 1: Configure Email Authentication

1. Navigate to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email settings:
   - **Enable email confirmations**: ON
   - **Enable email change confirmations**: ON
   - **Secure email change**: ON

### Step 2: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize templates:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**
   - **Change email**

**Example Confirm Signup Template:**
```html
<h2>Welcome to PASADA CRM!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

### Step 3: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback` (when deploying)

### Step 4: Create User Roles

Run this SQL to create your first admin user:

```sql
-- After user signs up, upgrade them to admin
UPDATE user_profiles
SET role = 'admin', full_name = 'Your Name'
WHERE id = 'user-uuid-here';
```

---

## 📊 Phase 4: Verify Setup

### Database Verification Checklist

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check sample data
SELECT * FROM templates;
SELECT * FROM materials LIMIT 5;

-- Test user_profiles
SELECT id, role, full_name FROM user_profiles;
```

### Expected Results:
- ✅ 10 tables in public schema
- ✅ All tables have RLS enabled
- ✅ 5 storage buckets created
- ✅ 1 default template exists
- ✅ 5 sample materials exist

---

## 🔧 Phase 5: Environment Configuration

### Step 1: Create Environment File

Create `.env.local` in your Next.js project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Email (for PDF sending)
RESEND_API_KEY=your-resend-key-here

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 2: Add to .gitignore

```bash
# Environment variables
.env.local
.env*.local

# Supabase
.supabase/
```

---

## 🧪 Phase 6: Test Database

### Create Test Client

```sql
INSERT INTO clients (name, contact_name, email, phone, city, type)
VALUES (
    'Test Client Ltd',
    'John Doe',
    'john@testclient.com',
    '+91 98765 43210',
    'Mumbai',
    'commercial'
);
```

### Create Test Project

```sql
INSERT INTO projects (
    client_id,
    name,
    site_location,
    type,
    area_sqft,
    status,
    budget
)
SELECT 
    id,
    'Modern Office Interior',
    'Bandra, Mumbai',
    'office',
    2500.00,
    'planning',
    1500000.00
FROM clients
WHERE email = 'john@testclient.com'
LIMIT 1;
```

### Create Test Quotation

```sql
-- Insert quotation
INSERT INTO quotations (
    project_id,
    title,
    tax_percent,
    valid_until
)
SELECT 
    id,
    'Office Interior - Phase 1',
    18.00,
    CURRENT_DATE + INTERVAL '30 days'
FROM projects
WHERE name = 'Modern Office Interior'
LIMIT 1;

-- Add quote items
INSERT INTO quote_items (
    quotation_id,
    item_number,
    category,
    description,
    quantity,
    unit,
    unit_price,
    tax_percent
)
SELECT 
    q.id,
    1,
    'Furniture',
    'Executive Office Desk',
    5,
    'pcs',
    25000.00,
    18.00
FROM quotations q
WHERE q.title = 'Office Interior - Phase 1'
LIMIT 1;

-- Verify totals calculated
SELECT 
    quotation_number,
    title,
    subtotal,
    tax_amount,
    total_amount,
    status
FROM quotations
WHERE title = 'Office Interior - Phase 1';
```

---

## 📈 Phase 7: Monitoring & Backup

### Enable Point-in-Time Recovery

1. Navigate to **Database** → **Backups**
2. Enable **Point-in-Time Recovery** (PITR)
3. Verify daily backups are scheduled

### Set Up Alerts

1. Go to **Project Settings** → **Alerts**
2. Configure alerts for:
   - Database CPU usage > 80%
   - Storage > 80%
   - API errors > 100/hour

### Monitor Database

```sql
-- Check database size
SELECT 
    pg_size_pretty(pg_database_size('postgres')) as db_size;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check recent activity
SELECT * FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Issue: RLS Policies Not Working

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'clients';

-- Re-enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Check policies exist
SELECT * FROM pg_policies WHERE tablename = 'clients';
```

### Issue: Functions Not Found

**Solution:**
```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Re-run schema.sql if needed
```

### Issue: Storage Upload Fails

**Solution:**
1. Check bucket exists in Storage section
2. Verify storage policies in SQL:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'quotations';
```
3. Re-run storage-setup.sql if needed

---

## ✅ Setup Complete Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] RLS policies applied
- [ ] Storage buckets created
- [ ] Authentication configured
- [ ] Email templates customized
- [ ] Environment variables set
- [ ] Test data created
- [ ] Backups enabled
- [ ] Monitoring configured

---

## 🔗 Next Steps

1. **Frontend Setup**: Initialize Next.js project
2. **Supabase Client**: Configure @supabase/supabase-js
3. **Authentication**: Implement login/signup
4. **Dashboard**: Build client/admin dashboards
5. **PDF Generation**: Set up quotation PDF generation

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/functions.html)

---

## 🆘 Support

If you encounter issues:
1. Check Supabase Dashboard → Logs
2. Review SQL query errors in SQL Editor
3. Join [Supabase Discord](https://discord.supabase.com)
4. Check [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

**Setup Version**: 1.0  
**Last Updated**: 2025-10-27  
**Estimated Setup Time**: 30-45 minutes
