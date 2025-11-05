# 🗂️ PASADA CRM - Codebase Index

## 🌐 **Main Application Structure**

### **Core Directories**
```
app/
├── admin/              # Admin dashboard and management
├── api/               # API routes
├── auth/              # Authentication logic
├── client/            # Client portal
├── components/        # Shared components
├── crm/               # CRM portal (admin/client entry)
├── dashboard/         # Main dashboard components
├── login/             # Login pages
├── signup/            # User registration
└── works/             # Project showcases
```

### **Key Configuration Files**
```
├── .env.local         # Environment variables
├── next.config.js     # Next.js config
├── tailwind.config.js # Tailwind CSS config
├── tsconfig.json      # TypeScript config
└── package.json       # Dependencies & scripts
```

---

## 🔍 **Key Components**

### **CRM Portal (`/app/crm`)**
- `page.tsx` - Main CRM portal with admin/client login
- `components/`
  - `navbar.tsx` - Top navigation
  - `portal-card.tsx` - Login option cards
  - `mail-preview.tsx` - Email preview component

### **Admin Section (`/app/admin`)**
- `dashboard/page.tsx` - Admin dashboard
- `clients/` - Client management
- `projects/` - Project management
- `quotations/` - Quotation system
- `invoices/` - Billing management

### **Client Section (`/app/client`)**
- `dashboard/page.tsx` - Client portal
- `projects/` - Client projects
- `documents/` - Client documents

---

## 🛠️ **Development Setup**

### **Installation**
```bash
npm install
```

### **Environment Variables**
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other required variables
```

### **Running Locally**
```bash
npm run dev
```

---

## 📚 **Documentation**

1. `WEBSITE-ROUTE-STRUCTURE.md` - Complete route organization
2. `CURRENT-SETUP-PERFECT.md` - Architecture overview
3. `ROUTE-CONNECTIONS-VERIFIED.md` - Route testing guide
4. `QUICK-REFERENCE.md` - Quick start guide
5. `CODEBASE-INDEX.md` - This file

---

## 🔗 **Key Routes**

### **Public Routes**
- `/` - Homepage
- `/login` - Login page
- `/signup` - User registration
- `/about` - About page
- `/contact` - Contact form

### **Protected Routes**
- `/admin/*` - Admin dashboard
- `/client/*` - Client portal
- `/crm` - CRM portal (direct access)

### **API Endpoints**
- `/api/auth/*` - Authentication
- `/api/admin/*` - Admin operations
- `/api/client/*` - Client operations

---

## 🧩 **Key Dependencies**

### **Frontend**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

### **Backend**
- Supabase (Auth + Database)
- Next.js API Routes
- Prisma (ORM)

### **Development**
- ESLint
- Prettier
- TypeScript
- Husky (Git hooks)

---

## 🗺️ **Directory Details**

### **`/app`**
- Main application routes using Next.js App Router
- Each subdirectory represents a route segment
- `page.tsx` files define the page content

### **`/components`**
- Reusable UI components
- Organized by feature/domain

### **`/lib`**
- Utility functions
- Database client
- API clients

### **`/public`**
- Static assets (images, fonts, etc.)
- Accessible at `/filename`

### **`/styles`**
- Global styles
- CSS modules
- Theme definitions

---

## 🔍 **Search Tips**

### **Find Components**
```bash
grep -r "export function" app/components/
```

### **Find API Routes**
```bash
find app/api -type f -name "route.ts"
```

### **Find Database Queries**
```bash
grep -r "prisma." app/
```

---

## 🚀 **Deployment**

### **Build**
```bash
npm run build
```

### **Start Production Server**
```bash
npm start
```

### **Environment**
- Node.js 18+
- npm 9+
- PostgreSQL (Supabase)

---

## 📝 **Notes**

- All routes are protected by authentication middleware
- Role-based access control (Admin/Client)
- Responsive design for all screen sizes
- Dark/light theme support

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0  
**Status:** Production Ready 🚀
