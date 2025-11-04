# 🔐 CI/CD Credentials Status for PASADA CRM

## ✅ Available Credentials (From .env.local)

### Supabase (3/6 available)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://eoahwxdhvdfgllolzoxd.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✓
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✓
- ❌ `SUPABASE_ACCESS_TOKEN` = **MISSING** (needed for migrations)
- ❌ `SUPABASE_PROJECT_ID` = **MISSING** (Reference ID from dashboard)
- ❌ `SUPABASE_DB_PASSWORD` = **MISSING** (your database password)

### Application URLs (1/2 available)
- ✅ `NEXT_PUBLIC_APP_URL` = `http://localhost:3000` (needs production URL)
- ❌ `PRODUCTION_URL` = **MISSING** (will be Vercel URL)

### Email Service (1/1 available)
- ✅ `RESEND_API_KEY` = `re_edwN8HuA_MG62hopnQVTMKgpdMJZ9Dwfk` ✓
- ✅ `EMAIL_FROM` = `noreply@pasada.in` ✓

### Vercel (0/3 available)
- ❌ `VERCEL_TOKEN` = **MISSING**
- ❌ `VERCEL_ORG_ID` = **MISSING**
- ❌ `VERCEL_PROJECT_ID` = **MISSING**

---

## 📝 What You Need To Get

### 1. Supabase Missing Credentials (5 minutes)

#### Get SUPABASE_PROJECT_ID:
1. Go to: https://supabase.com/dashboard/project/eoahwxdhvdfgllolzoxd/settings/general
2. Find "Reference ID" 
3. Copy it (format: `eoahwxdhvdfgllolzoxd`)

#### Get SUPABASE_ACCESS_TOKEN:
1. Go to: https://supabase.com/account/tokens
2. Click "Generate new token"
3. Name it: "PASADA CI/CD"
4. Copy the token

#### Get SUPABASE_DB_PASSWORD:
- This is the password you set when creating your Supabase project
- If you forgot it, you can reset it in: Project Settings → Database → Reset password

---

### 2. Vercel Setup (10 minutes)

#### Option A: Create New Vercel Project
```bash
# Login to Vercel
vercel login

# Link/create project
cd d:/Projects/Pasada/CRM/Pasada
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? pasada-crm
# - Directory? ./
# - Override settings? No
```

#### Option B: Manual Setup
1. Go to: https://vercel.com/new
2. Import Git Repository
3. Select: `D4rkC0m3t/PASADA`
4. Root Directory: `Pasada`
5. Click "Deploy"

#### Get Vercel Credentials:

**VERCEL_TOKEN:**
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "PASADA CI/CD"
4. Scope: Full Account
5. Copy the token

**VERCEL_ORG_ID:**
1. Go to: https://vercel.com/account
2. Look for "Team ID" or "User ID" in Settings → General
3. Copy it

**VERCEL_PROJECT_ID:**
1. Go to your project: https://vercel.com/dashboard
2. Click on "pasada-crm" project
3. Go to Settings → General
4. Copy "Project ID"

---

## 🎯 Quick Setup Commands

### Step 1: Get Supabase Project ID
```bash
# It's in your URL: eoahwxdhvdfgllolzoxd
SUPABASE_PROJECT_ID=eoahwxdhvdfgllolzoxd
```

### Step 2: Login to Vercel and Deploy
```bash
vercel login
vercel --prod
```

This will:
- Create/link your Vercel project
- Deploy your application
- Give you the production URL

### Step 3: Get All Vercel IDs
After deployment, run:
```bash
vercel project ls
```

---

## 📋 Complete GitHub Secrets List

Once you have all credentials, add these to GitHub:

### Go to: https://github.com/D4rkC0m3t/PASADA/settings/secrets/actions

### Add These Secrets:

```bash
# Vercel (3 secrets)
VERCEL_TOKEN=<from Vercel account tokens>
VERCEL_ORG_ID=<from Vercel account settings>
VERCEL_PROJECT_ID=<from Vercel project settings>

# Supabase (6 secrets)
NEXT_PUBLIC_SUPABASE_URL=https://eoahwxdhvdfgllolzoxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWh3eGRodmRmZ2xsb2x6b3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQyNDMsImV4cCI6MjA3NDk5MDI0M30.atCkyoT05NXX_3_sT7LGYYwFdjCoD38wGtP_hE7GZT4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWh3eGRodmRmZ2xsb2x6b3hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQxNDI0MywiZXhwIjoyMDc0OTkwMjQzfQ.Hsqye61t5Vn9hBCq21vg1jbVlLP0biITbmNQUnAasw8
SUPABASE_ACCESS_TOKEN=<from Supabase account tokens>
SUPABASE_PROJECT_ID=eoahwxdhvdfgllolzoxd
SUPABASE_DB_PASSWORD=<your database password>

# Application (2 secrets)
NEXT_PUBLIC_APP_URL=<your Vercel production URL>
PRODUCTION_URL=<same as above>

# Email (2 secrets - optional)
RESEND_API_KEY=re_edwN8HuA_MG62hopnQVTMKgpdMJZ9Dwfk
EMAIL_FROM=noreply@pasada.in
```

---

## 🚀 Next Steps

### 1. Get Missing Supabase Credentials (5 min)
- [ ] Get SUPABASE_ACCESS_TOKEN from https://supabase.com/account/tokens
- [ ] Confirm SUPABASE_PROJECT_ID = `eoahwxdhvdfgllolzoxd`
- [ ] Find/reset SUPABASE_DB_PASSWORD

### 2. Setup Vercel (10 min)
- [ ] Run `vercel login`
- [ ] Run `vercel --prod` to deploy
- [ ] Get VERCEL_TOKEN from https://vercel.com/account/tokens
- [ ] Get VERCEL_ORG_ID from account settings
- [ ] Get VERCEL_PROJECT_ID from project settings
- [ ] Note your production URL

### 3. Configure GitHub Secrets (5 min)
- [ ] Go to GitHub repository settings
- [ ] Add all 13 secrets listed above
- [ ] Verify no typos in secret names

### 4. Test CI/CD (5 min)
- [ ] Create test branch and PR
- [ ] Watch CI pipeline run
- [ ] Merge to main
- [ ] Watch deployment happen
- [ ] Visit production URL

---

## ✅ Summary

**You Have:**
- ✅ Supabase project fully configured
- ✅ Email service (Resend) configured
- ✅ All application settings

**You Need:**
- ❌ 3 Supabase credentials (token, project ID, password)
- ❌ 3 Vercel credentials (token, org ID, project ID)
- ❌ Production URL (from Vercel deployment)

**Total Time:** ~20 minutes to get everything

---

## 🆘 Quick Help

**Can't find Supabase Project ID?**
- It's in your URL: `eoahwxdhvdfgllolzoxd`

**Forgot Database Password?**
- Reset it in Supabase Dashboard → Settings → Database

**Vercel not working?**
- Make sure you're logged in: `vercel whoami`
- Try: `vercel logout` then `vercel login`

**Need the production URL?**
- Run `vercel --prod` and it will show you the URL
- Or check Vercel dashboard after deployment

---

**Ready to proceed? Let me know which step you want to start with!**
