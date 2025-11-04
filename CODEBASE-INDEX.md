# 🏢 PASADA Interior Design CRM - Codebase Index

**Last Updated:** 2025-11-03  
**Version:** 1.0.0  
**Location:** `d:/Projects/Pasada/CRM/Pasada/`

---

## 📋 Project Overview

**Name:** PASADA Interior Design CRM  
**Type:** Full-stack Next.js 14 Application with Supabase Backend  
**Purpose:** Comprehensive CRM platform for interior design professionals

### Business Functions
- Client & Project Management
- Quotation & Invoice Generation (GST Compliant)
- Material & Vendor Catalog
- Consultation Booking System
- Client Portal
- Analytics & Reporting

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14.2.33 (App Router), React 18.3.1, TypeScript 5.5.3
- **Styling:** Tailwind CSS 3.4.4, Framer Motion 12.23.24
- **UI:** Lucide React 0.394.0, React Hot Toast 2.4.1
- **Forms:** React Hook Form 7.52.1, Zod 3.25.76
- **Charts:** Recharts 3.3.0
- **Calendar:** React Big Calendar 1.19.4, React Calendar 5.0.0
- **Drag & Drop:** React Beautiful DnD 13.1.1

### Backend
- **Database:** PostgreSQL (Supabase 2.43.4)
- **Auth:** Supabase Auth with Google OAuth
- **PDF:** @react-pdf/renderer 4.3.1
- **Email:** Resend 6.3.0, @react-email/components 0.5.7
- **HTTP:** Axios 1.7.2
- **Utilities:** date-fns 3.6.0, clsx 2.1.1

---

## 📁 Project Structure

```
Pasada/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page (12.8KB)
│   ├── globals.css              # Global styles
│   │
│   ├── login/                   # Login with Google OAuth
│   ├── signup/                  # Signup + email verification
│   │
│   ├── admin/                   # Admin Portal (Protected)
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── dashboard/          # Overview dashboard
│   │   ├── clients/            # Client CRUD
│   │   ├── projects/           # Project management
│   │   ├── quotations/         # Quotation builder
│   │   ├── estimations/        # Quick estimates
│   │   ├── invoices/           # GST invoices + e-invoice
│   │   ├── materials/          # Material catalog
│   │   ├── vendors/            # Vendor management
│   │   ├── bookings/           # Booking calendar
│   │   ├── analytics/          # Analytics dashboard
│   │   └── settings/           # Settings
│   │
│   ├── client/                  # Client Portal (Protected)
│   │   ├── dashboard/          # Client overview
│   │   ├── projects/           # View projects
│   │   ├── quotations/         # View/approve quotations
│   │   ├── bookings/           # Book consultations
│   │   ├── documents/          # Project documents
│   │   ├── messages/           # Messages
│   │   └── profile/            # Profile settings
│   │
│   ├── api/                     # API Routes
│   │   ├── clients/            # Client API
│   │   ├── projects/           # Project API
│   │   ├── quotations/         # Quotation API + PDF
│   │   ├── estimations/        # Estimation API
│   │   ├── invoices/           # Invoice API + e-invoice
│   │   ├── materials/          # Material API
│   │   ├── bookings/           # Booking API
│   │   ├── analytics/          # Analytics API
│   │   └── contact/            # Contact form
│   │
│   └── components/              # Page-specific components
│       ├── Sidebar.tsx
│       ├── StatCard.tsx
│       ├── LeadsTable.tsx
│       └── ...
│
├── components/                  # Reusable Components
│   ├── ui/                     # Base UI components
│   ├── AuthGuard.tsx           # Route protection
│   ├── CRMLayout.tsx           # CRM wrapper
│   ├── DocumentUpload.tsx      # File uploads
│   ├── Footer.tsx              # Site footer
│   ├── Navbar.tsx              # Navigation
│   └── NotificationBell.tsx    # Notifications
│
├── lib/                         # Utilities
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── database.types.ts   # Generated types
│   ├── auth.ts                 # Auth utilities
│   ├── db.ts                   # DB helpers
│   ├── security.ts             # Security utils
│   ├── validators.ts           # Zod schemas
│   ├── gst/                    # GST calculations
│   ├── e-invoice/              # E-invoice integration
│   ├── pdf/                    # PDF templates
│   └── email/                  # Email templates
│
├── database/                    # Database Files
│   ├── schema.sql              # Complete schema
│   ├── rls-policies.sql        # Security policies
│   ├── storage-setup.sql       # File storage
│   ├── seed_materials.sql      # Seed data
│   └── migrations/             # 20+ migration files
│
├── public/                      # Static Assets
│   ├── pasada.design/          # Landing page
│   ├── logo/                   # Logos
│   └── video/                  # Videos
│
├── Configuration:
│   ├── .env.local              # Environment vars
│   ├── next.config.js          # Next.js config
│   ├── tailwind.config.js      # Tailwind config
│   ├── tsconfig.json           # TypeScript config
│   ├── middleware.ts           # Auth middleware
│   └── package.json            # Dependencies
│
└── Documentation:              # 50+ MD files
    ├── README.md
    ├── ARCHITECTURE.md
    ├── SUPABASE-SETUP-GUIDE.md
    └── ...
```

---

## 🎯 Key Features

### ✅ Authentication & Authorization
- Email/Password + Google OAuth
- Email verification required
- Role-based access (Admin, Staff, Client)
- Protected routes via middleware
- Session management

### ✅ Client Management
- Complete client database
- Contact information tracking
- Client types (Residential, Commercial, etc.)
- Status tracking (Active, Inactive, Archived)
- Full CRUD operations
- Search & filter

### ✅ Project Management
- Project lifecycle tracking (Planning → Completed)
- Budget vs Actual cost monitoring
- Timeline management
- Priority levels
- Area tracking (sqft)
- Multiple project types

### ✅ Quotation System
- Drag-and-drop builder
- Material catalog integration
- GST compliance (CGST, SGST, IGST)
- Automatic calculations
- Version control
- PDF generation
- Email delivery
- Approval workflow

### ✅ Estimation System
- Quick estimates
- Item-wise breakdown
- PDF export
- Convert to quotation

### ✅ Invoice Management
- GST invoicing
- E-invoice integration
- IRN generation
- QR codes
- Payment tracking
- PDF download

### ✅ Material Catalog
- Product database
- Categories & specifications
- Pricing & tax info
- Supplier associations
- Stock tracking
- Images

### ✅ Vendor Management
- Supplier database
- Contact details
- Rating system
- Payment terms
- Performance tracking

### ✅ Booking System
- Consultation scheduler
- Calendar integration
- Time slot management
- Email notifications
- Booking history

### ✅ Client Portal
- Project dashboard
- View quotations
- Approve/reject quotes
- Document access
- Book consultations
- Message center
- Notifications

### ✅ Analytics & Reporting
- Dashboard metrics
- Revenue charts
- Project status distribution
- Lead analytics
- Visitor tracking
- Performance reports

### ✅ Security
- Row Level Security (RLS)
- Role-based permissions
- Audit logging
- Data encryption
- CSRF protection
- XSS prevention

---

## 🗄️ Database Schema

### Core Tables (15+)

**clients** - Client information  
**projects** - Project tracking  
**quotations** - Quote headers  
**quote_items** - Quote line items  
**estimations** - Quick estimates  
**invoices** - GST invoices  
**invoice_items** - Invoice line items  
**materials** - Material catalog  
**vendors** - Supplier info  
**bookings** - Appointments  
**user_profiles** - Extended user data  
**audit_logs** - Audit trail  
**visitors** - Website analytics  
**templates** - Document templates  
**notifications** - User notifications

### Statistics
- **Tables:** 15+
- **Columns:** 200+
- **RLS Policies:** 50+
- **Functions:** 10+
- **Triggers:** 5+

---

## 🔌 API Routes

### Client Management
- `GET/POST /api/clients`
- `GET/PATCH/DELETE /api/clients/[id]`

### Project Management
- `GET/POST /api/projects`
- `GET/PATCH/DELETE /api/projects/[id]`

### Quotation Management
- `GET/POST /api/quotations`
- `GET/PATCH/DELETE /api/quotations/[id]`
- `POST /api/quotations/[id]/pdf` - Generate PDF
- `POST /api/quotations/[id]/send` - Send email
- `POST /api/quotations/[id]/approve` - Approve
- `POST /api/quotations/[id]/reject` - Reject

### Invoice Management
- `GET/POST /api/invoices`
- `GET/PATCH/DELETE /api/invoices/[id]`
- `POST /api/invoices/[id]/pdf` - Generate PDF
- `POST /api/invoices/[id]/e-invoice` - Generate e-invoice
- `GET /api/invoices/[id]/irn` - Get IRN status

### Material & Vendor
- `GET/POST /api/materials`
- `GET/PATCH/DELETE /api/materials/[id]`
- `GET/POST /api/vendors` (similar pattern)

### Booking
- `GET/POST /api/bookings`
- `GET/PATCH/DELETE /api/bookings/[id]`

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/visitors` - Visitor analytics

### Contact
- `POST /api/contact` - Contact form submission

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User signs up/logs in (email or Google OAuth)
2. Supabase Auth creates user in `auth.users`
3. Trigger creates profile in `user_profiles`
4. Session token stored in cookie
5. Middleware validates on each request

### Authorization Levels

**Admin Role:**
- Full system access
- User management
- Settings configuration
- All CRUD operations

**Staff Role:**
- Manage clients & projects
- Create quotations & invoices
- Access material catalog
- View analytics

**Client Role:**
- View own projects
- View/approve quotations
- Book consultations
- Access documents

### Middleware Protection
```typescript
// middleware.ts
- Protects /admin/* routes (Admin/Staff only)
- Protects /client/* routes (Client role)
- Redirects to /login if unauthenticated
- Checks user_profiles for role & active status
```

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce role-based access
- Clients see only their own data
- Admins/Staff see all data
- Automatic user_id filtering

---

## 🎨 Component Library

### Base UI Components (`components/ui/`)
- **Button** - Primary, secondary, destructive variants
- **Card** - Container with header, content, footer
- **Input** - Text, number, date, select
- **Table** - Sortable, filterable data tables
- **Modal** - Confirmation dialogs
- **Badge** - Status badges

### Layout Components
- **AuthGuard** - Route protection wrapper
- **CRMLayout** - CRM layout wrapper
- **Navbar** - Site navigation
- **Footer** - Site footer
- **Sidebar** - Admin sidebar navigation

### Feature Components
- **DocumentUpload** - File upload with validation
- **NotificationBell** - Notification center
- **LoadingScreen** - Loading states
- **StatCard** - Dashboard statistics
- **LeadsTable** - Lead management table
- **ProjectStatusChart** - Project analytics
- **RevenueChart** - Revenue analytics

---

## ⚙️ Configuration Files

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
RESEND_API_KEY=xxx
NEXT_PUBLIC_APP_NAME=PASADA CRM
```

### Next.js Config (`next.config.js`)
- Image optimization domains
- Security headers (CSP, HSTS, X-Frame-Options)
- Redirects (/admin → /admin/dashboard)
- Server actions config

### Tailwind Config (`tailwind.config.js`)
- PASADA brand colors (gold, pasada palette)
- Custom animations (fade, slide)
- Extended spacing & typography
- Dark mode support

### TypeScript Config (`tsconfig.json`)
- Strict mode enabled
- Path aliases (@/ → src/)
- JSX: preserve
- Module: ESNext

---

## 🛠️ Development Workflow

### Setup
```bash
npm install
cp .env.example .env.local
# Configure Supabase credentials
npm run dev
```

### Database Setup
```bash
# Run in Supabase SQL Editor:
1. database/schema.sql
2. database/rls-policies.sql
3. database/storage-setup.sql
4. database/seed_materials.sql
```

### Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm start            # Start production
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
npm run format       # Format code
```

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Supabase CLI** - Database management

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

### Database
- Hosted on Supabase
- Automatic backups (paid plans)
- Connection pooling enabled
- RLS policies active

---

## 📊 Project Statistics

- **Total Files:** 200+
- **Lines of Code:** 50,000+
- **Components:** 50+
- **API Routes:** 30+
- **Database Tables:** 15+
- **Documentation Files:** 50+

---

## 📚 Key Documentation Files

- **README.md** - Main documentation
- **ARCHITECTURE.md** - System architecture
- **SUPABASE-SETUP-GUIDE.md** - Database setup
- **SECURITY-AUDIT.md** - Security documentation
- **DEPLOYMENT-STATUS.md** - Deployment guide
- **IMPLEMENTATION-TODO.md** - Feature checklist
- **GST-EINVOICE-IMPLEMENTATION.md** - GST integration
- **CLIENT-PORTAL-FINAL-SUMMARY.md** - Client portal
- **QUOTATION-BUILDER-GST-COMPLETE.md** - Quotation system

---

## 🎯 Current Status

**Phase:** Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2025-11-03

### Completed
✅ Authentication & Authorization  
✅ Client & Project Management  
✅ Quotation System with GST  
✅ Invoice System with E-Invoice  
✅ Material & Vendor Catalog  
✅ Booking System  
✅ Client Portal  
✅ Analytics Dashboard  
✅ Security Implementation  
✅ PDF Generation  
✅ Email Integration

### In Progress
🔄 Advanced Analytics  
🔄 WhatsApp Integration  
🔄 Mobile App

### Planned
📋 AI Quotation Assistant  
📋 Multi-language Support  
📋 Payment Gateway Integration

---

**Built with ❤️ for PASADA Interior Design**
