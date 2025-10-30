# 🚀 PASADA CRM - Quick Start Guide

Your Supabase project is already created! Follow these steps to complete the setup.

---

## ✅ Step 1: Get Your Supabase API Keys

1. Go to your Supabase Dashboard: [https://app.supabase.com/project/eoahwxdhvdfgllolzoxd](https://app.supabase.com/project/eoahwxdhvdfgllolzoxd)

2. Navigate to **Settings** (gear icon) → **API**

3. Copy these two keys:

   **Public anon key** (safe to use in browser):
   ```
   Look for: anon public
   ```

   **Service role key** (⚠️ NEVER expose in browser - server-side only):
   ```
   Look for: service_role
   ```

4. Update your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste here)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste here)
   ```

---

## ✅ Step 2: Set Up Database Tables

1. Open Supabase Dashboard → **SQL Editor**

2. Create a new query

3. **Copy and run** `database/schema.sql` (click **Run**)
   - This creates all 10 tables
   - Sets up auto-calculations
   - Adds sample data

4. **Copy and run** `database/rls-policies.sql` (click **Run**)
   - Enables Row Level Security
   - Creates role-based policies

5. **Copy and run** `database/storage-setup.sql` (click **Run**)
   - Creates 5 storage buckets
   - Sets up storage policies

---

## ✅ Step 3: Verify Database Setup

Run this verification query in SQL Editor:

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
```

**Expected Results:**
- ✅ 10 tables created
- ✅ RLS enabled on all tables
- ✅ 5 storage buckets
- ✅ 1 template + 5 materials

---

## ✅ Step 4: Configure Authentication

1. Go to **Authentication** → **Providers** → **Email**
   - Enable Email provider
   - Enable email confirmations

2. Go to **Authentication** → **URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: Add `http://localhost:3000/auth/callback`

---

## ✅ Step 5: Install Dependencies

```bash
cd d:/Projects/Pasada/CRM/Pasada
npm install
```

This will install:
- Next.js 14
- Supabase client
- React Hook Form
- Tailwind CSS
- Lucide icons
- All dependencies from package.json

---

## ✅ Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Step 7: Create Your First Admin User

1. Go to **Authentication** → **Users** in Supabase Dashboard

2. Click **Add User** → **Create new user**
   - Email: your-email@example.com
   - Password: (choose a strong password)
   - Auto Confirm User: ✅ (check this)

3. Copy the User ID (UUID)

4. Run this SQL query to make them admin:
   ```sql
   -- Insert user profile with admin role
   INSERT INTO user_profiles (id, full_name, role, is_active)
   VALUES (
     'paste-user-uuid-here',
     'Your Name',
     'admin',
     true
   );
   ```

---

## 🎯 You're Ready!

Your PASADA CRM is now configured:
- ✅ Supabase project connected
- ✅ Database tables created
- ✅ Security policies active
- ✅ Storage buckets ready
- ✅ Authentication enabled
- ✅ Admin user created

### Next Steps:
1. Login at `http://localhost:3000`
2. Explore the admin dashboard
3. Create your first client
4. Build a quotation
5. Generate a PDF

---

## 🔍 Common Issues

### "Invalid API key"
- Double-check you copied the full anon key
- Make sure there are no extra spaces
- Restart the dev server (`Ctrl+C` then `npm run dev`)

### "relation does not exist"
- Run the schema.sql file in SQL Editor
- Verify tables exist with the verification query

### "RLS policy violation"
- Make sure you created a user_profile for your admin user
- Check the role is set to 'admin'
- Verify RLS policies are applied

---

## 📞 Need Help?

1. Check `SUPABASE-SETUP-GUIDE.md` for detailed setup
2. Review `IMPLEMENTATION-TODO.md` for full feature list
3. Check Supabase logs in Dashboard → Logs

---

**Happy Building! 🚀**
