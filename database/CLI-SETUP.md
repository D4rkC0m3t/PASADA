# 🚀 Run Migration via CLI

## ⚡ Quick Start

### **Option 1: PowerShell Script (Easiest)**

```powershell
# Navigate to project root
cd d:\Projects\Pasada\CRM\Pasada

# Run the migration script
.\database\run-migration-psql.ps1
```

This will:
1. ✅ Load your Supabase credentials from `.env.local`
2. ✅ Check for `psql` installation
3. ✅ Execute `FINAL_MIGRATION.sql`
4. ✅ Show success/error messages

---

### **Option 2: Direct psql Command**

If you have PostgreSQL installed:

```powershell
# Get your password from Supabase Dashboard → Settings → Database
$password = "your-database-password"
$projectRef = "eoahwxdhvdfgllolzoxd"

# Run migration
psql "postgresql://postgres:$password@db.$projectRef.supabase.co:5432/postgres" -f database\migrations\FINAL_MIGRATION.sql
```

---

### **Option 3: Supabase CLI (If Installed)**

```powershell
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref eoahwxdhvdfgllolzoxd

# Run migration
supabase db push
```

---

## 📦 Install psql (If Needed)

### **Windows:**

**Option A: Chocolatey**
```powershell
choco install postgresql
```

**Option B: Scoop**
```powershell
scoop install postgresql
```

**Option C: Official Installer**
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`

---

## 🔑 Get Your Database Password

1. Go to: https://supabase.com/dashboard/project/eoahwxdhvdfgllolzoxd
2. Click: **Settings** → **Database**
3. Scroll to: **Connection String**
4. Click: **Show password**
5. Copy the password

---

## ✅ Verify Migration

After running, check in Supabase Dashboard:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'leads', 'audit_logs');

-- Should return 3 rows
```

---

## 🎯 Complete Setup

```powershell
# 1. Run migration
.\database\run-migration-psql.ps1

# 2. Sign up through your app
# (Go to http://localhost:3000/signup)

# 3. Make yourself admin (in Supabase SQL Editor)
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

# 4. Test contact form
# (Go to /pasada.design/en/contant-us.html)
```

---

## 🔧 Troubleshooting

### "psql: command not found"
**Solution**: Install PostgreSQL (see above) or use Supabase Dashboard

### "password authentication failed"
**Solution**: Get correct password from Supabase Dashboard → Settings → Database

### "connection refused"
**Solution**: Check your internet connection and Supabase project is active

### "relation already exists"
**Solution**: Tables already created! Just set your admin role and start using it.

---

## 📁 Files

- `run-migration-psql.ps1` - Main PowerShell script
- `FINAL_MIGRATION.sql` - The SQL migration file
- `CLI-SETUP.md` - This guide

---

## 🎉 Success!

When you see:
```
✅ Migration completed successfully!
```

You're ready to:
1. ✅ Sign up
2. ✅ Set admin role
3. ✅ Use the contact form
4. ✅ View leads in dashboard

---

*Total time: 2-3 minutes* ⏱️
