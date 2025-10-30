# 📦 Sprint 2 - Installation & Setup Instructions

**Date:** 2025-10-27  
**Features:** PDF Generation & Email Integration  
**Estimated Setup Time:** 15-20 minutes

---

## 🎯 What You're Installing

After this setup, you'll be able to:
- ✅ Generate professional PDF quotations
- ✅ Send quotations via email with PDF attachments
- ✅ Track sent status automatically
- ✅ Log all email activities

---

## ⚡ Quick Start (5 Steps)

### **Step 1: Install Dependencies (5 minutes)**

Open terminal in your project directory:

```powershell
cd d:/Projects/Pasada/CRM/Pasada

# Install all required packages
npm install @react-pdf/renderer resend @react-email/render @react-email/components
```

**Expected output:**
```
added 4 packages in 15s
```

---

### **Step 2: Set Up Resend Account (5 minutes)**

1. **Go to:** https://resend.com
2. **Sign up** with your email
3. **Verify** your email address
4. **Get API Key:**
   - Click on "API Keys" in sidebar
   - Click "Create API Key"
   - Name it: "PASADA CRM Development"
   - Copy the key (starts with `re_`)

**Important:** Save this key - you'll only see it once!

---

### **Step 3: Configure Environment Variables (2 minutes)**

Create or update `.env.local` in your project root:

```bash
# Add these lines to your .env.local file

# Resend Email Service
RESEND_API_KEY=re_paste_your_key_here
RESEND_FROM_EMAIL="PASADA Interiors <quotations@pasada.in>"

# App URL (change for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Windows Command:**
```powershell
# Create .env.local if it doesn't exist
if (!(Test-Path .env.local)) { New-Item .env.local -ItemType File }

# Open in notepad to edit
notepad .env.local
```

---

### **Step 4: Run Database Migration (2 minutes)**

Two options:

**Option A: Using Supabase CLI (Recommended)**
```powershell
supabase db push
```

**Option B: Manual SQL Execution**
1. Go to your Supabase project dashboard
2. Click "SQL Editor"
3. Copy contents of `database/migrations/add_quotation_send_tracking.sql`
4. Paste and click "Run"

**Verify Migration:**
```sql
-- Run this in SQL Editor to verify
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'quotations' 
AND column_name IN ('sent_at', 'sent_to');

-- Should return 2 rows
```

---

### **Step 5: Restart Development Server (1 minute)**

```powershell
# Stop current server (Ctrl+C if running)

# Start fresh
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Ready in 2.3s
```

---

## ✅ Verify Installation

### **Test 1: Check Dependencies**

```powershell
npm list @react-pdf/renderer resend @react-email/render
```

**Expected:** All three packages listed with versions

---

### **Test 2: Check Environment Variables**

```powershell
# Windows PowerShell
$env:RESEND_API_KEY
```

**Expected:** Your API key starting with `re_`

If empty, restart your terminal/IDE.

---

### **Test 3: Test PDF Generation**

1. Go to http://localhost:3000/admin/quotations
2. Find any quotation
3. Click the **green Download icon**
4. PDF should download as `Quotation-QT-XXXX.pdf`
5. Open the PDF and verify:
   - ✅ PASADA branding
   - ✅ All quotation details
   - ✅ Line items table
   - ✅ Calculations correct

---

### **Test 4: Test Email Sending (Development)**

**Important:** For testing, Resend can only send to your verified email address.

1. Go to http://localhost:3000/admin/clients
2. Find a client or create a test client
3. **Update client email to YOUR email address**
4. Create or use existing quotation for this client
5. Go to Quotations list
6. Click the **yellow Send Email icon**
7. Confirm in the modal
8. Wait for success message (5-10 seconds)
9. **Check your email inbox** (might take 1-2 minutes)
10. Verify:
    - ✅ Email received
    - ✅ Subject is correct
    - ✅ PDF is attached
    - ✅ Email looks professional
    - ✅ Links work

---

## 🚨 Troubleshooting

### **Issue: npm install fails**

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Try again
npm install @react-pdf/renderer resend @react-email/render @react-email/components
```

---

### **Issue: RESEND_API_KEY not found**

**Solution:**
1. Verify `.env.local` exists in project root
2. Check there's no typo in variable name
3. Restart your IDE/terminal
4. Restart dev server

---

### **Issue: PDF download doesn't work**

**Solution:**
1. Check browser console for errors
2. Verify `@react-pdf/renderer` is installed:
   ```powershell
   npm list @react-pdf/renderer
   ```
3. Check API route exists at `app/api/quotations/[id]/pdf/route.ts`
4. Restart dev server

---

### **Issue: Email not received**

**Possible causes:**
1. **Check spam folder** (most common)
2. **Verify API key** is correct in `.env.local`
3. **Check Resend dashboard** at https://resend.com/emails
   - See if email was sent
   - Check for errors
4. **Verify recipient email** matches your Resend account email (for testing)
5. **Check console** for error messages

---

### **Issue: Database migration fails**

**Solution:**
1. Make sure you're connected to correct database
2. Check if columns already exist:
   ```sql
   \d quotations
   ```
3. If columns exist, migration already ran (skip it)
4. Check Supabase connection in `.env.local`

---

### **Issue: TypeScript errors**

**Solution:**
```powershell
# Regenerate types
npm run type-check

# If that fails, restart TypeScript server in VS Code:
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## 🔐 Production Setup (When Ready)

### **1. Verify Domain in Resend**

For production, verify your domain to send to any email:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `pasada.in`)
4. Add DNS records (TXT, CNAME) to your domain registrar
5. Wait for verification (15-30 minutes)
6. Test sending to any email

---

### **2. Production Environment Variables**

Create `.env.production`:

```bash
# Production Resend API Key (different from dev)
RESEND_API_KEY=re_your_production_key

# Use verified domain
RESEND_FROM_EMAIL="PASADA Interiors <quotations@pasada.in>"

# Production URL
NEXT_PUBLIC_APP_URL=https://crm.pasada.in
```

---

### **3. Deploy Database Migration**

```bash
# On production database
psql -h your-prod-db.supabase.co -U postgres -d postgres -f database/migrations/add_quotation_send_tracking.sql
```

---

## 📊 Verification Checklist

Use this checklist to verify everything is working:

**Dependencies:**
- [ ] `@react-pdf/renderer` installed
- [ ] `resend` installed
- [ ] `@react-email/render` installed
- [ ] `@react-email/components` installed

**Configuration:**
- [ ] `.env.local` file exists
- [ ] `RESEND_API_KEY` is set
- [ ] `RESEND_FROM_EMAIL` is set
- [ ] `NEXT_PUBLIC_APP_URL` is set
- [ ] Dev server restarted

**Database:**
- [ ] `sent_at` column exists in quotations
- [ ] `sent_to` column exists in quotations
- [ ] `activity_log` table created

**Functionality:**
- [ ] PDF download works
- [ ] PDF opens correctly
- [ ] PDF has correct data
- [ ] Send Email button works
- [ ] Confirmation modal appears
- [ ] Email sends successfully
- [ ] Email received in inbox
- [ ] PDF attached to email
- [ ] Quotation status updates to "Sent"

---

## 🎯 Next Steps After Installation

1. **Test thoroughly:**
   - Create test quotations
   - Download PDFs
   - Send test emails to yourself

2. **Customize branding:**
   - Update company info in PDF template
   - Update email template colors
   - Add company logo (optional)

3. **Set up production:**
   - Verify domain in Resend
   - Create production API key
   - Deploy to production

4. **Train users:**
   - Show how to download PDFs
   - Show how to send emails
   - Explain status changes

---

## 💡 Tips & Best Practices

### **Development:**
- Always test PDF download before testing email
- Use your own email for testing
- Check Resend dashboard for delivery status
- Keep API keys secure (never commit to git)

### **Production:**
- Verify domain before launching
- Use separate API keys for dev/prod
- Monitor email delivery rates
- Set up email alerts for failures

### **Maintenance:**
- Regularly check activity logs
- Monitor Resend usage (free tier: 100/day)
- Back up database regularly
- Update packages monthly

---

## 📚 Documentation References

- **PDF Generation Guide:** `PDF-GENERATION-GUIDE.md`
- **Email Integration Guide:** `EMAIL-INTEGRATION-GUIDE.md`
- **Sprint 2 Summary:** `SPRINT2-COMPLETE.md`
- **Resend Docs:** https://resend.com/docs
- **@react-pdf Docs:** https://react-pdf.org

---

## 🎉 You're Done!

If all checks pass, you now have:
- ✅ Professional PDF generation
- ✅ Email integration with attachments
- ✅ Automatic status tracking
- ✅ Complete quotation workflow

**Time to celebrate! 🚀**

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed guides (PDF/Email)
3. Check console logs for errors
4. Verify all environment variables
5. Ensure database migration ran successfully

**Common Issues:**
- 90% are environment variable problems
- Check `.env.local` and restart server
- Verify API key is correct
- Check spam folder for test emails

---

**Installation Complete!** Ready to generate and send professional quotations! 📄✉️
