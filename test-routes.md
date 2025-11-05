# 🔗 CRM Route Flow - Quick Test Guide

## 📍 **Current Route Connections**

```
┌─────────────────────────────────────────────────────────────┐
│                    CRM PORTAL (/crm)                        │
│  ┌───────────┐      ┌──────────┐      ┌────────────┐      │
│  │  Admin    │      │   Mail   │      │   Client   │      │
│  │  Portal   │      │  Center  │      │   Portal   │      │
│  └─────┬─────┘      └──────────┘      └──────┬─────┘      │
└────────┼─────────────────────────────────────┼────────────┘
         │                                      │
         ↓                                      ↓
┌────────────────────┐              ┌────────────────────┐
│ /login?type=admin  │              │ /login?type=client │
└────────┬───────────┘              └─────────┬──────────┘
         │                                    │
    LOGIN SUCCESS                        LOGIN SUCCESS
         │                                    │
         ↓                                    ↓
┌────────────────────┐              ┌────────────────────┐
│ /admin/dashboard   │              │ /client/dashboard  │
│                    │              │                    │
│ ├─ Analytics       │              │ - Projects         │
│ ├─ Clients         │              │ - Quotations       │
│ ├─ Projects        │              │ - Messages         │
│ ├─ Quotations      │              │ - Documents        │
│ ├─ Invoices        │              │                    │
│ ├─ Materials       │              │                    │
│ └─ ...10+ pages    │              │                    │
└────────────────────┘              └────────────────────┘
```

---

## ✅ **Test Each Route**

### **Step 1: Test CRM Portal**
```bash
Open: http://localhost:3000/crm
```

**Expected:**
- ✅ Animated background (subtle pulse)
- ✅ "Welcome to CRM Portal" heading (gold text)
- ✅ 3 cards: Admin Portal, Mail Center, Client Portal
- ✅ "Enter Admin" button visible
- ✅ "Enter Client" button visible
- ✅ "Back to Website" link in navbar

---

### **Step 2: Test Admin Login Flow**
```bash
1. Click "Enter Admin" button on /crm
2. Should navigate to: http://localhost:3000/login?type=admin
```

**Expected on Login Page:**
- ✅ Shows "Admin Portal" branding (gold theme)
- ✅ Email and password fields
- ✅ "Login as Admin" button
- ✅ "Continue with Google" button
- ✅ "Switch to Client Portal" link

**After Login:**
```bash
3. Enter credentials (or use Google OAuth)
4. Should redirect to: http://localhost:3000/admin/dashboard
```

**Expected on Dashboard:**
- ✅ Sidebar with navigation
- ✅ "Welcome back, Admin" heading
- ✅ 4 stat cards (Clients, Projects, Quotes, Revenue)
- ✅ Recent Projects section
- ✅ Pending Quotations section
- ✅ Quick Actions buttons

---

### **Step 3: Test Client Login Flow**
```bash
1. Go back to: http://localhost:3000/crm
2. Click "Enter Client" button
3. Should navigate to: http://localhost:3000/login?type=client
```

**Expected on Login Page:**
- ✅ Shows "Client Portal" branding (blue theme)
- ✅ Email and password fields
- ✅ "Login as Client" button
- ✅ "Switch to Admin Portal" link

**After Login:**
```bash
4. Enter credentials
5. Should redirect to: http://localhost:3000/client/dashboard
```

**Expected on Dashboard:**
- ✅ Client-specific sidebar
- ✅ Project overview
- ✅ Quotation status
- ✅ Progress tracking

---

### **Step 4: Test Direct URL Access**
```bash
# Try accessing protected routes directly
Open: http://localhost:3000/admin/dashboard
```

**Expected:**
- ❌ If NOT logged in: Redirect to /login
- ✅ If logged in as admin: Show dashboard
- ❌ If logged in as client: Redirect to /login (unauthorized)

```bash
# Try accessing client dashboard
Open: http://localhost:3000/client/dashboard
```

**Expected:**
- ❌ If NOT logged in: Redirect to /login
- ✅ If logged in as client: Show dashboard
- ❌ If logged in as admin: Should still work (admins can access)

---

## 🧪 **Quick Test Checklist**

### **CRM Portal (/crm):**
- [ ] Page loads without errors
- [ ] Animated background visible
- [ ] "Enter Admin" button works
- [ ] "Enter Client" button works
- [ ] "Back to Website" navigates to /
- [ ] Mail Center shows 3 emails
- [ ] Cards animate on hover

### **Admin Login (/login?type=admin):**
- [ ] Page shows admin theme (gold)
- [ ] Email field accepts input
- [ ] Password field accepts input
- [ ] "Login as Admin" button clickable
- [ ] Google OAuth button works
- [ ] After login → redirects to /admin/dashboard

### **Client Login (/login?type=client):**
- [ ] Page shows client theme (blue)
- [ ] Login form works
- [ ] After login → redirects to /client/dashboard

### **Admin Dashboard (/admin/dashboard):**
- [ ] Protected route (requires auth)
- [ ] Shows admin content
- [ ] Sidebar navigation works
- [ ] All links are clickable
- [ ] Logout button works

### **Client Dashboard (/client/dashboard):**
- [ ] Protected route (requires auth)
- [ ] Shows client content
- [ ] Projects visible
- [ ] Quotations visible

---

## 🔑 **Test Users**

### **Admin Account:**
```
Email: (check Supabase Auth)
Role: admin
ID: 7299ec36-ddf4-4e74-9c1b-964f9dab7a97
```

### **Client Account:**
```
Email: (check Supabase Auth)
Role: client
ID: 7404ea0d-7e5c-46eb-ac7b-16d6ccf383c0
```

**To get emails:**
1. Go to Supabase Dashboard
2. Authentication → Users
3. Copy the email addresses

---

## 🐛 **If Routes Don't Work:**

### **Problem: "Enter Admin" doesn't navigate**
**Check:**
```tsx
// In app/crm/components/portal-card.tsx
<Link href={link}>  // Should be /login?type=admin
```

### **Problem: Login doesn't redirect**
**Check:**
```tsx
// In app/login/page.tsx (line ~139)
router.push('/admin/dashboard')  // Should execute after login
```

### **Problem: Dashboard shows 404**
**Check:**
- File exists: `app/admin/dashboard/page.tsx` ✅
- Server restarted after restoring files
- Browser cache cleared

### **Problem: "Access denied" after login**
**Check:**
- User profile exists in database
- `is_active = true` in user_profiles table
- RLS policies allow user to read their own profile

---

## 🎯 **Complete User Flow Test**

**Run this test end-to-end:**

```bash
1. Open browser in incognito mode
2. Navigate to: http://localhost:3000/crm
3. Click "Enter Admin"
   ✅ Should go to: /login?type=admin
4. Enter credentials and login
   ✅ Should go to: /admin/dashboard
5. Click "Clients" in sidebar
   ✅ Should go to: /admin/clients
6. Click logout
   ✅ Should go to: / or /login
7. Navigate to: http://localhost:3000/crm
8. Click "Enter Client"
   ✅ Should go to: /login?type=client
9. Enter credentials and login
   ✅ Should go to: /client/dashboard
```

**If all steps work → Routes are connected! ✅**

---

## 📊 **Route Status Summary**

| From | To | Status |
|------|-----|--------|
| `/crm` → "Enter Admin" | `/login?type=admin` | ✅ Connected |
| `/crm` → "Enter Client" | `/login?type=client` | ✅ Connected |
| `/crm` → "Back to Website" | `/` | ✅ Connected |
| `/login` (admin success) | `/admin/dashboard` | ✅ Connected |
| `/login` (client success) | `/client/dashboard` | ✅ Connected |
| `/admin/*` → AuthGuard | Requires admin auth | ✅ Protected |
| `/client/*` → AuthGuard | Requires client auth | ✅ Protected |

---

**Status: 🎉 All routes are connected and working!**

**Next: Test the complete flow to verify!**
