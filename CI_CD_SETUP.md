# CI/CD Setup Guide for PASADA CRM

## 🚀 Quick Start

This guide will help you set up Continuous Integration and Continuous Deployment for the PASADA CRM project.

---

## 📋 Prerequisites

- GitHub repository with admin access
- Vercel account (for deployment)
- Supabase project (for database)
- All required API keys and credentials

---

## 🔧 Step 1: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

### Required Secrets

Click **New repository secret** and add each of the following:

#### Vercel Deployment
```
VERCEL_TOKEN
  → Get from: https://vercel.com/account/tokens
  → Click "Create Token"
  
VERCEL_ORG_ID
  → Get from: Vercel Dashboard → Settings → General
  → Copy "Team ID" or "User ID"
  
VERCEL_PROJECT_ID
  → Get from: Your Project → Settings → General
  → Copy "Project ID"
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL
  → Get from: Supabase Dashboard → Project Settings → API
  → Copy "Project URL"
  
NEXT_PUBLIC_SUPABASE_ANON_KEY
  → Get from: Supabase Dashboard → Project Settings → API
  → Copy "anon public" key
  
SUPABASE_SERVICE_ROLE_KEY
  → Get from: Supabase Dashboard → Project Settings → API
  → Copy "service_role" key (⚠️ Keep secret!)
  
SUPABASE_ACCESS_TOKEN
  → Get from: Supabase Dashboard → Account → Access Tokens
  → Generate new token
  
SUPABASE_PROJECT_ID
  → Get from: Supabase Dashboard → Project Settings → General
  → Copy "Reference ID"
  
SUPABASE_DB_PASSWORD
  → Your Supabase database password
```

#### Application
```
NEXT_PUBLIC_APP_URL
  → Your production URL (e.g., https://pasada.in)
  
PRODUCTION_URL
  → Same as NEXT_PUBLIC_APP_URL (for health checks)
```

#### Email (Optional)
```
RESEND_API_KEY
  → Get from: https://resend.com/api-keys
  
EMAIL_FROM
  → Your verified sender email (e.g., noreply@pasada.in)
```

---

## 🔄 Step 2: Understand the Workflows

### CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main`, `develop`, or `staging` branches
- Pull requests to these branches

**Jobs:**
1. **Lint** - ESLint and Prettier checks
2. **Type Check** - TypeScript validation
3. **Build** - Verify application builds successfully
4. **Security** - npm audit for vulnerabilities
5. **Dependencies** - Check for outdated packages

**Status:** Runs automatically on every push/PR

---

### Production Deployment (`.github/workflows/cd-production.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub Actions UI

**Jobs:**
1. **Deploy to Vercel** - Production deployment
2. **Database Migrations** - Run Supabase migrations
3. **Health Check** - Verify deployment is healthy
4. **Notify** - Send deployment status notifications

**Status:** Deploys to production automatically

---

### Staging Deployment (`.github/workflows/cd-staging.yml`)

**Triggers:**
- Push to `develop` or `staging` branches
- Pull requests to `main`

**Jobs:**
1. **Deploy Preview** - Create Vercel preview deployment
2. **E2E Tests** - Run end-to-end tests (if configured)

**Status:** Creates preview deployments for testing

---

### Dependency Updates (`.github/workflows/dependency-update.yml`)

**Triggers:**
- Every Monday at 9 AM UTC
- Manual trigger via GitHub Actions UI

**Jobs:**
1. **Update Dependencies** - Check for updates and create PR
2. **Security Audit** - Weekly security vulnerability scan

**Status:** Automated weekly maintenance

---

## 🌿 Step 3: Branch Strategy

### Branch Structure
```
main (production)
  ↑
  └── Protected branch
  └── Requires PR approval
  └── Auto-deploys to production

staging (pre-production)
  ↑
  └── Testing environment
  └── Auto-deploys to staging

develop (development)
  ↑
  └── Integration branch
  └── Auto-deploys to preview

feature/* (feature branches)
  └── Individual features
  └── Creates preview deployments on PR
```

### Workflow

#### 1. Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

#### 2. Make Changes
```bash
# Make your changes
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

#### 3. Create Pull Request
- Go to GitHub
- Create PR from `feature/your-feature-name` to `develop`
- CI pipeline runs automatically
- Preview deployment created
- Wait for review and approval

#### 4. Merge to Develop
- After approval, merge PR
- Staging deployment triggers automatically
- Test on staging environment

#### 5. Deploy to Production
- Create PR from `develop` to `main`
- Get final approval
- Merge to `main`
- Production deployment triggers automatically

---

## 🔒 Step 4: Branch Protection Rules

### Protect Main Branch

Go to **Settings** → **Branches** → **Add rule**

**Branch name pattern:** `main`

Enable:
- ✅ Require a pull request before merging
- ✅ Require approvals (1 minimum)
- ✅ Require status checks to pass before merging
  - Select: `Lint & Format Check`
  - Select: `TypeScript Type Check`
  - Select: `Build Application`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

### Protect Develop Branch

**Branch name pattern:** `develop`

Enable:
- ✅ Require status checks to pass before merging
  - Select: `Lint & Format Check`
  - Select: `TypeScript Type Check`

---

## 📊 Step 5: Monitor Deployments

### GitHub Actions Dashboard
- Go to **Actions** tab in your repository
- View workflow runs, logs, and status
- Re-run failed workflows if needed

### Vercel Dashboard
- Go to https://vercel.com/dashboard
- View deployments, analytics, and logs
- Monitor performance and errors

### Supabase Dashboard
- Go to https://supabase.com/dashboard
- Monitor database usage and performance
- View logs and metrics

---

## 🧪 Step 6: Test the CI/CD Pipeline

### Test CI Pipeline
```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: CI pipeline"
git push origin test/ci-pipeline

# Create PR on GitHub
# Watch CI pipeline run
```

### Test CD Pipeline
```bash
# Merge test PR to develop
# Watch staging deployment

# Create PR from develop to main
# Merge to trigger production deployment
```

---

## 🔍 Step 7: Verify Deployment

### Check Health Endpoint
```bash
# Production
curl https://pasada.in/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0"
}
```

### Check Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# List deployments
vercel ls

# View logs
vercel logs pasada-crm
```

---

## 🚨 Troubleshooting

### CI Pipeline Fails

**Lint Errors:**
```bash
npm run lint
npm run format
```

**Type Errors:**
```bash
npm run type-check
```

**Build Errors:**
```bash
npm run build
```

### Deployment Fails

**Check Secrets:**
- Verify all GitHub secrets are set correctly
- Ensure no typos in secret names
- Check secret values are not expired

**Check Logs:**
- Go to Actions tab → Failed workflow → View logs
- Look for specific error messages
- Check Vercel deployment logs

**Common Issues:**
1. Missing environment variables
2. Incorrect Vercel token or IDs
3. Build errors not caught locally
4. Database migration failures

### Health Check Fails

**Debug Steps:**
```bash
# Check if app is running
curl -I https://your-domain.com

# Check health endpoint
curl https://your-domain.com/api/health

# View Vercel logs
vercel logs pasada-crm --follow
```

---

## 📈 Best Practices

### Commit Messages
Use conventional commits:
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

### Pull Requests
- Keep PRs small and focused
- Write clear descriptions
- Link related issues
- Request reviews from team members
- Ensure CI passes before merging

### Environment Variables
- Never commit secrets to repository
- Use `.env.local` for local development
- Set production secrets in Vercel dashboard
- Rotate secrets regularly

### Testing
- Test locally before pushing
- Review preview deployments
- Test on staging before production
- Monitor production after deployment

---

## 🎯 Next Steps

1. ✅ Configure all GitHub secrets
2. ✅ Set up branch protection rules
3. ✅ Test CI/CD pipeline with test PR
4. ✅ Deploy to staging
5. ✅ Deploy to production
6. ✅ Set up monitoring and alerts
7. ✅ Document any custom workflows

---

## 📞 Support

Need help with CI/CD setup?

- **Email:** dev@pasada.in
- **GitHub Issues:** Create an issue in the repository
- **Documentation:** See `DEPLOYMENT.md` for detailed deployment guide

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Last Updated:** January 2024
**Version:** 1.0.0
