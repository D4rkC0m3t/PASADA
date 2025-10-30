# 🗺️ PASADA CRM - Complete Routing Structure

## 📊 Overview

The application uses a **hybrid routing approach**:
- **Next.js App Router** for React pages (CRM functionality)
- **Static HTML files** for PASADA website (from public folder)
- **Server-side redirects** to bridge between them

---

## 🏗️ Route Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                              │
│                         ↓                                    │
│              Next.js App Router                              │
│                         ↓                                    │
│         ┌──────────────┴──────────────┐                     │
│         ↓                              ↓                     │
│   React Page exists?            Redirect configured?        │
│         ↓                              ↓                     │
│    Render React                  Serve Static HTML          │
│    Component                     from /public               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 1. Next.js App Router Routes (React Pages)

### **Root Level**
```
/                              → app/page.tsx
                                 (CRM Landing Page)
```

### **Authentication**
```
/login                         → app/login/page.tsx
/signup                        → app/signup/page.tsx
```

### **Admin Routes**
```
/admin                         → REDIRECTS to /admin/dashboard
/admin/dashboard               → app/admin/dashboard/page.tsx

/admin/clients                 → app/admin/clients/page.tsx
/admin/clients/new             → app/admin/clients/new/page.tsx
/admin/clients/[id]            → app/admin/clients/[id]/page.tsx
/admin/clients/[id]/edit       → app/admin/clients/[id]/edit/page.tsx

/admin/projects                → app/admin/projects/page.tsx
/admin/projects/new            → app/admin/projects/new/page.tsx
/admin/projects/[id]           → app/admin/projects/[id]/page.tsx
/admin/projects/[id]/edit      → app/admin/projects/[id]/edit/page.tsx

/admin/materials               → app/admin/materials/page.tsx
/admin/materials/new           → app/admin/materials/new/page.tsx
/admin/materials/[id]          → app/admin/materials/[id]/page.tsx
/admin/materials/[id]/edit     → app/admin/materials/[id]/edit/page.tsx

/admin/quotations              → app/admin/quotations/page.tsx
/admin/quotations/new          → app/admin/quotations/new/page.tsx
```

### **Client Portal**
```
/client                        → REDIRECTS to /client/dashboard
/client/dashboard              → app/client/dashboard/page.tsx
```

### **PASADA Website (React Fallback Pages)**
```
/en                            → app/en/page.tsx
                                 (Redirects to static HTML)

/en/about                      → app/en/about/page.tsx
                                 (Redirects to static HTML)

/en/projects                   → app/en/projects/page.tsx
                                 (Redirects to static HTML)

/en/contant-us                 → app/en/contant-us/page.tsx
                                 (Redirects to static HTML)

/works/[slug]                  → app/works/[slug]/page.tsx
                                 (Redirects to static HTML)
```

---

## 📄 2. Static HTML Files (Public Folder)

### **PASADA Website Pages**
```
/pasada.design/en/homepage.html     (Main homepage)
/pasada.design/en/about.html        (About us page)
/pasada.design/en/projects.html     (Projects overview)
/pasada.design/en/contant-us.html   (Contact page)
```

### **Work Detail Pages**
```
/pasada.design/works/classic-white-kitchen.html
/pasada.design/works/elegant-cashmere-kitchen.html
/pasada.design/works/modern-kitchen.html
/pasada.design/works/minimalist-kitchen.html
/pasada.design/works/minimalist-kitchen-2.html
/pasada.design/works/minimalist-kitchen-3.html
```

---

## 🔀 3. Server-Side Redirects (next.config.js)

### **Admin & Client Shortcuts**
```javascript
'/admin'   → '/admin/dashboard'    (permanent)
'/client'  → '/client/dashboard'   (permanent)
```

### **PASADA Website Redirects**
```javascript
'/en'              → '/pasada.design/en/homepage.html'
'/en/homepage'     → '/pasada.design/en/homepage.html'
'/en/about'        → '/pasada.design/en/about.html'
'/en/projects'     → '/pasada.design/en/projects.html'
'/en/contant-us'   → '/pasada.design/en/contant-us.html'
'/works/:slug'     → '/pasada.design/works/:slug.html'
```

---

## 🌐 4. Complete URL Map (User-Facing)

### **CRM System**

| URL | Type | File/Component |
|-----|------|----------------|
| `http://localhost:3000/` | React | `app/page.tsx` |
| `http://localhost:3000/login` | React | `app/login/page.tsx` |
| `http://localhost:3000/signup` | React | `app/signup/page.tsx` |
| `http://localhost:3000/admin/dashboard` | React | `app/admin/dashboard/page.tsx` |
| `http://localhost:3000/admin/clients` | React | `app/admin/clients/page.tsx` |
| `http://localhost:3000/admin/projects` | React | `app/admin/projects/page.tsx` |
| `http://localhost:3000/admin/materials` | React | `app/admin/materials/page.tsx` |
| `http://localhost:3000/admin/quotations` | React | `app/admin/quotations/page.tsx` |
| `http://localhost:3000/client/dashboard` | React | `app/client/dashboard/page.tsx` |

### **PASADA Website (Static HTML)**

| URL | Type | File |
|-----|------|------|
| `http://localhost:3000/en` | HTML | `public/pasada.design/en/homepage.html` |
| `http://localhost:3000/en/about` | HTML | `public/pasada.design/en/about.html` |
| `http://localhost:3000/en/projects` | HTML | `public/pasada.design/en/projects.html` |
| `http://localhost:3000/en/contant-us` | HTML | `public/pasada.design/en/contant-us.html` |

### **Work Detail Pages (Static HTML)**

| URL | File |
|-----|------|
| `http://localhost:3000/works/classic-white-kitchen` | `public/pasada.design/works/classic-white-kitchen.html` |
| `http://localhost:3000/works/elegant-cashmere-kitchen` | `public/pasada.design/works/elegant-cashmere-kitchen.html` |
| `http://localhost:3000/works/modern-kitchen` | `public/pasada.design/works/modern-kitchen.html` |
| `http://localhost:3000/works/minimalist-kitchen` | `public/pasada.design/works/minimalist-kitchen.html` |
| `http://localhost:3000/works/minimalist-kitchen-2` | `public/pasada.design/works/minimalist-kitchen-2.html` |
| `http://localhost:3000/works/minimalist-kitchen-3` | `public/pasada.design/works/minimalist-kitchen-3.html` |

---

## 🔗 5. Internal Navigation Links (In HTML Files)

All static HTML files now use these absolute paths:

### **Navigation Links**
```html
<a href="/en">Home</a>
<a href="/en/about">About us</a>
<a href="/en/projects">Projects</a>
<a href="/en/contant-us">Get In Touch</a>
<a href="/admin/dashboard">CRM Dashboard</a>
```

### **Work Page Links**
```html
<a href="/works/classic-white-kitchen">
<a href="/works/elegant-cashmere-kitchen">
<a href="/works/modern-kitchen">
<a href="/works/minimalist-kitchen">
<a href="/works/minimalist-kitchen-2">
<a href="/works/minimalist-kitchen-3">
```

### **Language Switcher**
```html
<a href="/en">En</a>
<a href="/">Ro</a>
```

### **Logo**
```html
<a href="/en">
  <img src="/logo/pasada_logo-removebg-preview.png" />
</a>
```

---

## 🔄 6. Request Flow Examples

### **Example 1: User visits /en/about**
```
1. Browser requests: http://localhost:3000/en/about
2. Next.js checks: app/en/about/page.tsx exists
3. React page executes: useEffect redirect
4. Redirect configured: next.config.js line 73-76
5. Browser loads: /pasada.design/en/about.html
6. Static file served from: public/pasada.design/en/about.html
7. Page renders with: Webflow CSS, GSAP animations, correct logo
```

### **Example 2: User visits /admin/clients**
```
1. Browser requests: http://localhost:3000/admin/clients
2. Next.js finds: app/admin/clients/page.tsx
3. React component renders: Client management interface
4. Uses: React components, Supabase data, Tailwind CSS
```

### **Example 3: User clicks project in HTML**
```
1. User on: /en (homepage.html)
2. Clicks link: <a href="/works/modern-kitchen">
3. Browser requests: http://localhost:3000/works/modern-kitchen
4. Next.js redirect: /pasada.design/works/modern-kitchen.html
5. Static file served: public/pasada.design/works/modern-kitchen.html
6. Page loads with: Project details, image gallery, animations
```

---

## 📦 7. File Structure Summary

```
Pasada/
├── app/                                    (Next.js App Router - React Pages)
│   ├── page.tsx                           → / (CRM Landing)
│   ├── login/page.tsx                     → /login
│   ├── signup/page.tsx                    → /signup
│   ├── admin/
│   │   ├── dashboard/page.tsx             → /admin/dashboard
│   │   ├── clients/page.tsx               → /admin/clients
│   │   ├── projects/page.tsx              → /admin/projects
│   │   ├── materials/page.tsx             → /admin/materials
│   │   └── quotations/page.tsx            → /admin/quotations
│   ├── client/
│   │   └── dashboard/page.tsx             → /client/dashboard
│   ├── en/
│   │   ├── page.tsx                       → /en (redirect)
│   │   ├── about/page.tsx                 → /en/about (redirect)
│   │   ├── projects/page.tsx              → /en/projects (redirect)
│   │   └── contant-us/page.tsx            → /en/contant-us (redirect)
│   └── works/
│       └── [slug]/page.tsx                → /works/:slug (redirect)
│
├── public/                                 (Static Assets)
│   ├── pasada.design/
│   │   ├── en/
│   │   │   ├── homepage.html              (107 KB)
│   │   │   ├── about.html                 (103 KB)
│   │   │   ├── projects.html              (101 KB)
│   │   │   └── contant-us.html            (71 KB)
│   │   └── works/
│   │       ├── classic-white-kitchen.html (88 KB)
│   │       ├── elegant-cashmere-kitchen.html
│   │       ├── modern-kitchen.html
│   │       ├── minimalist-kitchen.html
│   │       ├── minimalist-kitchen-2.html
│   │       └── minimalist-kitchen-3.html
│   ├── css/                               (14 Webflow CSS files)
│   ├── js/                                (10 JavaScript files)
│   ├── images/                            (108+ images)
│   ├── videos/                            (2 video files)
│   └── logo/                              (PASADA logos)
│
└── next.config.js                          (Redirects configuration)
```

---

## 🎯 8. Route Counts

| Category | Count | Type |
|----------|-------|------|
| **CRM React Pages** | 20 | TypeScript/React |
| **PASADA Website HTML** | 4 | Static HTML |
| **Work Detail HTML** | 6 | Static HTML |
| **Redirects** | 7 | Server-side |
| **Total Routes** | **37** | Mixed |

---

## ✅ 9. All Routes Status

### **React Routes (20)**
- ✅ `/` - CRM Landing
- ✅ `/login` - Authentication
- ✅ `/signup` - Registration
- ✅ `/admin/dashboard` - Admin home
- ✅ `/admin/clients/*` - Client management (4 routes)
- ✅ `/admin/projects/*` - Project management (4 routes)
- ✅ `/admin/materials/*` - Material catalog (4 routes)
- ✅ `/admin/quotations/*` - Quotation system (2 routes)
- ✅ `/client/dashboard` - Client portal

### **Static HTML Routes (10)**
- ✅ `/en` - Homepage
- ✅ `/en/about` - About page
- ✅ `/en/projects` - Projects overview
- ✅ `/en/contant-us` - Contact form
- ✅ `/works/classic-white-kitchen`
- ✅ `/works/elegant-cashmere-kitchen`
- ✅ `/works/modern-kitchen`
- ✅ `/works/minimalist-kitchen`
- ✅ `/works/minimalist-kitchen-2`
- ✅ `/works/minimalist-kitchen-3`

---

## 🚀 Quick Test Commands

```bash
# Test CRM pages
curl http://localhost:3000/
curl http://localhost:3000/admin/dashboard
curl http://localhost:3000/client/dashboard

# Test PASADA website
curl http://localhost:3000/en
curl http://localhost:3000/en/about
curl http://localhost:3000/en/projects

# Test work pages
curl http://localhost:3000/works/modern-kitchen
```

---

**Last Updated:** 2025-10-28  
**Total Routes:** 37  
**Status:** ✅ All Routes Working
