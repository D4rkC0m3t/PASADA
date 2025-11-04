# 🚀 PASADA CRM - CI/CD Setup Checklist

## ✅ Current Status
- [x] GitHub repository created
- [x] All code committed and pushed
- [x] CI/CD workflows configured
- [ ] GitHub Secrets configured
- [ ] Vercel project created
- [ ] Branch protection rules set
- [ ] First deployment tested

---

## 📝 Step-by-Step Setup

### **Step 1: Vercel Setup** ⏱️ 5 minutes

#### 1.1 Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Authorize Vercel to access your repositories

#### 1.2 Import Project
- [ ] Click "Add New Project"
- [ ] Select "D4rkC0m3t/PASADA" repository
- [ ] Click "Import"
- [ ] Framework: Next.js (auto-detected)
- [ ] Root Directory: `Pasada` (if needed)
- [ ] Click "Deploy"

#### 1.3 Get Vercel Credentials
Once project is created, go to **Project Settings → General**:

```
VERCEL_PROJECT_ID: _________________ (copy from settings)
```

Go to **Account Settings → Tokens**:
```
VERCEL_TOKEN: _________________ (create new token)
```

Go to **Settings → General** (top level):
```
VERCEL_ORG_ID: _________________ (Team ID or User ID)
```

---

### **Step 2: Supabase Credentials** ⏱️ 3 minutes

Go to your Supabase project dashboard:

#### From Project Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL: _________________
NEXT_PUBLIC_SUPABASE_ANON_KEY: _________________
SUPABASE_SERVICE_ROLE_KEY: _________________
```

#### From Project Settings → General:
```
SUPABASE_PROJECT_ID: _________________ (Reference ID)
```

#### From Account → Access Tokens:
```
SUPABASE_ACCESS_TOKEN: _________________ (create new)
```

#### Database Password:
```
SUPABASE_DB_PASSWORD: _________________ (your DB password)
```

---

### **Step 3: Application URLs** ⏱️ 1 minute

```
NEXT_PUBLIC_APP_URL: _________________ (e.g., https://pasada.vercel.app)
PRODUCTION_URL: _________________ (same as above)
```

---

### **Step 4: Configure GitHub Secrets** ⏱️ 5 minutes

Go to: https://github.com/D4rkC0m3t/PASADA/settings/secrets/actions

Click "New repository secret" for each:

#### Vercel (3 secrets)
- [ ] `VERCEL_TOKEN` = _________________
- [ ] `VERCEL_ORG_ID` = _________________
- [ ] `VERCEL_PROJECT_ID` = _________________

#### Supabase (6 secrets)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = _________________
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = _________________
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = _________________
- [ ] `SUPABASE_ACCESS_TOKEN` = _________________
- [ ] `SUPABASE_PROJECT_ID` = _________________
- [ ] `SUPABASE_DB_PASSWORD` = _________________

#### Application (2 secrets)
- [ ] `NEXT_PUBLIC_APP_URL` = _________________
- [ ] `PRODUCTION_URL` = _________________

#### Optional - Email (2 secrets)
- [ ] `RESEND_API_KEY` = _________________ (if using Resend)
- [ ] `EMAIL_FROM` = _________________ (e.g., noreply@pasada.in)

---

### **Step 5: Set Branch Protection** ⏱️ 3 minutes

Go to: https://github.com/D4rkC0m3t/PASADA/settings/branches

#### Protect `main` branch:
- [ ] Click "Add branch protection rule"
- [ ] Branch name pattern: `main`
- [ ] ✅ Require a pull request before merging
- [ ] ✅ Require approvals: 1
- [ ] ✅ Require status checks to pass before merging
  - [ ] Select: `Lint & Format Check`
  - [ ] Select: `TypeScript Type Check`
  - [ ] Select: `Build Application`
- [ ] ✅ Require branches to be up to date before merging
- [ ] Click "Create"

#### Protect `develop` branch (optional):
- [ ] Branch name pattern: `develop`
- [ ] ✅ Require status checks to pass before merging
  - [ ] Select: `Lint & Format Check`
  - [ ] Select: `TypeScript Type Check`
- [ ] Click "Create"

---

### **Step 6: Test CI/CD Pipeline** ⏱️ 5 minutes

#### 6.1 Test CI Pipeline
```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# CI/CD Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline
```

- [ ] Go to GitHub → Pull Requests → Create PR
- [ ] Watch CI pipeline run (should see 5 jobs)
- [ ] Verify all checks pass ✅

#### 6.2 Test Deployment
- [ ] Merge test PR to `main`
- [ ] Go to GitHub → Actions
- [ ] Watch "CD - Production Deployment" workflow
- [ ] Verify deployment succeeds
- [ ] Check health endpoint: `https://your-domain.com/api/health`

---

### **Step 7: Verify Everything Works** ⏱️ 3 minutes

#### Check GitHub Actions
- [ ] Go to: https://github.com/D4rkC0m3t/PASADA/actions
- [ ] Verify workflows are visible
- [ ] Check if any workflows have run

#### Check Vercel Deployment
- [ ] Go to Vercel dashboard
- [ ] Check deployment status
- [ ] Visit your live site
- [ ] Test basic functionality

#### Check Health Endpoint
```bash
curl https://your-domain.com/api/health
```

Expected response:
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

## 🎯 Success Criteria

Your CI/CD is working when:
- ✅ All GitHub secrets are configured
- ✅ CI pipeline runs on every push/PR
- ✅ All CI checks pass (lint, type-check, build)
- ✅ Deployments happen automatically on push to main
- ✅ Health checks pass after deployment
- ✅ You can access your live application

---

## 🚨 Troubleshooting

### CI Pipeline Fails
**Check:**
1. All secrets are set correctly in GitHub
2. No typos in secret names
3. Secrets have correct values

**Common Issues:**
- Missing `NEXT_PUBLIC_SUPABASE_URL` → CI build fails
- Wrong `VERCEL_TOKEN` → Deployment fails
- Missing `SUPABASE_ACCESS_TOKEN` → Migration fails

### Deployment Fails
**Check:**
1. Vercel project is created
2. `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
3. Vercel token has correct permissions

### Health Check Fails
**Check:**
1. Application is deployed and running
2. `/api/health` route exists
3. No runtime errors in Vercel logs

---

## 📞 Need Help?

- **Documentation:** See `CI_CD_SETUP.md` for detailed guide
- **Deployment Guide:** See `DEPLOYMENT.md`
- **Quick Reference:** See `README_CI_CD.md`

---

## ✅ Completion

Once all checkboxes are marked:
- [ ] All secrets configured
- [ ] Branch protection set
- [ ] CI pipeline tested
- [ ] Deployment successful
- [ ] Health check passing

**Date Completed:** _____________
**Deployed URL:** _____________
**Notes:** _____________

---

**🎉 Congratulations! Your CI/CD pipeline is live!**
