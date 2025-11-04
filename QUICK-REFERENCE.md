# 🚀 PASADA CRM - Quick Reference Guide

**For Developers & AI Agents**

---

## 📍 Project Locations

### Main CRM Application
```
d:/Projects/Pasada/CRM/Pasada/
```

### Landing Page (Static HTML)
```
d:/Projects/Pasada/CRM/Pasada/public/pasada.design/
```

### Archive/Backup
```
d:/Projects/Pasada/CRM/Archive/
```

---

## 🔑 Key Entry Points

### Landing Page
- **URL:** `http://localhost:3000/`
- **File:** `app/page.tsx` (12.8KB)
- **Type:** Static HTML integration

### Admin Portal
- **URL:** `http://localhost:3000/admin/dashboard`
- **Layout:** `app/admin/layout.tsx`
- **Auth:** Required (Admin/Staff role)

### Client Portal
- **URL:** `http://localhost:3000/client/dashboard`
- **Layout:** `app/client/dashboard/page.tsx`
- **Auth:** Required (Client role)

### Authentication
- **Login:** `http://localhost:3000/login`
- **Signup:** `http://localhost:3000/signup`
- **OAuth Callback:** `app/auth/callback/route.ts`

---

## 🗄️ Database Quick Access

### Supabase Connection
```typescript
// Browser client
import { createClient } from '@/lib/supabase/client'

// Server client
import { createClient } from '@/lib/supabase/server'
```

### Key Tables
```sql
clients          -- Client information
projects         -- Project tracking
quotations       -- Quote headers
quote_items      -- Quote line items
invoices         -- GST invoices
materials        -- Material catalog
vendors          -- Supplier info
bookings         -- Appointments
user_profiles    -- Extended user data
audit_logs       -- Audit trail
```

### Common Queries
```typescript
// Get all clients
const { data } = await supabase.from('clients').select('*')

// Get projects with client info
const { data } = await supabase
  .from('projects')
  .select('*, clients(*)')
  
// Get quotations with items
const { data } = await supabase
  .from('quotations')
  .select('*, quote_items(*)')
```

---

## 🔐 Authentication Patterns

### Check Auth Status
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  redirect('/login')
}
```

### Get User Profile
```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', session.user.id)
  .single()
```

### Role Check
```typescript
if (profile.role !== 'admin' && profile.role !== 'staff') {
  redirect('/unauthorized')
}
```

---

## 🎨 Component Usage

### Button
```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

### Card
```tsx
import { Card } from '@/components/ui/Card'

<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

### Auth Guard
```tsx
import AuthGuard from '@/components/AuthGuard'

<AuthGuard allowedRoles={['admin', 'staff']}>
  <ProtectedContent />
</AuthGuard>
```

---

## 📝 Form Patterns

### React Hook Form + Zod
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})

const onSubmit = async (data) => {
  // Handle form submission
}
```

---

## 🔌 API Route Patterns

### GET Request
```typescript
// app/api/clients/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase.from('clients').select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

### POST Request
```typescript
export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('clients')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
```

---

## 📄 PDF Generation

### Generate Quotation PDF
```typescript
import { generateQuotationPDF } from '@/lib/pdf/quotation-template'

const pdfBlob = await generateQuotationPDF(quotationData)

// Upload to Supabase Storage
const { data } = await supabase.storage
  .from('quotations')
  .upload(`${quotationId}.pdf`, pdfBlob)
```

---

## 📧 Email Sending

### Send Quotation Email
```typescript
import { Resend } from 'resend'
import QuotationEmail from '@/lib/email/quotation-email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'PASADA <noreply@pasada.in>',
  to: client.email,
  subject: 'Your Quotation',
  react: QuotationEmail({ quotation }),
  attachments: [{ filename: 'quotation.pdf', content: pdfBuffer }]
})
```

---

## 🧮 GST Calculations

### Calculate GST
```typescript
import { calculateGST } from '@/lib/gst/calculator'

const result = calculateGST({
  amount: 10000,
  gstRate: 18,
  isInterState: false // CGST+SGST or IGST
})

// result = { cgst: 900, sgst: 900, igst: 0, total: 11800 }
```

---

## 🎯 Common Tasks

### Create New Client
```typescript
const { data: client } = await supabase
  .from('clients')
  .insert({
    name: 'Client Name',
    contact_name: 'Contact Person',
    email: 'email@example.com',
    phone: '+91 1234567890',
    type: 'residential',
    status: 'active'
  })
  .select()
  .single()
```

### Create New Project
```typescript
const { data: project } = await supabase
  .from('projects')
  .insert({
    client_id: clientId,
    name: 'Project Name',
    type: 'kitchen',
    status: 'planning',
    budget: 500000
  })
  .select()
  .single()
```

### Create Quotation
```typescript
const { data: quotation } = await supabase
  .from('quotations')
  .insert({
    project_id: projectId,
    quotation_number: 'Q-2024-001',
    title: 'Kitchen Renovation',
    status: 'draft',
    tax_percent: 18
  })
  .select()
  .single()

// Add items
await supabase.from('quote_items').insert([
  {
    quotation_id: quotation.id,
    item_number: 1,
    description: 'Modular Kitchen',
    quantity: 1,
    unit_price: 250000
  }
])
```

---

## 🐛 Debugging

### Check Auth State
```typescript
console.log('Session:', session)
console.log('User:', session?.user)
console.log('Profile:', profile)
```

### Check RLS Policies
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'clients';
```

### Test Database Connection
```
http://localhost:3000/api/test-db
```

### Debug Environment
```
http://localhost:3000/api/debug-env
```

---

## 🔧 Troubleshooting

### 403 Forbidden Errors
- Check RLS policies are enabled
- Verify user role in `user_profiles`
- Check `is_active` status

### Authentication Issues
- Clear browser cookies
- Check Supabase Auth settings
- Verify environment variables

### PDF Generation Fails
- Check @react-pdf/renderer version
- Verify template syntax
- Check file permissions

### Email Not Sending
- Verify Resend API key
- Check email template
- Review Resend dashboard logs

---

## 📦 Package Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format with Prettier
```

---

## 🌐 Important URLs

### Development
- Landing: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin/dashboard`
- Client: `http://localhost:3000/client/dashboard`
- Login: `http://localhost:3000/login`

### Supabase
- Dashboard: `https://supabase.com/dashboard`
- Project: `https://eoahwxdhvdfgllolzoxd.supabase.co`

---

## 📞 Support Resources

### Documentation
- Main README: `README.md`
- Architecture: `ARCHITECTURE.md`
- Setup Guide: `SUPABASE-SETUP-GUIDE.md`
- Security: `SECURITY-AUDIT.md`

### External Docs
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs
- React Hook Form: https://react-hook-form.com

---

**Last Updated:** 2025-11-03
