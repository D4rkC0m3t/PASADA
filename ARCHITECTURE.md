# 🏗️ PASADA CRM - Complete Architecture Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Authentication & Authorization](#authentication--authorization)
4. [Routing System](#routing-system)
5. [Database Layer](#database-layer)
6. [Component Architecture](#component-architecture)
7. [API Routes](#api-routes)
8. [State Management](#state-management)
9. [Audit & Logging](#audit--logging)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**PASADA CRM** is a dual-purpose Next.js 14 application combining:
- **Public Website**: Static HTML pages for PASADA Interior Design showcase
- **CRM System**: Full-featured project management for admin and client portals

### Tech Stack
```
Frontend:     Next.js 14 (App Router) + React 18 + TypeScript
Styling:      Tailwind CSS 3.4 + Custom Webflow CSS
Database:     Supabase (PostgreSQL)
Auth:         Session-based with HttpOnly cookies
Validation:   Zod schemas
UI Components: Lucide React icons
Forms:        React Hook Form
```

---

## 📁 Directory Structure

### Complete File Tree
```
d:/Projects/Pasada/CRM/Pasada/
├── app/                                    # Next.js App Router (37 routes)
│   ├── page.tsx                           # / - CRM Landing Page
│   ├── login/page.tsx                     # /login
│   ├── signup/page.tsx                    # /signup
│   │
│   ├── admin/                             # Admin Portal (21 routes)
│   │   ├── dashboard/page.tsx             # /admin/dashboard
│   │   ├── clients/
│   │   │   ├── page.tsx                   # /admin/clients (list)
│   │   │   ├── [id]/page.tsx              # /admin/clients/[id] (view/edit)
│   │   │   ├── new/page.tsx               # /admin/clients/new
│   │   │   └── archive/page.tsx           # /admin/clients/archive
│   │   ├── projects/
│   │   │   ├── page.tsx                   # /admin/projects (list)
│   │   │   ├── [id]/page.tsx              # /admin/projects/[id]
│   │   │   ├── new/page.tsx               # /admin/projects/new
│   │   │   └── archive/page.tsx           # /admin/projects/archive
│   │   ├── materials/
│   │   │   ├── page.tsx                   # /admin/materials (catalog)
│   │   │   ├── [id]/page.tsx              # /admin/materials/[id]
│   │   │   ├── new/page.tsx               # /admin/materials/new
│   │   │   └── archive/page.tsx           # /admin/materials/archive
│   │   └── quotations/
│   │       ├── page.tsx                   # /admin/quotations (list)
│   │       └── new/page.tsx               # /admin/quotations/new
│   │
│   ├── client/                            # Client Portal (1 route)
│   │   └── dashboard/page.tsx             # /client/dashboard
│   │
│   ├── en/                                # PASADA Website (React wrappers)
│   │   ├── page.tsx                       # /en (redirect to static)
│   │   ├── about/page.tsx                 # /en/about (redirect)
│   │   ├── projects/page.tsx              # /en/projects (redirect)
│   │   └── contant-us/page.tsx            # /en/contant-us (redirect)
│   │
│   ├── works/                             # Work Detail Pages
│   │   └── [slug]/page.tsx                # /works/:slug (redirect)
│   │
│   └── api/                               # API Routes (TODO)
│       └── auth/
│           ├── login/route.ts
│           ├── logout/route.ts
│           └── session/route.ts
│
├── components/                            # Shared Components
│   ├── AuthGuard.tsx                      # Client-side auth wrapper
│   ├── CRMLayout.tsx                      # CRM sidebar layout (admin/client)
│   ├── Navbar.tsx                         # Public website navbar
│   ├── Footer.tsx                         # Public website footer
│   ├── ui/                                # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   └── ...
│
├── lib/                                   # Core Utilities
│   ├── auth.ts                            # Session management
│   ├── db.ts                              # Database client & queries
│   ├── validators.ts                      # Zod schemas
│   └── supabase.ts                        # Supabase config
│
├── public/                                # Static Assets
│   ├── pasada.design/                     # PASADA Website (10 HTML files)
│   │   ├── en/
│   │   │   ├── homepage.html              # 107 KB
│   │   │   ├── about.html                 # 103 KB
│   │   │   ├── projects.html              # 101 KB
│   │   │   └── contant-us.html            # 71 KB
│   │   └── works/
│   │       ├── classic-white-kitchen.html
│   │       ├── elegant-cashmere-kitchen.html
│   │       ├── modern-kitchen.html
│   │       ├── minimalist-kitchen.html
│   │       ├── minimalist-kitchen-2.html
│   │       └── minimalist-kitchen-3.html
│   ├── css/                               # Webflow CSS (14 files)
│   ├── js/                                # JavaScript (10 files)
│   ├── images/                            # Images (108+ files)
│   ├── videos/                            # Videos (2 files)
│   └── logo/                              # PASADA logos
│
├── middleware.ts                          # Route protection
├── next.config.js                         # Redirects & config
├── tailwind.config.js                     # Tailwind config
├── tsconfig.json                          # TypeScript config
└── package.json                           # Dependencies
```

---

## 🔐 Authentication & Authorization

### Session Management (`lib/auth.ts`)

#### Session Structure
```typescript
interface Session {
  user: {
    id: string
    email: string
    role: 'admin' | 'client'
    name?: string
  }
  expiresAt: number  // Unix timestamp
}
```

#### Key Functions
```typescript
getSession()          // Get current session from cookie
requireAuth([roles])  // Redirect to login if not authenticated
requireAdmin()        // Require admin role
requireClient()       // Require client role
createSession(user)   // Create new session cookie (HttpOnly)
destroySession()      // Logout & delete cookie
hasPermission()       // Check specific permissions
logAction()           // Audit trail helper
```

#### Cookie Configuration
```typescript
{
  name: 'pasada_session',
  httpOnly: true,              // Prevents XSS
  secure: production only,     // HTTPS only in prod
  sameSite: 'lax',             // CSRF protection
  maxAge: 24 hours,            // Configurable
  path: '/'
}
```

### Middleware Protection (`middleware.ts`)

Protects routes using Supabase Auth:
```typescript
Protected Routes:
- /admin/*  → Requires active session + admin/staff role
- /client/* → Requires active session
```

Unprotected:
```typescript
- /              → Public landing
- /login         → Auth page
- /signup        → Auth page
- /en/*          → Public website
- /works/*       → Public work pages
```

### AuthGuard Component (`components/AuthGuard.tsx`)

Client-side wrapper for pages:
```tsx
<AuthGuard requiredRole="admin" fallbackUrl="/login">
  <YourProtectedContent />
</AuthGuard>
```

Features:
- Checks session via `/api/auth/session`
- Shows loading state during verification
- Auto-redirects on auth failure
- Role-based access control

---

## 🌐 Routing System

### Total Routes: 37

#### 1. CRM Routes (React Pages) - 22 routes
```
Authentication (2):
  /login                    → app/login/page.tsx
  /signup                   → app/signup/page.tsx

Landing (1):
  /                         → app/page.tsx

Admin Portal (15):
  /admin                    → redirect to /admin/dashboard
  /admin/dashboard          → app/admin/dashboard/page.tsx
  
  Clients (4):
    /admin/clients          → app/admin/clients/page.tsx
    /admin/clients/[id]     → app/admin/clients/[id]/page.tsx
    /admin/clients/new      → app/admin/clients/new/page.tsx
    /admin/clients/archive  → app/admin/clients/archive/page.tsx
  
  Projects (4):
    /admin/projects         → app/admin/projects/page.tsx
    /admin/projects/[id]    → app/admin/projects/[id]/page.tsx
    /admin/projects/new     → app/admin/projects/new/page.tsx
    /admin/projects/archive → app/admin/projects/archive/page.tsx
  
  Materials (4):
    /admin/materials        → app/admin/materials/page.tsx
    /admin/materials/[id]   → app/admin/materials/[id]/page.tsx
    /admin/materials/new    → app/admin/materials/new/page.tsx
    /admin/materials/archive → app/admin/materials/archive/page.tsx
  
  Quotations (2):
    /admin/quotations       → app/admin/quotations/page.tsx
    /admin/quotations/new   → app/admin/quotations/new/page.tsx

Client Portal (2):
  /client                   → redirect to /client/dashboard
  /client/dashboard         → app/client/dashboard/page.tsx

PASADA Website Wrappers (4):
  /en                       → app/en/page.tsx (redirects)
  /en/about                 → app/en/about/page.tsx (redirects)
  /en/projects              → app/en/projects/page.tsx (redirects)
  /en/contant-us            → app/en/contant-us/page.tsx (redirects)

Work Pages (1 dynamic):
  /works/[slug]             → app/works/[slug]/page.tsx (redirects)
```

#### 2. Static HTML Routes (Served via redirects) - 10 routes
```
PASADA Website:
  /en                       → /pasada.design/en/homepage.html
  /en/about                 → /pasada.design/en/about.html
  /en/projects              → /pasada.design/en/projects.html
  /en/contant-us            → /pasada.design/en/contant-us.html

Work Pages (6):
  /works/classic-white-kitchen      → /pasada.design/works/classic-white-kitchen.html
  /works/elegant-cashmere-kitchen   → /pasada.design/works/elegant-cashmere-kitchen.html
  /works/modern-kitchen             → /pasada.design/works/modern-kitchen.html
  /works/minimalist-kitchen         → /pasada.design/works/minimalist-kitchen.html
  /works/minimalist-kitchen-2       → /pasada.design/works/minimalist-kitchen-2.html
  /works/minimalist-kitchen-3       → /pasada.design/works/minimalist-kitchen-3.html
```

### Server-Side Redirects (`next.config.js`)
```javascript
'/admin'          → '/admin/dashboard'
'/client'         → '/client/dashboard'
'/en'             → '/pasada.design/en/homepage.html'
'/en/about'       → '/pasada.design/en/about.html'
'/en/projects'    → '/pasada.design/en/projects.html'
'/en/contant-us'  → '/pasada.design/en/contant-us.html'
'/works/:slug'    → '/pasada.design/works/:slug.html'
```

---

## 🗄️ Database Layer

### Supabase Client (`lib/db.ts`)

#### Client Singleton
```typescript
export const supabase = createClient(url, key)
```

#### Query Helpers
```typescript
db.clients.getAll()       // List all active clients
db.clients.getById(id)    // Get single client
db.clients.create(data)   // Create new client
db.clients.update(id)     // Update client
db.clients.archive(id)    // Soft delete

db.projects.getAll()      // List all projects (with client info)
db.projects.getById(id)   // Get project details
db.projects.create(data)  // Create project
db.projects.update(id)    // Update project
db.projects.archive(id)   // Soft delete

db.materials.getAll()     // Material catalog
db.materials.getById(id)  // Material details
db.materials.create()     // Add material
db.materials.update(id)   // Update material
db.materials.archive(id)  // Soft delete

db.quotations.getAll()    // All quotations (with relations)
db.quotations.getById(id) // Quotation with items
db.quotations.create()    // Generate quotation
```

#### Type Safety
```typescript
export type Client = {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  client_id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  budget?: number
  start_date?: string
  end_date?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export type Material = {
  id: string
  name: string
  description?: string
  category: string
  price: number
  unit: string
  supplier?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export type Quotation = {
  id: string
  project_id: string
  client_id: string
  total_amount: number
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  valid_until?: string
  created_at: string
  updated_at: string
}
```

---

## 🧩 Component Architecture

### Layout Components

#### CRMLayout (`components/CRMLayout.tsx`)
```tsx
<CRMLayout userRole="admin" userName="John Doe">
  <YourPageContent />
</CRMLayout>
```

Features:
- Responsive sidebar navigation
- Mobile hamburger menu
- Role-based nav items (admin vs client)
- Active route highlighting
- Logout button
- Quick link to public website

#### Public Website Layout
```tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

<Navbar />
<YourPageContent />
<Footer />
```

### Shared Components

```
components/
├── AuthGuard.tsx          # Auth wrapper with loading state
├── CRMLayout.tsx          # Admin/client dashboard layout
├── Navbar.tsx             # Public website header
├── Footer.tsx             # Public website footer
└── ui/                    # Base components
    ├── Button.tsx         # Styled button variants
    ├── Card.tsx           # Container card
    ├── Input.tsx          # Form input field
    └── Badge.tsx          # Status badge
```

---

## 🔌 API Routes (To Be Implemented)

### Auth Routes
```
POST /api/auth/login       # Login with email/password
POST /api/auth/logout      # Destroy session
GET  /api/auth/session     # Get current session
POST /api/auth/signup      # Create new account
```

### CRM API Routes
```
GET    /api/clients        # List clients
POST   /api/clients        # Create client
GET    /api/clients/[id]   # Get client
PATCH  /api/clients/[id]   # Update client
DELETE /api/clients/[id]   # Archive client

GET    /api/projects       # List projects
POST   /api/projects       # Create project
GET    /api/projects/[id]  # Get project
PATCH  /api/projects/[id]  # Update project

GET    /api/materials      # Material catalog
POST   /api/materials      # Add material
GET    /api/materials/[id] # Get material
PATCH  /api/materials/[id] # Update material

GET    /api/quotations     # List quotations
POST   /api/quotations     # Generate quotation
GET    /api/quotations/[id]/pdf  # Generate PDF
```

---

## 📝 Form Validation

### Zod Schemas (`lib/validators.ts`)

All forms use type-safe Zod validation:

```typescript
// Client form
clientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  // ...
})

// Project form
projectSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(3).max(200),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  // ...
})

// Material form
materialSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  category: z.string().min(1),
  // ...
})

// Quotation form
quotationSchema = z.object({
  project_id: z.string().uuid(),
  items: z.array(z.object({
    material_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive()
  })).min(1)
})
```

### Validation Helper
```typescript
validate(schema, data)
// Returns: { success: true, data: T }
//     or: { success: false, errors: { field: message } }
```

---

## 📊 Audit & Logging

### Audit Trail (`lib/auth.ts`)

```typescript
logAction('client_created', {
  clientId: 'uuid',
  userId: 'admin-uuid',
  timestamp: 'ISO-8601'
})

logAction('quotation_generated', {
  quotationId: 'uuid',
  projectId: 'uuid',
  totalAmount: 5000
})
```

Console output:
```
[AUDIT 2025-01-28T10:15:00.000Z] client_created {
  clientId: 'abc-123',
  userId: 'admin-456',
  timestamp: '2025-01-28T10:15:00.000Z'
}
```

### Future: Database Audit Log
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  action VARCHAR(100),
  user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Deployment

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# App Config
NEXT_PUBLIC_APP_NAME=PASADA CRM
NEXT_PUBLIC_APP_URL=https://pasada.design

# Email (Optional)
RESEND_API_KEY=your-resend-key
```

### Build & Deploy
```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

### Deployment Platforms
- **Vercel**: Recommended (auto-deploy from git)
- **Netlify**: Alternative
- **Railway**: For full-stack apps
- **Self-hosted**: Docker + Node.js

---

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.43.4",
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-hook-form": "^7.52.1",
    "react-hot-toast": "^2.4.1",
    "zod": "^3.23.8",
    "lucide-react": "^0.394.0",
    "tailwind-merge": "^2.3.0",
    "clsx": "^2.1.1"
  }
}
```

---

## ✅ Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [x] Auth utilities (`lib/auth.ts`)
- [x] Database client (`lib/db.ts`)
- [x] Validators (`lib/validators.ts`)
- [x] Middleware protection
- [x] AuthGuard component
- [x] CRMLayout component
- [x] Archive pages

### Phase 2: API Routes (TODO)
- [ ] `/api/auth/login`
- [ ] `/api/auth/logout`
- [ ] `/api/auth/session`
- [ ] `/api/clients/*`
- [ ] `/api/projects/*`
- [ ] `/api/materials/*`
- [ ] `/api/quotations/*`

### Phase 3: UI Polish (TODO)
- [ ] Admin dashboard analytics
- [ ] Client CRUD forms
- [ ] Project management UI
- [ ] Material catalog with search
- [ ] Quotation builder with drag-drop
- [ ] PDF generation

### Phase 4: Advanced Features (TODO)
- [ ] Real-time updates (Supabase Realtime)
- [ ] File uploads (images, documents)
- [ ] Email notifications
- [ ] Invoice generation
- [ ] Payment integration
- [ ] Multi-language support

---

**Last Updated**: 2025-10-28  
**Version**: 1.0.0  
**Status**: Phase 1 Complete ✅
