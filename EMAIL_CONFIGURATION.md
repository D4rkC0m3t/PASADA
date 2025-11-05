# 📧 PASADA CRM - Official Email Configuration

## 👥 Team Email Addresses

### **Primary Contacts**
- **Support:** `support@pasada.in` - General inquiries and customer support
- **Sales:** `musaavir.ahmed@pasada.in` - Sales inquiries and business development
- **Admin:** `arjun.neo@pasada.in` - Technical and administrative matters

### **Automated System Emails** (Resend API)
- **Quotations:** `quotations@pasada.in` - Automated quotation emails
- **Notifications:** `noreply@pasada.in` - System notifications (do not reply)

---

## 🏗️ Email Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 PASADA CRM EMAIL SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🤖 AUTOMATED (Resend API)      👥 TEAM (Zoho SMTP)         │
│  ══════════════════════════      ═══════════════════         │
│                                                              │
│  📄 quotations@pasada.in         🎫 support@pasada.in       │
│     • Automated quotations           • General support      │
│     • Invoices                       • Client inquiries     │
│     • Payment reminders              • Technical help       │
│                                                              │
│  🔔 noreply@pasada.in            💼 musaavir.ahmed@pasada.in│
│     • System notifications           • Sales inquiries      │
│     • OTP codes                      • Business proposals   │
│     • Status updates                 • Client meetings      │
│                                                              │
│                                   👨‍💻 arjun.neo@pasada.in    │
│                                      • Admin matters         │
│                                      • Technical issues      │
│                                      • System management     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Configuration Guide

### **1. Environment Variables**

Add to your `.env.local`:

```env
# ================================================
# COMPANY INFORMATION
# ================================================
NEXT_PUBLIC_COMPANY_EMAIL=support@pasada.in
NEXT_PUBLIC_SUPPORT_EMAIL=support@pasada.in
NEXT_PUBLIC_SALES_EMAIL=musaavir.ahmed@pasada.in
NEXT_PUBLIC_ADMIN_EMAIL=arjun.neo@pasada.in

# ================================================
# RESEND API (Automated Emails)
# ================================================
RESEND_API_KEY=re_edwN8HuA_MG62hopnQVTMKgpdMJZ9Dwfk
RESEND_FROM_EMAIL="PASADA Interiors <quotations@pasada.in>"
EMAIL_FROM=noreply@pasada.in

# ================================================
# ZOHO SMTP (Team Emails)
# ================================================
# Support Account
SMTP_HOST=smtp.zoho.in
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@pasada.in
SMTP_PASSWORD=your-zoho-app-password
SMTP_FROM_NAME=PASADA Support

# Sales Account (Musaavir)
SMTP_SALES_USER=musaavir.ahmed@pasada.in
SMTP_SALES_PASSWORD=musaavir-app-password

# Admin Account (Arjun)
SMTP_ADMIN_USER=arjun.neo@pasada.in
SMTP_ADMIN_PASSWORD=arjun-app-password
```

---

## 🎯 Usage Guidelines

### **When to Use Which Email:**

| Scenario | Email Address | Method |
|----------|---------------|--------|
| **Automated quotation sent** | quotations@pasada.in | Resend API |
| **System notification/OTP** | noreply@pasada.in | Resend API |
| **Customer support reply** | support@pasada.in | Manual/SMTP |
| **Sales follow-up** | musaavir.ahmed@pasada.in | Manual/SMTP |
| **Technical assistance** | arjun.neo@pasada.in | Manual/SMTP |
| **Client portal invitation** | support@pasada.in | Manual/SMTP |
| **Invoice reminder** | quotations@pasada.in | Resend API |
| **Project update** | support@pasada.in | Manual/SMTP |

---

## 🔐 Zoho Mail Setup

### **For Each Team Member:**

1. **Log in to Zoho Mail**: https://mail.zoho.com
2. **Generate App Password**:
   - Settings (⚙️) → Security → App Passwords
   - Click "Generate New Password"
   - Name: `PASADA CRM`
   - Copy the password (you won't see it again!)
3. **Update `.env.local`** with your app password

### **Email Forwarding (Recommended)**:

Configure email forwarding so team members receive emails in their preferred inbox:

- `support@pasada.in` → Forward to all team members
- `musaavir.ahmed@pasada.in` → Musaavir's inbox
- `arjun.neo@pasada.in` → Arjun's inbox

---

## 📊 Email Flow Examples

### **Automated Flow (Resend API)**

```typescript
// Send automated quotation
await fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({
    to: 'client@example.com',
    template_name: 'Quotation Email',
    merge_tags: {
      client: { name: 'Mr. Sharma' },
      quotation: { number: 'PASADA-2025-0001', total: '₹2,50,000' }
    },
    // Will be sent from: quotations@pasada.in
    user_id: 'system'
  })
});
```

### **Manual Support Email (SMTP)**

```typescript
// Send manual support reply
await fetch('/api/email/smtp', {
  method: 'POST',
  body: JSON.stringify({
    to: 'client@example.com',
    subject: 'Re: Your Support Inquiry',
    html: '<p>Dear Client, Thank you for contacting us...</p>',
    from_name: 'PASADA Support Team',
    reply_to: 'support@pasada.in', // Replies come here
    user_id: 'support-team-member'
  })
});
```

### **Sales Follow-up (Musaavir)**

```typescript
// Send personal sales follow-up
await fetch('/api/email/smtp', {
  method: 'POST',
  body: JSON.stringify({
    to: 'lead@example.com',
    subject: 'Following Up on Your Interior Design Project',
    html: '<p>Dear Lead, I wanted to follow up on your project...</p>',
    from_name: 'Musaavir Ahmed - PASADA Sales',
    reply_to: 'musaavir.ahmed@pasada.in', // Replies go to Musaavir
    user_id: 'musaavir-id'
  })
});
```

---

## 🎨 UI Integration

### **Email Compose Modal with Team Selection**

```typescript
import EmailComposeModal from '@/components/email/EmailComposeModal';

function Dashboard() {
  const [showCompose, setShowCompose] = useState(false);
  const [fromEmail, setFromEmail] = useState('support@pasada.in');

  return (
    <>
      <div className="flex gap-4">
        {/* Select From Email */}
        <select 
          value={fromEmail} 
          onChange={(e) => setFromEmail(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="support@pasada.in">Support Team</option>
          <option value="musaavir.ahmed@pasada.in">Musaavir (Sales)</option>
          <option value="arjun.neo@pasada.in">Arjun (Admin)</option>
        </select>

        <button onClick={() => setShowCompose(true)}>
          Compose Email
        </button>
      </div>

      <EmailComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        defaultFromEmail={fromEmail}
        userId="current-user-id"
      />
    </>
  );
}
```

---

## 📈 Analytics & Tracking

### **View Emails by Team Member**

```sql
-- Emails sent by support team
SELECT COUNT(*) 
FROM email_logs
WHERE from_email LIKE '%support@pasada.in%'
  AND sent_at >= CURRENT_DATE - INTERVAL '7 days';

-- Emails sent by Musaavir
SELECT COUNT(*) 
FROM email_logs
WHERE from_email LIKE '%musaavir.ahmed@pasada.in%'
  AND sent_at >= CURRENT_DATE - INTERVAL '7 days';

-- Emails sent by Arjun
SELECT COUNT(*) 
FROM email_logs
WHERE from_email LIKE '%arjun.neo@pasada.in%'
  AND sent_at >= CURRENT_DATE - INTERVAL '7 days';

-- All automated emails
SELECT COUNT(*) 
FROM email_logs
WHERE from_email IN ('quotations@pasada.in', 'noreply@pasada.in')
  AND sent_at >= CURRENT_DATE - INTERVAL '7 days';
```

---

## 🔒 Security Best Practices

1. **Never commit** `.env.local` to Git
2. **Use app passwords** for Zoho SMTP (not account passwords)
3. **Rotate passwords** every 90 days
4. **Enable 2FA** on all Zoho accounts
5. **Monitor email logs** regularly for suspicious activity
6. **Set SPF/DKIM records** in DNS for better deliverability

---

## 🎯 Quick Reference

| Email | Purpose | Type | Reply-To |
|-------|---------|------|----------|
| quotations@pasada.in | Automated quotes | System | support@pasada.in |
| noreply@pasada.in | System notifications | System | support@pasada.in |
| support@pasada.in | General support | Team | support@pasada.in |
| musaavir.ahmed@pasada.in | Sales inquiries | Personal | musaavir.ahmed@pasada.in |
| arjun.neo@pasada.in | Admin/technical | Personal | arjun.neo@pasada.in |

---

## 📞 Support

For email system issues, contact:
- **Technical:** arjun.neo@pasada.in
- **General:** support@pasada.in

**Last Updated:** November 5, 2025
