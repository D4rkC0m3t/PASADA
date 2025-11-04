# ⚡ Quick CI/CD Setup Guide - PASADA CRM

**Time Required:** 25 minutes  
**Current Status:** Infrastructure ready, needs configuration

---

## 🎯 What You Have

✅ **Git Repository:** All code committed and pushed  
✅ **CI Workflows:** 4 workflows configured  
✅ **Documentation:** Complete guides available  
✅ **Environment File:** `.env.local` with all variables

---

## 🚀 What You Need to Do

### 1️⃣ Get Supabase Credentials (5 minutes)

You already have most of these in `.env.local`:

**From Supabase Dashboard → Project Settings → API:**
```
NEXT_PUBLIC_SUPABASE_URL=https://eoahwxdhvdfgllolzoxd.supabase.co ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
```

**Still Need:**
- `SUPABASE_PROJECT_ID` = `eoahwxdhvdfgllolzoxd` (from URL)
- `SUPABASE_ACCESS_TOKEN` = Get from https://supabase.com/account/tokens
- `SUPABASE_DB_PASSWORD` = Your database password

---

### 2️⃣ Deploy to Vercel (10 minutes)

```bash
# Login to Vercel
npx vercel login

# Deploy to production
npx vercel --prod
```

**After deployment, note:**
- Production URL (e.g., https://pasada-crm.vercel.app)
- VERCEL_PROJECT_ID (from project settings)
- VERCEL_ORG_ID (from account settings)

**Get VERCEL_TOKEN:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "PASADA CI/CD"
4. Copy token

---

### 3️⃣ Add GitHub Secrets (5 minutes)

Go to: https://github.com/D4rkC0m3t/PASADA/settings/secrets/actions

Click "New repository secret" for each:

#### Vercel (3 secrets):
```
Name: VERCEL_TOKEN
Value: [paste from step 2]

Name: VERCEL_ORG_ID
Value: [paste from step 2]

Name: VERCEL_PROJECT_ID
Value: [paste from step 2]
```

#### Supabase (6 secrets):
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://eoahwxdhvdfgllolzoxd.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [from .env.local]

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [from .env.local]

Name: SUPABASE_ACCESS_TOKEN
Value: [from Supabase account tokens]

Name: SUPABASE_PROJECT_ID
Value: eoahwxdhvdfgllolzoxd

Name: SUPABASE_DB_PASSWORD
Value: [your database password]
```

#### Application (2 secrets):
```
Name: NEXT_PUBLIC_APP_URL
Value: [your Vercel production URL]

Name: PRODUCTION_URL
Value: [same as above]
```

---

### 4️⃣ Set Branch Protection (3 minutes)

Go to: https://github.com/D4rkC0m3t/PASADA/settings/branches

1. Click "Add branch protection rule"
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass:
     - Lint & Format Check
     - TypeScript Type Check
     - Build Application
4. Click "Create"

---

### 5️⃣ Test the Pipeline (5 minutes)

```bash
# Create test branch
git checkout -b test/ci-cd
echo "# Test" >> README.md
git add . && git commit -m "test: CI/CD pipeline"
git push origin test/ci-cd
```

Then:
1. Go to GitHub → Pull Requests
2. Create PR from `test/ci-cd` to `main`
3. Watch CI pipeline run (should see 5 checks)
4. Verify all checks pass ✅
5. Merge PR
6. Watch production deployment

---

## ✅ Verification

After setup, verify:

1. **CI Pipeline:**
   ```bash
   # Check GitHub Actions
   https://github.com/D4rkC0m3t/PASADA/actions
   ```

2. **Production Deployment:**
   ```bash
   # Check health endpoint
   curl https://your-domain.vercel.app/api/health
   ```

3. **Expected Response:**
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.45,
     "environment": "production",
     "version": "1.0.0"
   }
   ```

---

## 🎉 Success Criteria

Your CI/CD is working when:
- ✅ GitHub Actions shows green checks
- ✅ Production deployment succeeds
- ✅ Health endpoint returns 200
- ✅ Application is accessible
- ✅ Hero video plays
- ✅ Contact info displays correctly

---

## 📚 Full Documentation

- **Complete Guide:** `CI_CD_SETUP.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Credentials Status:** `CI_CD_CREDENTIALS_STATUS.md`
- **Status Check:** `CI_CD_STATUS_CHECK.md`

---

## 🆘 Need Help?

**Quick Commands:**
```bash
# Check Vercel login
npx vercel whoami

# Deploy to production
npx vercel --prod

# View deployment logs
npx vercel logs

# Check git status
git status
```

**Common Issues:**
- Vercel not found → Run: `npm install -g vercel`
- Secrets not working → Check for typos in secret names
- Build fails → Run `npm run build` locally first

---

**Ready to start? Run:** `npx vercel login`
