# 🚀 PASADA CRM - Supabase + Vercel Implementation Plan

**Architecture**: Serverless, Scalable, Cost-Effective  
**Stack**: Next.js + Supabase + Vercel  
**Status**: Planning Phase  
**Last Updated**: 2025-10-27

---

## 🧭 Architecture Overview

```
Users (Browser / Mobile)
   ↓
Vercel / Netlify (Static Frontend)
   ↓
Supabase (PostgreSQL + Auth + Storage + Realtime)
   ↓
PDF Generator (API or Edge Function)

Monitoring: Supabase logs + Vercel analytics
Backup: Supabase automated + external sync (optional)
```

✅ **No backend server needed** — everything runs via Supabase and frontend logic.

---

## ⚙️ Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend** | Next.js (Vercel) or SvelteKit (Netlify) | Fast, reactive UI + SSR |
| **Backend** | Supabase | PostgreSQL, Auth, Storage, Realtime |
| **PDF** | Edge Function / API route | Generate branded quotations |
| **Email** | Resend / Supabase SMTP | Quotation delivery |
| **Storage** | Supabase Storage | Images, PDFs |
| **Monitoring** | Vercel Analytics + Supabase Logs | Usage & error tracking |
| **Auth** | Supabase Auth | Secure login, roles |
| **Backup** | Supabase automated + pg_dump | Nightly DB dump |

---

## 🧱 Data Model (Supabase Tables)

### Core Tables

```sql
-- Clients
clients(
  id UUID PRIMARY KEY,
  name TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  type TEXT,
  created_at TIMESTAMP
)

-- Projects
projects(
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  name TEXT,
  site_location TEXT,
  type TEXT,
  area_sqft NUMERIC,
  status TEXT,
  budget NUMERIC,
  created_at TIMESTAMP
)

-- Quotations
quotations(
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title TEXT,
  total_amount NUMERIC,
  tax_percent NUMERIC,
  discount NUMERIC,
  status TEXT,
  version INTEGER,
  valid_until DATE,
  created_by UUID,
  created_at TIMESTAMP
)

-- Quote Items
quote_items(
  id UUID PRIMARY KEY,
  quotation_id UUID REFERENCES quotations(id),
  category TEXT,
  description TEXT,
  quantity NUMERIC,
  unit_price NUMERIC,
  tax_percent NUMERIC,
  total NUMERIC
)

-- Templates
templates(
  id UUID PRIMARY KEY,
  name TEXT,
  header_logo TEXT,
  terms TEXT,
  payment_terms TEXT
)

-- Audit Logs
audit_logs(
  id UUID PRIMARY KEY,
  user_id UUID,
  action TEXT,
  entity TEXT,
  entity_id UUID,
  timestamp TIMESTAMP
)
```

**Security**: Use Supabase Row Level Security (RLS) for access control.

---

## 🧾 Quotation PDF Flow

1. ✅ User fills quotation form
2. ✅ Frontend calls API route or Edge Function
3. ✅ PDF generated using `pdf-lib` or `puppeteer`
4. ✅ Upload to Supabase Storage
5. ✅ Email via Resend or Supabase SMTP

---

## 🔐 Security & Audit

- [ ] Supabase RLS for table-level access
- [ ] Audit logs table with triggers
- [ ] Enable Supabase Auth with role-based access
- [ ] Daily backup via Supabase or external cron

---

## 🚀 Implementation Phases

### ✅ Phase 1: Setup & Infrastructure

#### Supabase Setup
- [ ] Create Supabase project
- [ ] Configure project settings (region, pricing tier)
- [ ] Save API keys and connection strings
- [ ] Set up environment variables

#### Database Schema
- [ ] Create `clients` table
- [ ] Create `projects` table
- [ ] Create `quotations` table
- [ ] Create `quote_items` table
- [ ] Create `templates` table
- [ ] Create `audit_logs` table
- [ ] Set up foreign key relationships
- [ ] Create indexes for performance

#### Row Level Security (RLS)
- [ ] Enable RLS on all tables
- [ ] Create policies for `clients` table
- [ ] Create policies for `projects` table
- [ ] Create policies for `quotations` table
- [ ] Create policies for `quote_items` table
- [ ] Create policies for `templates` table
- [ ] Create policies for `audit_logs` table

#### Authentication
- [ ] Enable Supabase Auth
- [ ] Configure email authentication
- [ ] Set up user roles (admin, staff, client)
- [ ] Create auth policies
- [ ] Configure password requirements
- [ ] Set up email templates

#### Storage
- [ ] Create storage bucket for logos
- [ ] Create storage bucket for PDFs
- [ ] Create storage bucket for project images
- [ ] Configure storage policies
- [ ] Set up file size limits
- [ ] Configure CORS settings

---

### ✅ Phase 2: Frontend Development

#### Project Scaffolding
- [ ] Initialize Next.js project with TypeScript
- [ ] Install Supabase client library
- [ ] Configure Tailwind CSS
- [ ] Set up project structure
- [ ] Configure environment variables
- [ ] Set up ESLint and Prettier

#### Supabase Integration
- [ ] Create Supabase client utility
- [ ] Set up auth context/provider
- [ ] Create database query hooks
- [ ] Set up realtime subscriptions
- [ ] Create storage upload utilities

#### UI Components - Base
- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal component
- [ ] Table component
- [ ] Form component
- [ ] Loading states
- [ ] Error states

#### UI Components - Business Logic
- [ ] Dashboard layout
- [ ] Navigation menu
- [ ] Client list component
- [ ] Client detail component
- [ ] Client form (add/edit)
- [ ] Project list component
- [ ] Project detail component
- [ ] Project form (add/edit)
- [ ] Quotation list component
- [ ] Quotation detail component
- [ ] Quotation builder form
- [ ] Line item manager
- [ ] PDF preview component

#### Pages
- [ ] Login page
- [ ] Dashboard page
- [ ] Clients page
- [ ] Client detail page
- [ ] Projects page
- [ ] Project detail page
- [ ] Quotations page
- [ ] Quotation builder page
- [ ] Settings page
- [ ] Profile page

#### Features
- [ ] Client CRUD operations
- [ ] Project CRUD operations
- [ ] Quotation CRUD operations
- [ ] Line item management
- [ ] Search and filtering
- [ ] Sorting
- [ ] Pagination
- [ ] Export to CSV
- [ ] Bulk operations
- [ ] Notifications/Toasts

---

### ✅ Phase 3: PDF Generation & Email

#### PDF Generation
- [ ] Choose PDF library (pdf-lib vs puppeteer)
- [ ] Create API route or Edge Function
- [ ] Design PDF template
- [ ] Implement header with logo
- [ ] Implement client information section
- [ ] Implement line items table
- [ ] Implement totals section
- [ ] Implement terms and conditions
- [ ] Implement payment terms
- [ ] Add branding elements
- [ ] Test PDF generation

#### PDF Storage
- [ ] Upload generated PDF to Supabase Storage
- [ ] Generate shareable link
- [ ] Store PDF metadata in database
- [ ] Implement version control
- [ ] Set up expiration policies

#### Email Integration
- [ ] Choose email service (Resend vs Supabase SMTP)
- [ ] Set up email credentials
- [ ] Create email templates
- [ ] Implement quotation email
- [ ] Implement approval email
- [ ] Implement reminder email
- [ ] Add PDF attachment or link
- [ ] Test email delivery
- [ ] Handle email errors

#### Quotation Workflow
- [ ] Draft quotation
- [ ] Preview quotation
- [ ] Generate PDF
- [ ] Send for approval
- [ ] Track approval status
- [ ] Revise quotation
- [ ] Finalize quotation
- [ ] Archive quotation

---

### ✅ Phase 4: Monitoring, Backup & Optimization

#### Monitoring
- [ ] Enable Supabase logs
- [ ] Set up Vercel analytics
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Create custom dashboards
- [ ] Set up alerts for critical errors
- [ ] Monitor API usage
- [ ] Track user activity

#### Backup & Recovery
- [ ] Enable Supabase automated backups
- [ ] Set up pg_dump script
- [ ] Configure backup schedule (nightly)
- [ ] Set up external backup storage (Google Drive/S3)
- [ ] Use rclone for sync (optional)
- [ ] Test backup restoration
- [ ] Document recovery procedures

#### Performance Optimization
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Implement caching strategies
- [ ] Optimize image loading
- [ ] Implement lazy loading
- [ ] Code splitting
- [ ] Bundle size optimization
- [ ] Lighthouse audit

#### Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Test RLS policies
- [ ] Test authentication flows
- [ ] Test PDF generation
- [ ] Test email delivery
- [ ] Load testing

---

## 🪙 Cost Breakdown (Serverless)

| Item | Monthly Cost |
|------|--------------|
| Supabase (Free tier or $25) | $0–25 |
| Vercel / Netlify | Free tier |
| Domain + SSL | $1 |
| Email (Resend / SMTP) | Free tier |
| Backup (optional) | $5 |
| **Total** | **≈ $10–30/month** |

---

## 📋 Pre-Launch Checklist

### Security
- [ ] All RLS policies tested
- [ ] Auth flows secured
- [ ] API keys in environment variables
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### Performance
- [ ] Lighthouse score > 90
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Caching implemented
- [ ] CDN configured

### Functionality
- [ ] All CRUD operations working
- [ ] PDF generation working
- [ ] Email delivery working
- [ ] File uploads working
- [ ] Search and filters working
- [ ] Mobile responsive

### Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Admin guide
- [ ] Deployment guide
- [ ] Backup/recovery procedures

---

## 🎯 Success Metrics

- [ ] User registration and login working
- [ ] Can create/edit/delete clients
- [ ] Can create/edit/delete projects
- [ ] Can create quotations with line items
- [ ] Can generate PDF quotations
- [ ] Can email quotations to clients
- [ ] Can track quotation status
- [ ] Dashboard shows real-time data
- [ ] Mobile responsive on all pages
- [ ] Page load time < 2 seconds
- [ ] Zero critical security vulnerabilities

---

## 📞 Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Resend Docs](https://resend.com/docs)

### Community
- Supabase Discord
- Next.js Discord
- Stack Overflow

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-27 | Initial implementation plan created |

---

**Next Steps**: Start with Phase 1 - Supabase project setup and database schema creation.
