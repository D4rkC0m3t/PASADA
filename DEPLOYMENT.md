# PASADA CRM - Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-deployment)
  - [Docker](#docker-deployment)
  - [Self-Hosted](#self-hosted-deployment)
- [CI/CD Setup](#cicd-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **GitHub Account** - For version control and CI/CD
- **Vercel Account** - For hosting (recommended)
- **Supabase Account** - For database and authentication
- **Resend Account** - For email notifications (optional)

### Required Tools
- Node.js >= 18.17.0
- npm >= 9.0.0
- Git
- Docker (for containerized deployment)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/pasada-crm.git
cd pasada-crm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values
```

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 4. Test Locally
```bash
npm run dev
```
Visit `http://localhost:3000` to verify everything works.

---

## Deployment Options

## Vercel Deployment (Recommended)

### Why Vercel?
- ✅ Zero-config deployment for Next.js
- ✅ Automatic HTTPS and CDN
- ✅ Preview deployments for PRs
- ✅ Built-in analytics
- ✅ Edge functions support

### Step-by-Step Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy
```bash
# First deployment (interactive)
vercel

# Production deployment
vercel --prod
```

#### 4. Configure Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- etc.

#### 5. Configure Custom Domain
1. Go to Project Settings → Domains
2. Add your domain (e.g., `pasada.in`)
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### Vercel Configuration File
Create `vercel.json` for advanced configuration:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["bom1"],
  "env": {
    "NEXT_PUBLIC_APP_NAME": "PASADA CRM"
  }
}
```

---

## Docker Deployment

### Build Docker Image
```bash
docker build -t pasada-crm:latest .
```

### Run with Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables for Docker
Create `.env` file in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deploy to Docker Registry
```bash
# Tag image
docker tag pasada-crm:latest your-registry/pasada-crm:latest

# Push to registry
docker push your-registry/pasada-crm:latest
```

### Deploy to Cloud Providers

#### AWS ECS
```bash
# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service --cluster pasada-cluster --service-name pasada-crm --task-definition pasada-crm:1
```

#### Google Cloud Run
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/pasada-crm

# Deploy
gcloud run deploy pasada-crm --image gcr.io/PROJECT_ID/pasada-crm --platform managed
```

#### Azure Container Instances
```bash
az container create --resource-group pasada-rg --name pasada-crm --image your-registry/pasada-crm:latest
```

---

## Self-Hosted Deployment

### Using PM2 (Process Manager)

#### 1. Install PM2
```bash
npm install -g pm2
```

#### 2. Build Application
```bash
npm run build
```

#### 3. Create PM2 Ecosystem File
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'pasada-crm',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

#### 4. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name pasada.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## CI/CD Setup

### GitHub Actions Setup

#### 1. Create GitHub Secrets
Go to Repository → Settings → Secrets and Variables → Actions

Add the following secrets:
- `VERCEL_TOKEN` - Get from Vercel account settings
- `VERCEL_ORG_ID` - From Vercel project settings
- `VERCEL_PROJECT_ID` - From Vercel project settings
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN` - For database migrations
- `SUPABASE_PROJECT_ID`
- `PRODUCTION_URL` - Your production URL

#### 2. Workflows Overview

**CI Pipeline** (`.github/workflows/ci.yml`)
- Runs on: Push to main/develop/staging, Pull Requests
- Jobs: Lint, Type Check, Build, Security Audit

**Production Deployment** (`.github/workflows/cd-production.yml`)
- Runs on: Push to main branch
- Jobs: Deploy to Vercel, Run Migrations, Health Check

**Staging Deployment** (`.github/workflows/cd-staging.yml`)
- Runs on: Push to develop/staging, PRs to main
- Jobs: Deploy Preview, Run E2E Tests

#### 3. Branch Strategy
```
main (production)
  ↑
staging (pre-production)
  ↑
develop (development)
  ↑
feature/* (feature branches)
```

#### 4. Deployment Flow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit
3. Push and create PR to `develop`
4. CI runs automatically (lint, test, build)
5. Merge to `develop` → Deploys to staging
6. Test on staging environment
7. Create PR from `develop` to `main`
8. Merge to `main` → Deploys to production

---

## Post-Deployment

### 1. Database Migrations
```bash
# Using Supabase CLI
supabase link --project-ref your-project-id
supabase db push
```

### 2. Verify Deployment
```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0"
}
```

### 3. Configure DNS
Point your domain to deployment:
- **Vercel**: Add A/CNAME records as instructed
- **Self-hosted**: Point to your server IP

### 4. SSL Certificate
- **Vercel**: Automatic
- **Self-hosted**: Use Let's Encrypt
  ```bash
  sudo certbot --nginx -d pasada.in -d www.pasada.in
  ```

### 5. Set Up Monitoring
- Enable Vercel Analytics
- Configure error tracking (Sentry)
- Set up uptime monitoring (UptimeRobot, Pingdom)

---

## Monitoring

### Application Monitoring

#### Vercel Analytics
Automatically enabled on Vercel. View in dashboard.

#### Custom Logging
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

#### Health Checks
Monitor `/api/health` endpoint:
- Status code: 200 = healthy
- Response time: < 500ms
- Uptime: > 99.9%

### Performance Monitoring

#### Lighthouse CI
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=https://your-domain.com
```

#### Web Vitals
Already integrated in Next.js. View in Vercel Analytics.

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variables Not Working
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side
- Restart dev server after changing `.env.local`
- Verify variables are set in Vercel dashboard

#### Database Connection Issues
```typescript
// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.from('user_profiles').select('count');
console.log({ data, error });
```

#### Docker Container Not Starting
```bash
# Check logs
docker logs pasada-crm

# Check health
docker inspect --format='{{.State.Health.Status}}' pasada-crm
```

### Getting Help
- Check logs: `npm run dev` or `docker-compose logs`
- Review GitHub Actions logs
- Contact: dev@pasada.in

---

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Database RLS policies are active
- [ ] API routes are protected
- [ ] CORS is properly configured
- [ ] Secrets are rotated regularly

---

## Maintenance

### Regular Tasks
- **Weekly**: Review error logs
- **Monthly**: Update dependencies (`npm outdated`)
- **Quarterly**: Security audit (`npm audit`)
- **Yearly**: Review and rotate secrets

### Backup Strategy
- Database: Automated daily backups via Supabase
- Code: Version controlled in GitHub
- Assets: Stored in Supabase Storage with replication

---

## Support

For deployment assistance:
- **Email**: dev@pasada.in
- **Documentation**: https://docs.pasada.in
- **GitHub Issues**: https://github.com/your-org/pasada-crm/issues

---

**Last Updated**: January 2024
**Version**: 1.0.0
