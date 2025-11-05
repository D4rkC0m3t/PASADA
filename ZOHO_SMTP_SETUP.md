# 🔧 PASADA CRM - Zoho SMTP Integration Guide

## 📧 Hybrid Email Architecture

Your PASADA CRM now supports **TWO email channels**:

1. **Resend API** → Automated/transactional emails (OTPs, invoices, reminders)
2. **Zoho SMTP** → Manual support/sales emails (replies, follow-ups)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PASADA CRM EMAIL SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  AUTOMATED EMAILS              MANUAL EMAILS                 │
│  ================              ==============                 │
│                                                               │
│  ┌─────────────┐              ┌─────────────┐               │
│  │   RESEND    │              │ ZOHO SMTP   │               │
│  │   API       │              │ (nodemailer)│               │
│  └──────┬──────┘              └──────┬──────┘               │
│         │                            │                       │
│         ├─ OTPs                      ├─ Support replies      │
│         ├─ Invoices                  ├─ Sales follow-ups    │
│         ├─ Reminders                 ├─ Client escalations  │
│         └─ Notifications             └─ Manual compose      │
│                                                               │
│  FROM: noreply@pasada.in      FROM: support@pasada.in       │
│        quotations@pasada.in          sales@pasada.in        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   email_logs table   │
                │   (Unified logging)  │
                └──────────────────────┘
```

---

## 🔑 Step 1: Zoho Mail Configuration

### 1.1 Create Zoho Mail Account

1. Go to [Zoho Mail](https://www.zoho.com/mail/)
2. Sign up for **Zoho Mail Premium** (recommended) or use Free tier
3. Add your domain: `pasada.in`
4. Verify domain ownership (DNS records)

### 1.2 Create Email Accounts

Create these mailboxes:
- `support@pasada.in` - Primary support email
- `sales@pasada.in` - Sales team email (optional)
- `noreply@pasada.in` - For automated notifications (optional)

### 1.3 Generate App Password

**Important**: Use App Passwords for security (not your actual password)

1. Log into Zoho Mail → Settings
2. Navigate to **Security** → **App Passwords**
3. Click **Generate New Password**
4. Name it: `PASADA CRM Application`
5. Copy the generated password (you won't see it again!)

### 1.4 SMTP Settings

Zoho SMTP Configuration:
```
Host:     smtp.zoho.in
Port:     465 (SSL) or 587 (TLS)
Security: SSL/TLS
Username: support@pasada.in
Password: [App Password from Step 1.3]
```

---

## ⚙️ Step 2: Environment Configuration

### 2.1 Update `.env.local`

Add these variables to your `.env.local` file:

```env
# ================================================
# EMAIL SERVICE - RESEND (Already configured ✅)
# ================================================
RESEND_API_KEY=re_edwN8HuA_MG62hopnQVTMKgpdMJZ9Dwfk
RESEND_FROM_EMAIL="PASADA Interiors <quotations@pasada.in>"

# ================================================
# EMAIL SERVICE - ZOHO SMTP (New! 🆕)
# ================================================
SMTP_HOST=smtp.zoho.in
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@pasada.in
SMTP_PASSWORD=your-app-password-here-from-zoho
SMTP_FROM_NAME=PASADA Support

# Additional SMTP accounts (optional)
SMTP_SALES_USER=sales@pasada.in
SMTP_SALES_PASSWORD=your-sales-app-password
SMTP_NOREPLY_USER=noreply@pasada.in
SMTP_NOREPLY_PASSWORD=your-noreply-app-password
```

---

## 📦 Step 3: Install Dependencies

```powershell
# Install nodemailer for SMTP support
npm install nodemailer @types/nodemailer

# Restart your dev server
npm run dev
```

---

## 🧪 Step 4: Test SMTP Connection

### 4.1 Test via API

```powershell
# Test SMTP connection
curl http://localhost:3000/api/email/smtp

# Expected response:
# {
#   "success": true,
#   "message": "SMTP connection successful",
#   "details": {
#     "host": "smtp.zoho.in",
#     "port": 465,
#     "user": "support@pasada.in",
#     "secure": true
#   }
# }
```

### 4.2 Send Test Email

```powershell
curl -X POST http://localhost:3000/api/email/smtp `
  -H "Content-Type: application/json" `
  -d '{
    "to": "test@example.com",
    "subject": "Test Email from PASADA CRM",
    "html": "<h1>Hello!</h1><p>This is a test email via Zoho SMTP.</p>",
    "from_name": "PASADA Support",
    "user_id": "your-admin-user-id"
  }'
```

---

## 💻 Step 5: Using SMTP in Your CRM

### 5.1 Send Manual Email via API

```typescript
const response = await fetch('/api/email/smtp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'client@example.com',
    subject: 'Follow-up on Your Quotation',
    html: `
      <p>Dear Mr. Sharma,</p>
      <p>Thank you for your interest in our services...</p>
      <p>Best regards,<br>PASADA Team</p>
    `,
    from_name: 'PASADA Support',
    reply_to: 'support@pasada.in',
    cc: ['sales@pasada.in'],
    lead_id: 'lead-uuid',
    user_id: 'admin-uuid',
  }),
});

const result = await response.json();
console.log(result);
// { success: true, email_id: 'uuid', resend_id: 'smtp-message-id' }
```

### 5.2 Using UI Components

#### Email Compose Modal

```typescript
import EmailComposeModal from '@/components/email/EmailComposeModal';

function MyComponent() {
  const [showCompose, setShowCompose] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowCompose(true)}>
        Compose Email
      </button>
      
      <EmailComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        defaultTo="client@example.com"
        defaultSubject="Follow-up"
        leadId="lead-uuid"
        userId="admin-uuid"
      />
    </>
  );
}
```

#### Resend Email Modal

```typescript
import ResendEmailModal from '@/components/email/ResendEmailModal';

function EmailLogsTable() {
  const [showResend, setShowResend] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  return (
    <>
      <button onClick={() => {
        setSelectedEmail(email);
        setShowResend(true);
      }}>
        Resend
      </button>
      
      <ResendEmailModal
        isOpen={showResend}
        onClose={() => setShowResend(false)}
        emailId={selectedEmail?.id}
        originalTo={selectedEmail?.to_email}
        originalSubject={selectedEmail?.subject}
        originalBody={selectedEmail?.html_body}
        currentResendCount={selectedEmail?.resend_count}
        userId="admin-uuid"
        onSuccess={() => {
          // Refresh email logs
        }}
      />
    </>
  );
}
```

---

## 🔐 Step 6: Security Best Practices

### 6.1 Use App Passwords

✅ **DO**: Use Zoho App Passwords
❌ **DON'T**: Use your actual Zoho account password

### 6.2 Environment Variables

✅ **DO**: Store credentials in `.env.local`
❌ **DON'T**: Commit `.env.local` to Git
❌ **DON'T**: Hardcode credentials in code

### 6.3 Permission Control

Only admins and staff can send SMTP emails:

```typescript
// This is enforced in the API route
const { data: userProfile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', userId)
  .single();

if (!['admin', 'staff'].includes(userProfile.role)) {
  return { error: 'Unauthorized' };
}
```

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 View SMTP Email Logs

```sql
-- All SMTP emails
SELECT * FROM email_logs
WHERE tags @> ARRAY['smtp']
ORDER BY sent_at DESC;

-- SMTP emails by status
SELECT status, COUNT(*) as count
FROM email_logs
WHERE tags @> ARRAY['smtp']
GROUP BY status;

-- Failed SMTP emails
SELECT * FROM email_logs
WHERE tags @> ARRAY['smtp', 'failed']
ORDER BY sent_at DESC;
```

### 7.2 Compare Resend vs SMTP Performance

```sql
SELECT 
  CASE 
    WHEN tags @> ARRAY['smtp'] THEN 'SMTP'
    ELSE 'Resend'
  END as transport,
  status,
  COUNT(*) as total
FROM email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY transport, status
ORDER BY transport, status;
```

---

## 🎨 Step 8: UI Integration Examples

### 8.1 Email Logs Page with Actions

```typescript
function EmailLogsPage() {
  const [emails, setEmails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [showResend, setShowResend] = useState(false);
  
  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-3">
        <button 
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          📧 Compose New Email (SMTP)
        </button>
      </div>
      
      {/* Email Logs Table */}
      <table>
        <thead>
          <tr>
            <th>To</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Transport</th>
            <th>Sent At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {emails.map(email => (
            <tr key={email.id}>
              <td>{email.to_email}</td>
              <td>{email.subject}</td>
              <td>
                <span className={`badge ${email.status}`}>
                  {email.status}
                </span>
              </td>
              <td>
                {email.tags?.includes('smtp') ? 'SMTP' : 'Resend'}
              </td>
              <td>{new Date(email.sent_at).toLocaleString()}</td>
              <td>
                {email.resend_count < 3 && (
                  <button onClick={() => handleResend(email)}>
                    Resend
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Modals */}
      <EmailComposeModal 
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        userId="admin-uuid"
      />
      
      <ResendEmailModal 
        isOpen={showResend}
        onClose={() => setShowResend(false)}
        {...selectedEmail}
        userId="admin-uuid"
      />
    </div>
  );
}
```

---

## 🚨 Troubleshooting

### Issue: "SMTP connection failed"

**Possible causes**:
1. Incorrect credentials
2. Firewall blocking port 465/587
3. Zoho account not verified
4. App password expired

**Solution**:
```powershell
# Test connection
curl http://localhost:3000/api/email/smtp

# Check environment variables
echo $env:SMTP_USER
echo $env:SMTP_PASSWORD

# Try alternate port (587 with TLS)
SMTP_PORT=587
SMTP_SECURE=false
```

### Issue: "Authentication failed"

**Solution**:
1. Regenerate App Password in Zoho
2. Update `.env.local` with new password
3. Restart dev server: `npm run dev`

### Issue: "Email sent but not received"

**Possible causes**:
1. Spam folder
2. Invalid recipient
3. Domain not verified

**Solution**:
```sql
-- Check email log
SELECT * FROM email_logs
WHERE id = 'email-uuid';

-- Check error message
SELECT error_message FROM email_logs
WHERE status = 'failed';
```

---

## 📈 Performance Tips

1. **Rate Limiting**: Zoho allows ~100 emails/hour (Free) or 1000+ (Premium)
2. **Connection Pooling**: Nodemailer reuses SMTP connections automatically
3. **Async Sending**: Emails are sent asynchronously, don't block UI
4. **Batch Sending**: For multiple emails, use delays:
   ```typescript
   for (const email of emails) {
     await sendEmailViaSMTP(email);
     await delay(1000); // 1 second between emails
   }
   ```

---

## ✅ Quick Reference

| Feature | Resend API | Zoho SMTP |
|---------|-----------|-----------|
| **Use Case** | Automated | Manual |
| **From Address** | noreply@pasada.in, quotations@pasada.in | support@pasada.in, sales@pasada.in |
| **Rate Limit** | 3000/day (Free) | 100/hour (Free) |
| **Cost** | $0-$20/month | $1/user/month |
| **Setup** | API Key | SMTP credentials |
| **Tracking** | Built-in webhooks | Manual logging |
| **Best For** | OTPs, invoices, reminders | Support replies, follow-ups |

---

## 🎯 Next Steps

1. ✅ Configure Zoho Mail account
2. ✅ Add SMTP credentials to `.env.local`
3. ✅ Install nodemailer: `npm install nodemailer`
4. ✅ Test connection: `curl http://localhost:3000/api/email/smtp`
5. ✅ Send test email via SMTP API
6. ✅ Add compose/resend buttons to your CRM UI
7. ✅ Monitor email logs in Supabase

---

**Your hybrid email system is now ready for production! 🎉**

**Support Channels**:
- Resend: Automated, scalable, trackable
- Zoho SMTP: Manual, personal, professional

**All emails logged in `email_logs` table with full audit trail!**
