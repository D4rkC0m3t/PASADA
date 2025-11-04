# 🚀 PASADA CRM - CI/CD Infrastructure

## Overview

Complete CI/CD infrastructure for automated testing, building, and deployment of the PASADA CRM application.

---

## 📁 What's Included

### 🔄 GitHub Actions Workflows

#### **CI Pipeline** (`.github/workflows/ci.yml`)
Runs on every push and pull request to ensure code quality.

**Jobs:**
- **Lint & Format Check** - ESLint and Prettier validation
- **TypeScript Type Check** - Type safety verification
- **Build Application** - Ensures app builds successfully
- **Security Audit** - npm vulnerability scanning
- **Dependency Check** - Outdated package detection

**Triggers:** Push to main/develop/staging, Pull Requests

---

#### **Production Deployment** (`.github/workflows/cd-production.yml`)
Automated deployment to production environment.

**Jobs:**
- **Deploy to Vercel** - Production deployment with environment setup
- **Database Migrations** - Automatic Supabase migration execution
- **Health Check** - Post-deployment verification
- **Notify** - Deployment status notifications

**Triggers:** Push to main branch, Manual dispatch

---

#### **Staging Deployment** (`.github/workflows/cd-staging.yml`)
Preview deployments for testing before production.

**Jobs:**
- **Deploy Preview** - Vercel preview environment
- **E2E Tests** - End-to-end testing (when configured)
- **PR Comments** - Automatic preview URL comments

**Triggers:** Push to develop/staging, PRs to main

---

#### **Dependency Updates** (`.github/workflows/dependency-update.yml`)
Automated weekly maintenance.

**Jobs:**
- **Update Dependencies** - Check and update packages
- **Security Audit** - Weekly vulnerability scan
- **Create PR** - Automated update pull requests

**Triggers:** Weekly (Monday 9 AM UTC), Manual dispatch

---

### 🐳 Docker Configuration

#### **Dockerfile**
Multi-stage production-optimized build:
- **Stage 1:** Dependencies installation
- **Stage 2:** Application build
- **Stage 3:** Minimal runtime image

**Features:**
- Non-root user for security
- Health check endpoint
- Optimized layer caching
- Standalone Next.js output

#### **docker-compose.yml**
Complete container orchestration:
- Application container
- Optional Nginx reverse proxy
- Network configuration
- Health checks

#### **nginx.conf**
Production-ready reverse proxy:
- SSL/TLS configuration
- Rate limiting
- Gzip compression
- Security headers
- Static file caching

---

### 📝 Documentation

#### **DEPLOYMENT.md**
Comprehensive deployment guide covering:
- Prerequisites and setup
- Vercel deployment (recommended)
- Docker deployment
- Self-hosted deployment
- Post-deployment checklist
- Monitoring and troubleshooting

#### **CI_CD_SETUP.md**
Step-by-step CI/CD configuration:
- GitHub secrets setup
- Workflow explanations
- Branch strategy
- Testing procedures
- Troubleshooting guide

#### **CI_CD_CHECKLIST.md**
Quick reference checklist:
- Setup tasks
- Pre-deployment checks
- Testing procedures
- Monitoring tasks

---

## 🎯 Quick Start

### 1. Prerequisites
```bash
# Ensure you have:
- GitHub repository with admin access
- Vercel account
- Supabase project
- Node.js 18+ installed
```

### 2. Configure Secrets
Add these secrets to GitHub repository settings:

**Required:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

**Optional:**
- `RESEND_API_KEY`
- `EMAIL_FROM`

### 3. Set Branch Protection
Protect `main` and `develop` branches with:
- Required PR reviews
- Status checks must pass
- Up-to-date branches

### 4. Test Pipeline
```bash
# Create test branch
git checkout -b test/ci-pipeline
echo "test" >> README.md
git add . && git commit -m "test: CI pipeline"
git push origin test/ci-pipeline

# Create PR and watch CI run
```

---

## 🌿 Branch Strategy

```
main (production)
  ↑ PR with approval required
  ↑ Auto-deploys to production
  |
staging (pre-production)
  ↑ Auto-deploys to staging
  |
develop (integration)
  ↑ Auto-deploys to preview
  |
feature/* (features)
  ↑ Creates preview on PR
```

---

## 🔄 Development Workflow

### Feature Development
```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Develop and commit
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. Create PR to develop
# CI runs automatically
# Preview deployment created

# 4. After approval, merge to develop
# Staging deployment triggered

# 5. Test on staging, then PR to main
# Production deployment on merge
```

### Hotfix Process
```bash
# 1. Branch from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Fix and commit
git add .
git commit -m "fix: critical bug"
git push origin hotfix/critical-fix

# 3. PR to main (expedited review)
# 4. Merge → Auto-deploy to production
# 5. Merge back to develop
```

---

## 🧪 Testing

### Local Testing
```bash
npm install          # Install dependencies
npm run lint         # Check code style
npm run type-check   # Verify types
npm run build        # Test build
npm start            # Test production build
```

### Docker Testing
```bash
docker build -t pasada-crm:test .
docker run -p 3000:3000 --env-file .env.local pasada-crm:test
```

### Health Check
```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://pasada.in/api/health
```

---

## 📊 Monitoring

### GitHub Actions
- View workflow runs in Actions tab
- Monitor success/failure rates
- Review execution times

### Vercel Dashboard
- Deployment status and logs
- Performance analytics
- Error tracking

### Health Endpoint
- `/api/health` - Application health status
- Returns: status, uptime, environment, version

---

## 🚨 Troubleshooting

### CI Fails
```bash
# Lint errors
npm run lint && npm run format

# Type errors
npm run type-check

# Build errors
rm -rf .next node_modules
npm install && npm run build
```

### Deployment Fails
1. Check GitHub secrets are correct
2. Verify Vercel token is valid
3. Review workflow logs for errors
4. Check environment variables

### Health Check Fails
1. Verify app is running
2. Check Vercel logs
3. Verify database connection
4. Review environment variables

---

## 📈 Metrics

### Target Performance
- **Build Time:** < 5 minutes
- **Deployment Time:** < 3 minutes
- **CI Pipeline:** < 10 minutes
- **Success Rate:** > 95%
- **MTTR:** < 30 minutes

---

## 🔒 Security

### Best Practices
- ✅ All secrets stored in GitHub Secrets
- ✅ Environment variables never committed
- ✅ Branch protection rules enforced
- ✅ Required PR reviews
- ✅ Automated security audits
- ✅ Non-root Docker user
- ✅ Security headers configured

### Regular Tasks
- Weekly dependency updates
- Monthly security audits
- Quarterly secret rotation
- Regular backup verification

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `DEPLOYMENT.md` | Full deployment guide |
| `CI_CD_SETUP.md` | CI/CD configuration steps |
| `CI_CD_CHECKLIST.md` | Quick reference checklist |
| `README_CI_CD.md` | This overview document |

---

## 🎯 Success Criteria

CI/CD is working correctly when:
- ✅ All workflows run without errors
- ✅ Deployments happen automatically
- ✅ Preview environments work for PRs
- ✅ Health checks pass after deployment
- ✅ Team can deploy without manual steps

---

## 🆘 Support

**Need Help?**
- 📖 Read the documentation files
- 📧 Email: dev@pasada.in
- 🐛 GitHub Issues for bugs
- 💬 Team chat for quick questions

---

## 🎉 Next Steps

1. ✅ Complete GitHub secrets setup
2. ✅ Configure branch protection
3. ✅ Test CI/CD with sample PR
4. ✅ Deploy to staging
5. ✅ Deploy to production
6. ✅ Set up monitoring
7. ✅ Train team on workflows

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Maintained By:** PASADA Development Team

---

## 📋 Quick Reference

### Useful Commands
```bash
# View deployments
vercel ls

# View logs
vercel logs pasada-crm

# Manual deploy
vercel --prod

# Check health
curl https://pasada.in/api/health

# Docker build
docker build -t pasada-crm .

# Docker run
docker-compose up -d
```

### Important URLs
- **Production:** https://pasada.in
- **Staging:** https://staging.pasada.in
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub Actions:** https://github.com/your-org/pasada-crm/actions

---

**🚀 Happy Deploying!**
