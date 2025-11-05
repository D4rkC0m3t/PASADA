# 📧 PASADA Email System - Quick Reference Card

## 🚀 Setup (One-Time)

```powershell
# 1. Run migration
psql -h db.eoahwxdhvdfgllolzoxd.supabase.co -U postgres -d postgres -f database/migrations/007_create_email_system.sql

# 2. Verify environment variables
RESEND_API_KEY=re_edwN8HuA_MG62hopnQVTMKgpdMJZ9Dwfk ✅
RESEND_FROM_EMAIL="PASADA Interiors <quotations@pasada.in>" ✅
```

## 📤 Send Email (Frontend/API)

```typescript
// Basic email
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'client@example.com',
    subject: 'Your Quotation',
    html: '<h1>Hello!</h1><p>Your quotation is ready.</p>',
    user_id: 'admin-uuid',
    email_type: 'quotation',
  }),
});
```

```typescript
// Using template
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'client@example.com',
    template_name: 'Quotation Email',
    merge_tags: {
      client: { name: 'Mr. Sharma' },
      quotation: { number: 'PASADA-2025-0001', total: '₹2,50,000' }
    },
    user_id: 'admin-uuid',
  }),
});
```

## 🔁 Resend Email

```typescript
const response = await fetch('/api/email/resend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email_id: 'original-email-uuid',
    reason: 'Client requested resend',
    user_id: 'admin-uuid',
  }),
});
```

## 📊 Get Email Logs

```typescript
// All emails for a lead
const response = await fetch('/api/email/logs?lead_id=uuid&limit=20');
const { data: logs } = await response.json();

// All emails for a quotation
const response = await fetch('/api/email/logs?quotation_id=uuid');
```

## 🎨 Available Templates

1. **Quotation Email** - Professional quotation with PDF
2. **Lead Follow-up** - Thank you + next steps
3. **Welcome Client** - New client onboarding

### Merge Tags

```typescript
{
  client: { name, email, phone },
  project: { name, type, status },
  quotation: { number, total, valid_until },
  lead: { name, email, service },
  portal: { url },
  company: { name, email, phone }
}
```

## 🔍 Query Email Logs (SQL)

```sql
-- All emails sent today
SELECT * FROM email_logs 
WHERE sent_at::date = CURRENT_DATE
ORDER BY sent_at DESC;

-- Failed emails
SELECT * FROM email_logs 
WHERE status = 'failed';

-- Email analytics
SELECT * FROM email_analytics
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- Resend statistics
SELECT * FROM resend_statistics
ORDER BY total_resends DESC LIMIT 10;
```

## 📈 Track Email Performance

```sql
-- Open rate
SELECT 
  email_type,
  COUNT(*) as total,
  COUNT(opened_at) as opened,
  ROUND(COUNT(opened_at)::NUMERIC / COUNT(*) * 100, 2) as open_rate
FROM email_logs
GROUP BY email_type;

-- Emails requiring attention
SELECT * FROM email_logs
WHERE resend_count >= 2 OR status = 'failed';
```

## 🔧 Webhook Configuration

**Resend Dashboard**:
- URL: `https://pasada.in/api/email/webhook`
- Events: delivered, opened, clicked, bounced

## ⚠️ Important Limits

- **Max resends**: 3 per email
- **Rate limit**: Implement 1 email/second for bulk
- **Attachment size**: Check Resend limits

## 🆘 Troubleshooting

```sql
-- Check email status
SELECT id, to_email, status, error_message 
FROM email_logs 
WHERE id = 'email-uuid';

-- Reset resend count (USE WITH CAUTION)
UPDATE email_logs 
SET resend_count = 0 
WHERE id = 'email-uuid';

-- Check template exists
SELECT name, is_active FROM email_templates;
```

## 📞 API Endpoints

- `POST /api/email/send` - Send new email
- `POST /api/email/resend` - Resend existing email
- `GET /api/email/logs` - Query email logs
- `POST /api/email/webhook` - Resend webhooks

## ✅ Quick Test

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "user_id": "admin-uuid"
  }'
```

---

**Full Documentation**: See `EMAIL_SYSTEM_GUIDE.md`
