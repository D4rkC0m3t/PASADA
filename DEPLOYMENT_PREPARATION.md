# 🚀 PASADA CRM - Deployment Preparation

## ✅ Pre-Deployment Checklist

### Environment Variables Status
- ✅ Supabase URL configured
- ✅ Supabase Anon Key configured
- ✅ Supabase Service Role Key configured
- ✅ Resend API Key configured
- ✅ Email settings configured
- ✅ Company information configured

### What We'll Do Now
1. Deploy to Vercel (get production URL)
2. Configure Vercel environment variables
3. Set up GitHub Secrets for CI/CD
4. Test the deployment

---

## 🎯 Step 1: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)
```bash
# Make sure you're in the project directory
cd d:/Projects/Pasada/CRM/Pasada

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import Git Repository
3. Select: `D4rkC0m3t/PASADA`
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `Pasada`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables (see below)
6. Click "Deploy"

---

## 🔐 Step 2: Configure Vercel Environment Variables

Once your project is created in Vercel, add these environment variables:

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

### Required Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://eoahwxdhvdfgllolzoxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWh3eGRodmRmZ2xsb2x6b3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQyNDMsImV4cCI6MjA3NDk5MDI0M30.atCkyoT05NXX_3_sT7LGYYwFdjCoD38wGtP_hE7GZT4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWh3eGRodmRmZ2xsb2x6b3hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQxNDI0MywiZXhwIjoyMDc0OTkwMjQzfQ.Hsqye61t5Vn9hBCq21vg1jbVlLP0biITbmNQUnAasw8

# Application
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=PASADA CRM
NODE_ENV=production

# Email
RESEND_API_KEY=re_edwN8HuA_MG62hopnQVTMKgpdMJZ9Dwfk
EMAIL_FROM=noreply@pasada.in
EMAIL_FROM_NAME=PASADA Interior Design
RESEND_FROM_EMAIL=PASADA Interiors <quotations@pasada.in>

# PDF Generation
PDF_GENERATION_MODE=puppeteer
PDF_QUALITY=high

# File Upload
MAX_FILE_SIZE_MB=10
MAX_IMAGE_SIZE_MB=5
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,webp

# Feature Flags
NEXT_PUBLIC_ENABLE_PDF_DOWNLOAD=true
NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CLIENT_PORTAL=true
NEXT_PUBLIC_ENABLE_BOOKINGS=true

# Company Info
NEXT_PUBLIC_COMPANY_NAME=PASADA Interior Design
NEXT_PUBLIC_COMPANY_EMAIL=contact@pasada.in
NEXT_PUBLIC_COMPANY_PHONE=+91 XXXXX XXXXX
NEXT_PUBLIC_COMPANY_ADDRESS=No 47 LBS Nagar 1st cross K Narayanapura bangalore 560077

# Development
DEBUG=false
LOG_LEVEL=info
NEXT_TELEMETRY_DISABLED=1
```

**Important:** For each variable, select environment: **Production, Preview, Development**

---

## 🔑 Step 3: Get Vercel Credentials for CI/CD

### A. Get VERCEL_TOKEN
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "PASADA CI/CD"
4. Scope: Full Account
5. Expiration: No Expiration
6. Click "Create"
7. **Copy the token immediately** (you won't see it again!)

### B. Get VERCEL_ORG_ID
1. Go to https://vercel.com/account
2. Click on your profile/team
3. Go to Settings → General
4. Copy "Team ID" or "User ID"

### C. Get VERCEL_PROJECT_ID
1. Go to your project dashboard
2. Click on "pasada-crm" (or your project name)
3. Go to Settings → General
4. Copy "Project ID"

---

## 🔐 Step 4: Configure GitHub Secrets

### Go to: https://github.com/D4rkC0m3t/PASADA/settings/secrets/actions

Click "New repository secret" and add each:

### Vercel Secrets (3)
```
Name: VERCEL_TOKEN
Value: [paste token from step 3A]

Name: VERCEL_ORG_ID
Value: [paste ID from step 3B]

Name: VERCEL_PROJECT_ID
Value: [paste ID from step 3C]
```

### Supabase Secrets (6)
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://eoahwxdhvdfgllolzoxd.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWh3eGRodmRmZ2xsb2x6b3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQyNDMsImV4cCI6MjA3NDk5MDI0M30.atCkyoT05NXX_3_sT7LGYYwFdjCoD38wGtP_hE7GZT4

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWh3eGRodmRmZ2xsb2x6b3hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQxNDI0MywiZXhwIjoyMDc0OTkwMjQzfQ.Hsqye61t5Vn9hBCq21vg1jbVlLP0biITbmNQUnAasw8

Name: SUPABASE_ACCESS_TOKEN
Value: [your Supabase access token]

Name: SUPABASE_PROJECT_ID
Value: eoahwxdhvdfgllolzoxd

Name: SUPABASE_DB_PASSWORD
Value: [your database password]
```

### Application Secrets (2)
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-project.vercel.app

Name: PRODUCTION_URL
Value: https://your-project.vercel.app
```

### Optional Email Secrets (2)
```
Name: RESEND_API_KEY
Value: re_edwN8HuA_MG62hopnQVTMKgpdMJZ9Dwfk

Name: EMAIL_FROM
Value: noreply@pasada.in
```

---

## ✅ Step 5: Verify Deployment

### Check Vercel Deployment
1. Go to Vercel dashboard
2. Check deployment status (should be "Ready")
3. Click on the deployment URL
4. Verify the site loads

### Check Health Endpoint
```bash
curl https://your-project.vercel.app/api/health
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

### Test Basic Functionality
- [ ] Homepage loads
- [ ] Login page works
- [ ] Admin dashboard accessible (after login)
- [ ] No console errors

---

## 🔄 Step 6: Test CI/CD Pipeline

### Create Test Branch
```bash
git checkout -b test/deployment-verification
echo "# Deployment Test" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin test/deployment-verification
```

### Create Pull Request
1. Go to GitHub repository
2. Click "Pull requests" → "New pull request"
3. Select: `test/deployment-verification` → `main`
4. Click "Create pull request"

### Watch CI Pipeline
- Go to "Actions" tab
- Watch the CI pipeline run
- Verify all checks pass:
  - ✅ Lint & Format Check
  - ✅ TypeScript Type Check
  - ✅ Build Application
  - ✅ Security Audit
  - ✅ Dependency Check

### Merge and Watch Deployment
1. Merge the PR
2. Go to "Actions" tab
3. Watch "CD - Production Deployment" workflow
4. Verify:
   - ✅ Deploy to Vercel succeeds
   - ✅ Health check passes
   - ✅ Deployment URL is accessible

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Vercel project is created and deployed
- ✅ All environment variables are configured
- ✅ GitHub secrets are set up
- ✅ CI pipeline runs on PRs
- ✅ CD pipeline deploys on merge to main
- ✅ Health endpoint returns 200 OK
- ✅ Application is accessible and functional

---

## 🚨 Troubleshooting

### Build Fails on Vercel
**Check:**
- All environment variables are set
- No missing `NEXT_PUBLIC_` variables
- Build command is correct: `npm run build`

**Solution:**
```bash
# Test build locally first
npm run build
npm start
```

### Health Check Fails
**Check:**
- `/api/health/route.ts` file exists
- No runtime errors in Vercel logs

**Solution:**
- Check Vercel logs: Dashboard → Deployments → Click deployment → Logs

### CI Pipeline Fails
**Check:**
- All GitHub secrets are set correctly
- Secret names match exactly (case-sensitive)
- No typos in secret values

**Solution:**
- Review GitHub Actions logs
- Verify secrets in Settings → Secrets

---

## 📝 Post-Deployment Tasks

### 1. Update Production URL
After deployment, update these:
- [ ] `.env.local` → `NEXT_PUBLIC_APP_URL`
- [ ] GitHub Secret → `NEXT_PUBLIC_APP_URL`
- [ ] GitHub Secret → `PRODUCTION_URL`

### 2. Configure Custom Domain (Optional)
1. Go to Vercel → Project → Settings → Domains
2. Add your custom domain (e.g., pasada.in)
3. Update DNS records as instructed
4. Wait for SSL certificate

### 3. Set Up Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring

### 4. Documentation
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Share access with team

---

## 📞 Need Help?

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**GitHub Actions Issues:**
- Check logs in Actions tab
- Review workflow files in `.github/workflows/`

**Application Issues:**
- Check Vercel logs
- Review browser console
- Check Supabase logs

---

## ✅ Deployment Checklist

- [ ] Vercel account created
- [ ] Project deployed to Vercel
- [ ] Environment variables configured in Vercel
- [ ] Vercel credentials obtained (token, org ID, project ID)
- [ ] GitHub secrets configured (13 secrets)
- [ ] Production URL noted
- [ ] Health endpoint tested
- [ ] CI/CD pipeline tested
- [ ] Application verified working

**Deployment Date:** _____________
**Production URL:** _____________
**Deployed By:** _____________

---

**🎊 Ready to deploy? Let's start with Step 1!**
