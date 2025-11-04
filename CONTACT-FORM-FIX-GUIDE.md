# Contact Form 500 Error - Fixed

## Issue Summary
Contact form submissions were failing with a **500 Internal Server Error** due to Row Level Security (RLS) policy violation.

### Error Details
```
Error Code: 42501
Message: "new row violates row-level security policy for table 'leads'"
```

## Root Cause
The `leads` table had RLS enabled but was missing or had an incorrectly configured policy to allow **anonymous/public inserts** from the contact form.

## Implementation Status

### ✅ What Was Working
1. API route (`/api/contact/submit`) - correctly configured
2. Form validation - all checks passing
3. Data sanitization - working properly
4. Supabase connection - authenticated correctly
5. Service validation against `services-config.json` - validated

### ❌ What Was Broken
- **RLS Policy**: The database was blocking anonymous inserts into the `leads` table

## Solution Applied

### Fix Script Created
**File**: `database/migrations/FIX_CONTACT_FORM_RLS.sql`

The script performs the following:
1. ✅ Drops all conflicting RLS policies on `leads` table
2. ✅ Grants `INSERT` permission to `anon` role
3. ✅ Creates new policy: `allow_public_insert_leads` with `WITH CHECK (true)`
4. ✅ Recreates admin policies for read/update/delete operations
5. ✅ Fixes `audit_logs` policies as well

## How to Apply the Fix

### Option 1: Via Supabase Dashboard (Recommended)
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `database/migrations/FIX_CONTACT_FORM_RLS.sql`
5. Click **Run**
6. Verify success message appears

### Option 2: Via Command Line
```powershell
# If you have Supabase CLI installed
supabase db push

# Or run the migration directly
psql $DATABASE_URL < database/migrations/FIX_CONTACT_FORM_RLS.sql
```

## Verification Steps

### 1. Check Policies Are Created
Run this query in Supabase SQL Editor:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'leads';
```

**Expected Output**: Should show 4 policies:
- `allow_public_insert_leads` (INSERT, to anon/authenticated)
- `allow_admin_read_leads` (SELECT, to authenticated)
- `allow_admin_update_leads` (UPDATE, to authenticated)
- `allow_admin_delete_leads` (DELETE, to authenticated)

### 2. Test Anonymous Insert
Run this in SQL Editor to simulate contact form submission:
```sql
-- Switch to anon role context
SET ROLE anon;

-- Try to insert a test lead
INSERT INTO leads (
  name, 
  email, 
  phone, 
  service_type, 
  message, 
  status
) VALUES (
  'Test User',
  'test@example.com',
  '1234567890',
  'Interior Design',
  'Test message',
  'new'
);

-- Reset role
RESET ROLE;

-- Check if insert succeeded
SELECT * FROM leads WHERE email = 'test@example.com';
```

**Expected**: Insert should succeed without errors.

### 3. Test Contact Form
1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3000/pasada.design/en/contant-us.html
3. Fill out the form:
   - Name: Your Name
   - Email: your-email@example.com
   - Phone: 9876543210
   - Service: Select any service
   - Message: Test message
   - ✅ Accept terms
4. Click **Submit**
5. **Expected**: Success message should appear

### 4. Verify in Database
Check Supabase Dashboard → Table Editor → `leads` table
- New lead should appear with all form data
- `submitted_at`, `created_at` timestamps should be set
- `status` should be 'new'
- `source` should be 'website_contact_form'

## Technical Details

### RLS Policy Configuration
```sql
-- This policy allows anonymous users to INSERT leads
CREATE POLICY "allow_public_insert_leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

### Key Points
- **TO anon, authenticated**: Policy applies to both anonymous and authenticated users
- **FOR INSERT**: Only allows INSERT operations (not SELECT/UPDATE/DELETE)
- **WITH CHECK (true)**: No additional conditions - all inserts are allowed

### Permissions Granted
```sql
GRANT SELECT, INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
```

## API Route Implementation

### File: `app/api/contact/submit/route.ts`

The API route is correctly implemented with:
1. ✅ Rate limiting (5 requests per minute per IP)
2. ✅ Input validation (email, phone, required fields)
3. ✅ Input sanitization (XSS prevention)
4. ✅ Service validation against `services-config.json`
5. ✅ Service metadata extraction (tag, category, priority)
6. ✅ Audit logging (with graceful error handling)
7. ✅ Proper error responses with status codes

### Form Data Mapping
```javascript
{
  name: formData.get('Name'),           // → leads.name
  email: formData.get('Email-address'), // → leads.email
  phone: formData.get('Phone-number'),  // → leads.phone
  service: formData.get('Services'),    // → leads.service_type
  message: formData.get('Message'),     // → leads.message
  termsAccepted: formData.get('Checkbox') === 'on'
}
```

## Troubleshooting

### If Form Still Fails After Fix

1. **Clear Browser Cache**
   - Press `Ctrl + Shift + Delete`
   - Select "All time"
   - Clear cached files

2. **Restart Dev Server**
   ```powershell
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Check Supabase Connection**
   - Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

4. **Check Browser Console**
   - Press `F12` → Console tab
   - Look for errors during form submission
   - Check Network tab for API response

5. **Check Server Logs**
   - Look at terminal where `npm run dev` is running
   - Should see "Received form data" when form submits
   - If you see "Supabase error details", RLS fix needs to be reapplied

### Common Issues

**Issue**: "Failed to load resource: 500"
- **Cause**: RLS policy not applied or incorrect
- **Solution**: Rerun `FIX_CONTACT_FORM_RLS.sql`

**Issue**: "Missing required fields"
- **Cause**: Form field names don't match API expectations
- **Solution**: Verify form field `name` attributes match API route

**Issue**: "Invalid service type"
- **Cause**: Selected service not in `services-config.json`
- **Solution**: Check service dropdown values match config file

## Files Modified/Created

### Created
- ✅ `database/migrations/FIX_CONTACT_FORM_RLS.sql` - RLS fix script
- ✅ `CONTACT-FORM-FIX-GUIDE.md` - This documentation

### No Changes Needed (Already Correct)
- ✅ `app/api/contact/submit/route.ts` - API route implementation
- ✅ `lib/services-config.json` - Service configuration
- ✅ `public/pasada.design/js/contact-form-handler.js` - Form handler

## Success Criteria

All of the following should work after applying the fix:

- ✅ Contact form submits without 500 error
- ✅ Success message appears after submission
- ✅ Lead appears in Supabase `leads` table
- ✅ Lead has `status = 'new'` and `source = 'website_contact_form'`
- ✅ Service metadata (tag, category, priority) is populated
- ✅ Audit log entry is created (if not failing silently)
- ✅ Form resets after successful submission
- ✅ Admin can view leads in CRM dashboard

## Next Steps

1. **Apply the fix** using Option 1 or 2 above
2. **Test the form** following verification steps
3. **Monitor submissions** in Supabase dashboard
4. **Set up notifications** for new leads (optional)
5. **Configure email notifications** using Resend API (optional)

## Support

If you encounter issues after applying this fix:
1. Check Supabase logs in Dashboard → Logs
2. Check server logs in terminal
3. Verify all environment variables are set
4. Ensure `user_profiles` table exists with `role` column

---

**Status**: ✅ Fix Ready to Apply  
**Impact**: High - Enables critical contact form functionality  
**Risk**: Low - Only affects leads and audit_logs tables  
**Rollback**: Can drop new policies and restore previous ones if needed
