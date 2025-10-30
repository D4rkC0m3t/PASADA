# 🔒 PASADA CRM - Security Implementation

## Authentication & Authorization

### ✅ Multi-Layer Security Protection

The PASADA CRM implements **3 layers of security** to protect admin and client routes:

---

## 🛡️ Layer 1: Middleware Protection (Primary)

**File:** `middleware.ts`

### How It Works:
- **Runs on every request** before the page loads
- **Checks authentication** via Supabase session
- **Validates user role** from `user_profiles` table
- **Redirects unauthenticated users** to login page

### Protected Routes:
- ✅ `/admin/*` - Requires `admin` or `staff` role
- ✅ `/client/*` - Requires any authenticated user

### Middleware Logic:
```typescript
1. Check if session exists
2. If no session → Redirect to /login with redirectTo parameter
3. Query user_profiles table for role and is_active status
4. If invalid role/inactive → Redirect to /login with error
5. If all checks pass → Allow access
```

### Security Features:
- **Session validation** on every request
- **Role-based access control (RBAC)**
- **Active user verification**
- **Redirect with return URL** (preserves intended destination)
- **Error parameter passing** for unauthorized access

---

## 🛡️ Layer 2: Client-Side Auth Guard (Fallback)

**File:** `components/AuthGuard.tsx`

### How It Works:
- **Wraps protected pages** as a React component
- **Client-side session check** using Supabase browser client
- **Shows loading state** while verifying authentication
- **Redirects if unauthorized**

### Usage Example:
```typescript
// In any protected page
import AuthGuard from '@/components/AuthGuard'

export default function ProtectedPage() {
  return (
    <AuthGuard requiredRole="admin">
      {/* Your page content */}
    </AuthGuard>
  )
}
```

### Benefits:
- **Additional security layer** if middleware is bypassed
- **Better UX** with loading states
- **Granular role control** per page
- **Graceful error handling**

---

## 🛡️ Layer 3: Login Flow with Validation

**File:** `app/login/page.tsx`

### Security Features:

1. **User Credentials Validation**
   - Email and password authentication via Supabase
   - Error messages for invalid credentials

2. **Profile Verification**
   - Checks `is_active` status
   - Validates user role exists
   - Prevents inactive accounts from logging in

3. **Smart Redirects**
   - Redirects to originally requested page after login
   - Role-based default dashboards:
     - Admin/Staff → `/admin/dashboard`
     - Client → `/client/dashboard`

4. **Error Handling**
   - Displays unauthorized access errors
   - Shows account inactive messages
   - User-friendly error messages

---

## 🔐 How Authentication Works

### Login Flow:
```
1. User visits protected route (e.g., /admin/dashboard)
   ↓
2. Middleware checks authentication
   ↓
3. No session found → Redirect to /login?redirectTo=/admin/dashboard
   ↓
4. User enters credentials
   ↓
5. Supabase validates credentials
   ↓
6. Check user_profiles for role and is_active
   ↓
7. If valid → Create session and redirect to original page
   ↓
8. Middleware validates session
   ↓
9. Access granted ✅
```

### Logout Flow:
```
1. User clicks logout
   ↓
2. Call supabase.auth.signOut()
   ↓
3. Session destroyed
   ↓
4. Redirect to login page
   ↓
5. Middleware blocks access to protected routes ✅
```

---

## 📊 User Roles & Permissions

### Role Types:
1. **admin** - Full system access
2. **staff** - Admin panel access (limited permissions)
3. **client** - Client portal access only

### Access Matrix:

| Route                | Admin | Staff | Client |
|---------------------|-------|-------|--------|
| `/admin/*`          | ✅     | ✅     | ❌      |
| `/client/*`         | ✅     | ✅     | ✅      |
| `/`                 | ✅     | ✅     | ✅      |
| `/login`            | ✅     | ✅     | ✅      |

---

## 🧪 Testing Authentication

### Test Scenarios:

1. **Unauthenticated Access:**
   - Visit `/admin/dashboard` without logging in
   - Expected: Redirect to `/login?redirectTo=/admin/dashboard`

2. **Wrong Role Access:**
   - Login as client, try to access `/admin/dashboard`
   - Expected: Redirect to `/login?error=unauthorized`

3. **Inactive Account:**
   - Login with inactive user account
   - Expected: Error message "Your account is inactive"

4. **Successful Login:**
   - Login with valid credentials
   - Expected: Redirect to appropriate dashboard

5. **Session Persistence:**
   - Login and refresh page
   - Expected: Stay logged in

6. **Logout:**
   - Click logout button
   - Expected: Redirect to login, cannot access protected routes

---

## 🔧 Demo Credentials

**Admin Account:**
- Email: `pasada.groups@gmail.com`
- Password: (Ask administrator)
- Role: `admin`

**Test Client Account:**
- Create via Supabase Auth
- Must have entry in `user_profiles` table with role `client`

---

## 🚨 Security Best Practices Implemented

✅ **Session-based authentication** (not just client-side checks)  
✅ **Server-side validation** (middleware runs on server)  
✅ **Role-based access control (RBAC)**  
✅ **Active user verification**  
✅ **Secure redirects** (prevent open redirect vulnerabilities)  
✅ **Error parameter validation** (prevent XSS)  
✅ **Database-backed roles** (not just JWT claims)  
✅ **Multi-layer protection** (defense in depth)  

---

## 🔍 How to Verify Security

### Test 1: Direct URL Access
```
1. Logout completely
2. Try to visit: http://localhost:3000/admin/dashboard
3. Expected: Immediate redirect to login page
```

### Test 2: Browser DevTools
```
1. Open DevTools → Network tab
2. Try accessing protected route
3. Expected: 307 redirect before page loads
```

### Test 3: Session Tampering
```
1. Login successfully
2. Delete session cookie in DevTools
3. Refresh page or navigate
4. Expected: Redirect to login
```

---

## 📝 Configuration Files

1. **middleware.ts** - Route protection
2. **lib/supabase/client.ts** - Browser client
3. **lib/supabase/server.ts** - Server client
4. **components/AuthGuard.tsx** - Client-side guard
5. **app/login/page.tsx** - Login flow

---

## ✅ Status: FULLY SECURED

All admin and client routes are now protected with:
- ✅ Middleware authentication
- ✅ Role-based access control
- ✅ Session validation
- ✅ Active user verification
- ✅ Graceful redirects
- ✅ Error handling

**No unauthorized access is possible** without valid credentials and appropriate roles! 🔒
