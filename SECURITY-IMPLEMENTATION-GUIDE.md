# 🛡️ PASADA Security Implementation Guide

## 📊 Quick Status

**Current Implementation**: 30% Complete  
**Critical Items Remaining**: 7  
**Next Priority**: Enable RLS + Database Audit Logs

---

## 🚀 Quick Start: Implement Top Priority Items

### Step 1: Update Security Headers (5 minutes) ✅ DONE
```bash
# Already updated in next.config.js
npm run dev  # Test that headers are working
```

**Verify**: Open DevTools → Network → Check response headers

---

### Step 2: Enable Row Level Security (20 minutes) 👈 **DO THIS FIRST**

#### 3.1 Run RLS Migration
```bash
# Connect to Supabase SQL Editor
# Copy and run: database/rls_policies.sql
```

**What it does**:
- Enables RLS on all tables
- Creates policies for admin/client access
- Protects sensitive data
- Allows role-based access

#### 2.2 Test RLS Policies
```sql
-- Test as admin (can see all)
SELECT auth.jwt() ->> 'role';  -- Should return 'admin'
SELECT * FROM clients;

-- Test as client (can only see own)
SELECT * FROM projects WHERE client_id = auth.uid();
```

---

### Step 3: Add Encryption for PII (10 minutes)

#### 3.1 Generate Encryption Key
```bash
# Generate a secure random key
openssl rand -base64 32
```

#### 3.2 Add to Environment
```bash
# Add to .env.local
ENCRYPTION_KEY=your-generated-key-here
```

#### 3.3 Encrypt Sensitive Fields
```typescript
import { encryptData, decryptData } from '@/lib/security'

// Before saving to database
const encryptedPhone = await encryptData(client.phone)
const encryptedAddress = await encryptData(client.address)

// When reading from database
const phone = await decryptData(encryptedPhone)
```

---

### Step 4: Add Rate Limiting (15 minutes)

#### 4.1 For Production: Use Vercel Rate Limiting
```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

#### 4.2 For Development: Use In-Memory (Already Done)
```typescript
import { rateLimiter, RATE_LIMITS } from '@/lib/security'

// In API route
const ip = await getClientIp()
const result = await rateLimiter.check(ip, 
  RATE_LIMITS.LOGIN.limit, 
  RATE_LIMITS.LOGIN.windowMs
)

if (!result.success) {
  return Response.json({ error: 'Too many requests' }, { status: 429 })
}
```

---

## 🔄 Postponed for Payment Gateway Integration

### Database Audit Logs (Will implement with payment gateway)

**Why postponed**: 
- Table schema conflicts that need careful resolution
- Not blocking other security features
- Best implemented alongside payment transaction logging

**When to implement**:
- During payment gateway integration (Stripe/Razorpay)
- Will track all payment transactions
- Will audit all CRM actions

**File ready**: `database/audit_logs.sql` (needs debugging)

---

### Step 5: Set Up Error Monitoring (10 minutes) - OPTIONAL

#### 5.1 Sign Up for Sentry (Free tier)
Visit: https://sentry.io/signup/

#### 5.2 Install Sentry
```bash
npx @sentry/wizard@latest -i nextjs
```

#### 6.3 Configure Environment
```bash
# Add to .env.local
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
```

---

### Step 7: Enable Automated Backups (5 minutes)

#### Supabase Pro Plan
- Go to Supabase Dashboard → Settings → Backups
- Enable daily backups (automatically included)
- Set retention period: 7 days minimum

#### Manual Backup Script
```bash
# Create: scripts/backup-database.sh
pg_dump $DATABASE_URL > backups/backup-$(date +%Y%m%d).sql
```

---

## 📋 Files Created

### Security Infrastructure
- ✅ `lib/security.ts` - Security utilities (rate limiting, encryption, validation)
- ✅ `lib/auth.ts` - Session management (already existed, enhanced)
- ✅ `lib/validators.ts` - Input validation (already existed)

### Database Migrations
- ✅ `database/audit_logs.sql` - Complete audit trail system
- ✅ `database/rls_policies.sql` - Row Level Security policies

### Documentation
- ✅ `SECURITY-AUDIT.md` - Complete security checklist (38 items)
- ✅ `SECURITY-IMPLEMENTATION-GUIDE.md` - This file
- ✅ `.env.example` - Updated with security variables

### Configuration
- ✅ `next.config.js` - Enhanced security headers

---

## 🔐 Security Features Implemented

### ✅ Already Working
1. **Secure Cookies**
   - HttpOnly: ✅
   - Secure (prod): ✅
   - SameSite=Lax: ✅
   
2. **Security Headers**
   - X-Frame-Options: ✅
   - X-Content-Type-Options: ✅
   - Strict-Transport-Security: ✅
   - Content-Security-Policy: ✅
   
3. **Input Validation**
   - Zod schemas: ✅
   - XSS sanitization: ✅
   - SQL injection prevention: ✅
   
4. **Authentication**
   - Session-based auth: ✅
   - Role-based access: ✅
   - Auto-expiry: ✅

### 🔄 Ready to Enable (Run Migrations)
1. **Database Audit Logs** - Run `audit_logs.sql`
2. **Row Level Security** - Run `rls_policies.sql`
3. **Encrypted PII** - Add ENCRYPTION_KEY to env
4. **Rate Limiting** - Already coded, just use it

### ❌ Not Yet Implemented
1. **Payment Gateway** - Needs Stripe/Razorpay integration
2. **Webhook Verification** - Needs payment provider
3. **Advanced Monitoring** - Needs Sentry setup
4. **Backup Testing** - Needs manual process

---

## 🎯 Implementation Priority

### Phase 1: Critical (Do Today) - 1 hour
- [x] Security headers
- [ ] Database audit logs
- [ ] Row Level Security
- [ ] Encryption key setup

### Phase 2: High (This Week) - 2 hours
- [ ] Rate limiting implementation
- [ ] Error monitoring (Sentry)
- [ ] File upload validation
- [ ] Session hijacking protection

### Phase 3: Medium (This Month) - 4 hours
- [ ] Payment gateway integration
- [ ] Webhook verification
- [ ] Automated backup testing
- [ ] Security audit log UI

### Phase 4: Nice to Have (Future) - As needed
- [ ] Fraud detection
- [ ] Advanced analytics
- [ ] Compliance documentation
- [ ] Penetration testing

---

## 📖 Usage Examples

### Audit Logging
```typescript
import { logAction } from '@/lib/auth'

// In any server action or API route
await logAction('quotation_generated', {
  quotationId: quote.id,
  clientId: client.id,
  totalAmount: 5000,
  itemCount: 12
})

// Query audit logs
const logs = await db.query('SELECT * FROM recent_audit_activity')
```

### Rate Limiting
```typescript
import { rateLimiter, RATE_LIMITS } from '@/lib/security'
import { getClientIp } from '@/lib/security'

// In API route
const ip = await getClientIp()
const { success, remaining } = await rateLimiter.check(
  ip,
  RATE_LIMITS.LOGIN.limit,
  RATE_LIMITS.LOGIN.windowMs
)

if (!success) {
  return Response.json(
    { error: 'Too many login attempts. Try again in 15 minutes.' },
    { status: 429 }
  )
}
```

### PII Encryption
```typescript
import { encryptData, decryptData } from '@/lib/security'

// Saving client data
const client = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: await encryptData('+1-555-1234'),
  address: await encryptData('123 Main St, City')
}

await db.clients.create(client)

// Reading client data
const dbClient = await db.clients.getById(id)
const decryptedPhone = await decryptData(dbClient.phone)
```

### File Upload Validation
```typescript
import { validateFileUpload } from '@/lib/security'

// In file upload handler
const { valid, error } = validateFileUpload(file)

if (!valid) {
  return Response.json({ error }, { status: 400 })
}

// Proceed with upload
```

---

## 🧪 Testing Security

### Test RLS Policies
```sql
-- Test as admin
SET request.jwt.claims = '{"role": "admin"}';
SELECT * FROM clients;  -- Should see all

-- Test as client
SET request.jwt.claims = '{"role": "client"}';
SET request.jwt.sub = 'client-user-id';
SELECT * FROM clients;  -- Should see only own
```

### Test Rate Limiting
```bash
# Spam login endpoint
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 6th request should return 429 Too Many Requests
```

### Test Security Headers
```bash
curl -I http://localhost:3000 | grep -i "x-frame-options\|content-security-policy\|strict-transport"
```

---

## 📞 Support & Resources

- **Security Audit**: See `SECURITY-AUDIT.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Database Schema**: See `database/schema.sql`
- **Environment Setup**: See `.env.example`

---

**Last Updated**: 2025-10-28  
**Status**: Phase 1 - 30% Complete  
**Next Review**: After implementing critical items
