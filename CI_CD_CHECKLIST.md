# ✅ CI/CD Setup Checklist for PASADA CRM

## 📦 Files Created

### GitHub Actions Workflows
- ✅ `.github/workflows/ci.yml` - Continuous Integration pipeline
- ✅ `.github/workflows/cd-production.yml` - Production deployment
- ✅ `.github/workflows/cd-staging.yml` - Staging/preview deployment
- ✅ `.github/workflows/dependency-update.yml` - Automated dependency updates
- ✅ `.github/PULL_REQUEST_TEMPLATE.md` - PR template

### Docker Configuration
- ✅ `Dockerfile` - Multi-stage production build
- ✅ `.dockerignore` - Docker build exclusions
- ✅ `docker-compose.yml` - Container orchestration
- ✅ `nginx.conf` - Reverse proxy configuration

### Deployment Configuration
- ✅ `vercel.json` - Vercel deployment settings
- ✅ `next.config.js` - Updated with standalone output
- ✅ `.env.example` - Environment variables template
- ✅ `.gitignore` - Already exists

### API Endpoints
- ✅ `app/api/health/route.ts` - Health check endpoint

### Documentation
- ✅ `DEPLOYMENT.md` - Comprehensive deployment guide
- ✅ `CI_CD_SETUP.md` - Step-by-step CI/CD setup
- ✅ `CI_CD_CHECKLIST.md` - This file

---

## 🚀 Quick Start Guide

### 1. GitHub Repository Setup (5 minutes)
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "chore: initial commit with CI/CD setup"

# Create GitHub repository and push
git remote add origin https://github.com/your-org/pasada-crm.git
git branch -M main
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```

### 2. Configure GitHub Secrets (10 minutes)
Go to: **Repository → Settings → Secrets and variables → Actions**

**Required Secrets:**
```
VERCEL_TOKEN                    → From Vercel account settings
VERCEL_ORG_ID                   → From Vercel project settings
VERCEL_PROJECT_ID               → From Vercel project settings
NEXT_PUBLIC_SUPABASE_URL        → From Supabase dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY   → From Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY       → From Supabase dashboard
SUPABASE_ACCESS_TOKEN           → From Supabase account
SUPABASE_PROJECT_ID             → From Supabase dashboard
NEXT_PUBLIC_APP_URL             → Your production URL
PRODUCTION_URL                  → Same as above
```

**Optional Secrets:**
```
RESEND_API_KEY                  → For email notifications
EMAIL_FROM                      → Your sender email
```

### 3. Set Branch Protection Rules (5 minutes)
**Settings → Branches → Add rule**

**For `main` branch:**
- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Require status checks: Lint, Type Check, Build
- ✅ Require branches to be up to date

**For `develop` branch:**
- ✅ Require status checks: Lint, Type Check

### 4. Test CI/CD Pipeline (10 minutes)
```bash
# Create test branch
git checkout -b test/ci-setup
echo "# CI/CD Test" >> README.md
git add README.md
git commit -m "test: CI/CD pipeline"
git push origin test/ci-setup

# Create PR on GitHub → Watch CI run
# Merge PR → Watch deployment
```

---

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] `.env.local` created with all required variables
- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Vercel account connected to GitHub

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] `npm audit` shows no critical vulnerabilities

### GitHub Configuration
- [ ] Repository created on GitHub
- [ ] All secrets configured
- [ ] Branch protection rules set
- [ ] Team members added with appropriate permissions

### Vercel Configuration
- [ ] Project created on Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned

---

## 🔄 Deployment Workflows

### Feature Development Flow
```
1. Create feature branch from develop
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature

2. Make changes and commit
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature

3. Create PR to develop
   → CI runs automatically
   → Preview deployment created
   → Request review

4. Merge to develop
   → Staging deployment triggered
   → Test on staging environment

5. Create PR from develop to main
   → Final review
   → Merge to main

6. Production deployment
   → Automatic deployment to production
   → Health checks run
   → Notifications sent
```

### Hotfix Flow
```
1. Create hotfix branch from main
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug

2. Fix the issue
   git add .
   git commit -m "fix: resolve critical bug"
   git push origin hotfix/critical-bug

3. Create PR to main
   → CI runs
   → Quick review
   → Merge immediately

4. Production deployment
   → Automatic deployment
   → Verify fix

5. Merge back to develop
   git checkout develop
   git merge main
   git push origin develop
```

---

## 🧪 Testing Deployments

### Local Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

### Docker Testing
```bash
# Build Docker image
docker build -t pasada-crm:test .

# Run container
docker run -p 3000:3000 --env-file .env.local pasada-crm:test

# Test with docker-compose
docker-compose up

# Stop containers
docker-compose down
```

### Health Check Testing
```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://pasada.in/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 🔍 Monitoring & Maintenance

### Daily Checks
- [ ] Check GitHub Actions for failed workflows
- [ ] Review Vercel deployment logs
- [ ] Monitor error rates in Vercel Analytics

### Weekly Tasks
- [ ] Review dependency update PRs
- [ ] Check security audit reports
- [ ] Review and merge staging changes to production

### Monthly Tasks
- [ ] Update dependencies manually if needed
- [ ] Review and optimize build times
- [ ] Check and rotate secrets if necessary
- [ ] Review access logs and usage patterns

---

## 🚨 Troubleshooting Guide

### CI Pipeline Fails

**Problem:** Lint errors
```bash
# Fix locally
npm run lint
npm run format
git add .
git commit -m "style: fix linting issues"
git push
```

**Problem:** Type errors
```bash
# Check types
npm run type-check

# Fix issues and commit
```

**Problem:** Build fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Deployment Fails

**Problem:** Missing environment variables
- Check GitHub secrets are set correctly
- Verify Vercel environment variables
- Ensure no typos in variable names

**Problem:** Vercel deployment fails
- Check Vercel dashboard logs
- Verify VERCEL_TOKEN is valid
- Ensure VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct

**Problem:** Database migration fails
- Check SUPABASE_ACCESS_TOKEN is valid
- Verify database connection
- Review migration files for errors

### Health Check Fails

**Problem:** 503 Service Unavailable
```bash
# Check if app is running
curl -I https://your-domain.com

# Check Vercel logs
vercel logs pasada-crm --follow

# Verify environment variables
# Check database connection
```

---

## 📊 CI/CD Metrics

### Target Metrics
- **Build Time:** < 5 minutes
- **Deployment Time:** < 3 minutes
- **CI Pipeline Time:** < 10 minutes
- **Success Rate:** > 95%
- **Mean Time to Recovery:** < 30 minutes

### Monitoring Tools
- GitHub Actions dashboard for CI/CD metrics
- Vercel Analytics for performance metrics
- Supabase dashboard for database metrics
- Custom monitoring (optional): Sentry, DataDog, New Relic

---

## 🎯 Next Steps After Setup

1. **Test the complete flow**
   - Create a test feature
   - Go through PR process
   - Deploy to staging
   - Deploy to production

2. **Set up monitoring**
   - Configure error tracking (Sentry)
   - Set up uptime monitoring
   - Enable Vercel Analytics

3. **Document custom workflows**
   - Add team-specific processes
   - Document any custom scripts
   - Create runbooks for common issues

4. **Train the team**
   - Share CI/CD documentation
   - Conduct walkthrough session
   - Create video tutorials if needed

5. **Optimize over time**
   - Monitor build times
   - Optimize Docker images
   - Cache dependencies effectively
   - Review and update workflows

---

## 📞 Support

**Questions about CI/CD setup?**
- Read: `CI_CD_SETUP.md` for detailed instructions
- Read: `DEPLOYMENT.md` for deployment guide
- Email: dev@pasada.in
- GitHub Issues: Create an issue for bugs or feature requests

---

## 🎉 Success Criteria

Your CI/CD is successfully set up when:
- ✅ All GitHub Actions workflows are green
- ✅ Automatic deployments work on push to main
- ✅ Preview deployments work for PRs
- ✅ Health checks pass after deployment
- ✅ Team can deploy without manual intervention
- ✅ Rollback process is documented and tested

---

**Setup Date:** _____________
**Completed By:** _____________
**Verified By:** _____________

---

**Version:** 1.0.0
**Last Updated:** January 2024
