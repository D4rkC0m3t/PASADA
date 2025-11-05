# 🌐 PASADA - Website & CRM Route Structure

## 📋 **Complete Route Organization**

### **PUBLIC WEBSITE (Visible to Everyone)**

```
┌─────────────────────────────────────────────────────────┐
│         MAIN WEBSITE - pasada.in                        │
│                                                         │
│  Navbar:                                                │
│  ┌─────────────────────────────────────────────────┐  │
│  │ [PASADA LOGO]  Home  Services  About  Contact  │  │
│  │                            [Client Login Button]│  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Routes:                                                │
│  • /           → Homepage (loading animation or hero)  │
│  • /services   → Services page                          │
│  • /about      → About Us                               │
│  • /contact    → Contact form                           │
│  • /projects   → Project showcase                       │
│  • /works/[id] → Individual project pages               │
│                                                         │
│  🔐 Client Login Button →  /login?type=client           │
│                           ↓                             │
│                    /client/dashboard                    │
└─────────────────────────────────────────────────────────┘
```

---

### **INTERNAL CRM (Hidden from Public)**

```
┌─────────────────────────────────────────────────────────┐
│      INTERNAL CRM PORTAL - Not Linked Publicly          │
│                                                         │
│  Direct URL Access Only: /crm                           │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐           │
│  │  Admin    │  │   Mail   │  │  Client   │           │
│  │  Portal   │  │  Center  │  │  Portal   │           │
│  └─────┬─────┘  └──────────┘  └─────┬─────┘           │
│        │                              │                 │
│        ↓                              ↓                 │
│  /login?type=admin         /login?type=client          │
│        ↓                              ↓                 │
│  /admin/dashboard          /client/dashboard            │
│                                                         │
│  Routes (Admin only):                                   │
│  • /admin/analytics      • /admin/quotations            │
│  • /admin/clients        • /admin/invoices              │
│  • /admin/projects       • /admin/materials             │
│  • /admin/estimations    • /admin/vendors               │
│  • /admin/bookings       • /admin/settings              │
│                                                         │
│  Hidden Entry Points:                                   │
│  • /crm          → CRM portal (admins know this URL)    │
│  • /login?type=admin  → Direct admin login (bookmarked) │
│  • /mail         → Mail system (future)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 **Current Implementation Status**

### ✅ **Already Working:**

1. **CRM Portal** (`/crm`)
   - Animated background
   - 3 portal cards (Admin, Mail, Client)
   - Fully functional
   - ❌ NOT linked from main website

2. **Login System** (`/login`)
   - `?type=admin` → Admin login → `/admin/dashboard`
   - `?type=client` → Client login → `/client/dashboard`
   - Google OAuth support
   - Role-based redirects

3. **Admin Dashboard** (`/admin/dashboard`)
   - Protected by AuthGuard
   - Sidebar navigation
   - 40+ pages restored

4. **Client Dashboard** (`/client/dashboard`)
   - Protected by AuthGuard
   - Client-specific views

---

## 🔧 **What Needs to be Done**

### **Option 1: Keep Current Structure**
**No changes needed!**

```
✅ Main Website
   - Use existing PASADA website (pasada-next folder or separate domain)
   - Add "Client Login" button → /login?type=client

✅ CRM Portal
   - Keep at /crm (hidden URL)
   - Admins bookmark or remember the URL
   - Not linked from main site
```

### **Option 2: Add Simple Homepage**
**If you want a minimal homepage on the CRM domain:**

**File: `app/(public)/home/page.tsx`**
```tsx
"use client";

import { Navbar } from "@/app/components/navbar";
import { HeroSection } from "@/app/components/hero-section";
import { Footer } from "@/app/components/footer";

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-neutral-900 text-white">
      <Navbar />  {/* Only shows Client Login */}
      <HeroSection />
      <Footer />
    </div>
  );
}
```

**Component: `app/components/navbar.tsx`** (Already created ✅)
```tsx
// Shows: Home, About, Services, Contact, [Client Login]
// Does NOT show: CRM, Admin Login
```

---

## 📊 **Route Access Matrix**

| Route | Public? | Who Can Access | Notes |
|-------|---------|----------------|-------|
| `/` | ✅ Yes | Everyone | Homepage/Loading |
| `/about` | ✅ Yes | Everyone | Public page |
| `/services` | ✅ Yes | Everyone | Public page |
| `/contact` | ✅ Yes | Everyone | Public page |
| `/login?type=client` | ✅ Yes | Everyone | Client login |
| `/signup` | ✅ Yes | Everyone | Client signup |
| `/crm` | ❌ Hidden | Admins (direct URL) | CRM portal |
| `/login?type=admin` | ❌ Hidden | Admins (direct URL) | Admin login |
| `/admin/*` | ❌ No | Admin/Staff only | Protected |
| `/client/*` | ❌ No | Clients only | Protected |

---

## 🔐 **Security Configuration**

### **Public Routes (No Auth Required):**
```typescript
const publicRoutes = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/projects',
  '/works/*',
  '/login',
  '/signup'
];
```

### **Protected Routes:**
```typescript
// Admin routes (require role="admin" or "staff")
const adminRoutes = [
  '/admin/*',
  '/crm'  // Optional: can be public but not linked
];

// Client routes (require role="client")
const clientRoutes = [
  '/client/*'
];
```

---

## 🎨 **Navbar Variants**

### **Public Website Navbar:**
```tsx
// Shows:
[PASADA LOGO] Home  About  Services  Contact  [Client Login Button]

// Links:
- Home → /
- About → /about
- Services → /services
- Contact → /contact
- Client Login → /login?type=client
```

### **CRM Portal Navbar:**
```tsx
// Shows:
[PASADA LOGO] Home  About  Contact  [Back to Website]

// Links:
- Home → /
- About → /about
- Contact → /contact
- Back to Website → /
```

---

## 🚀 **Recommended Setup**

### **For Your Use Case:**

**Main Website** (pasada.in or separate domain):
- Existing PASADA website with projects/portfolio
- Add "Client Login" button in navbar
- Button links to: `/login?type=client` on CRM domain

**CRM Domain** (crm.pasada.in or localhost:3000):
- `/` → Redirect to main website OR simple homepage
- `/crm` → Internal CRM portal (hidden, admins use direct URL)
- `/login?type=client` → Client login
- `/login?type=admin` → Admin login (bookmarked by admins)
- `/admin/*` → Protected admin pages
- `/client/*` → Protected client pages

---

## 📝 **Implementation Steps**

### **Step 1: Keep What Works** ✅
```bash
# Already done:
✅ /crm - CRM portal with 3 cards
✅ /login?type=admin - Admin login
✅ /login?type=client - Client login
✅ /admin/dashboard - Admin dashboard
✅ /client/dashboard - Client dashboard
```

### **Step 2: Add Public Navbar** (Optional)
```bash
# If you want homepage with Client Login only:
1. Use app/components/navbar.tsx (already created)
2. Create hero section
3. Create footer
4. Link only /login?type=client
```

### **Step 3: Hide CRM from Public**
```bash
# Simply don't link /crm from anywhere public
# Admins access via:
- Bookmark: http://localhost:3000/crm
- Direct URL: http://localhost:3000/login?type=admin
```

---

## ✅ **Current Status: Already Complete!**

**What you have now:**
```
✅ CRM Portal at /crm (hidden)
✅ Admin login at /login?type=admin (hidden)
✅ Client login at /login?type=client (can be public)
✅ All dashboards working
✅ All routes protected by AuthGuard
✅ Role-based access control
```

**What's NOT linked publicly (by design):**
```
❌ /crm - Not linked on main site (admins use direct URL)
❌ /login?type=admin - Not visible to public (admins bookmark it)
❌ /admin/* - Protected routes
```

**What IS public:**
```
✅ Main website (existing PASADA site)
✅ Client Login button → /login?type=client
✅ Client Dashboard → /client/dashboard (after login)
```

---

## 🎯 **For Your Clients:**

**What They See:**
```
1. Visit: pasada.in (your main website)
2. See: Beautiful interior design portfolio
3. Click: "Client Login" button in navbar
4. Go to: /login?type=client
5. Enter credentials
6. Access: /client/dashboard
   - View their projects
   - See quotations
   - Check progress
   - Download documents
```

**What They DON'T See:**
- ❌ /crm portal
- ❌ Admin login option
- ❌ Admin dashboard
- ❌ CRM management pages

---

## 🎯 **For Admins:**

**What You Know:**
```
1. Bookmark: http://localhost:3000/crm
2. OR bookmark: http://localhost:3000/login?type=admin
3. Login with admin credentials
4. Access: /admin/dashboard
5. Use: All CRM features
```

**Internal URLs (not public):**
- `/crm` - CRM portal
- `/login?type=admin` - Admin login
- `/admin/dashboard` - Admin dashboard
- All `/admin/*` pages

---

## 📚 **Summary**

### **Perfect Setup:**

```
🌐 PUBLIC WEBSITE (pasada.in)
   ↓
   Only link: "Client Login" button
   ↓
   Goes to: /login?type=client
   ↓
   After login: /client/dashboard

🔒 HIDDEN CRM (/crm)
   ↓
   Direct URL only (admins know this)
   ↓
   3 portals: Admin | Mail | Client
   ↓
   Admin login: /login?type=admin
   ↓
   Admin dashboard: /admin/dashboard
```

**Status:** ✅ **Already implemented and working!**

**No changes needed unless you want to add a homepage on the CRM domain.**

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Complete as-is  
**Public Route:** Only Client Login visible  
**Hidden Routes:** /crm, admin login (admins use direct URLs)
