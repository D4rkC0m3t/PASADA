/**
 * PASADA CRM - Email System Usage Examples
 * Ready-to-use code snippets for common email scenarios
 */

import { sendEmail, resendEmail, processTemplate, getEmailLogs } from './service';
import type { SendEmailRequest, EmailAuditMeta } from './types';

// ================================================
// EXAMPLE 1: Send Quotation Email
// ================================================

export async function sendQuotationEmail(
  quotationData: {
    client_email: string;
    client_name: string;
    project_name: string;
    quotation_number: string;
    quotation_total: string;
    valid_until: string;
    quotation_id: string;
    client_id: string;
    project_id: string;
  },
  adminUserId: string
) {
  // Process template with merge tags
  const emailContent = await processTemplate({
    template_name: 'Quotation Email',
    merge_tags: {
      client: { name: quotationData.client_name },
      project: { name: quotationData.project_name },
      quotation: {
        number: quotationData.quotation_number,
        total: quotationData.quotation_total,
        valid_until: quotationData.valid_until,
      },
      portal: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard`,
      },
    },
  });

  // Send email
  const result = await sendEmail(
    {
      to: quotationData.client_email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      client_id: quotationData.client_id,
      project_id: quotationData.project_id,
      quotation_id: quotationData.quotation_id,
      email_type: 'quotation',
      tags: ['quotation', 'sent'],
    },
    {
      triggered_by: adminUserId,
      trigger_action: 'manual',
    }
  );

  return result;
}

// ================================================
// EXAMPLE 2: Send Lead Follow-up Email
// ================================================

export async function sendLeadFollowUpEmail(
  leadData: {
    email: string;
    name: string;
    service_type: string;
    message: string;
    lead_id: string;
  }
) {
  const emailContent = await processTemplate({
    template_name: 'Lead Follow-up',
    merge_tags: {
      lead: {
        name: leadData.name,
        service: leadData.service_type,
      },
      company: {
        name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'PASADA Interior Design',
        email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'pasada.groups@gmail.com',
        phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '7090004948',
      },
    },
  });

  const result = await sendEmail(
    {
      to: leadData.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      lead_id: leadData.lead_id,
      email_type: 'follow_up',
      tags: ['lead', 'follow_up', 'automated'],
    },
    {
      trigger_action: 'automated',
    }
  );

  return result;
}

// ================================================
// EXAMPLE 3: Send Custom Email with Attachments
// ================================================

export async function sendCustomEmailWithAttachment(
  recipientEmail: string,
  subject: string,
  message: string,
  pdfBase64: string,
  pdfFilename: string,
  metadata: {
    lead_id?: string;
    client_id?: string;
    project_id?: string;
    quotation_id?: string;
  },
  adminUserId: string
) {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PASADA Interior Design</h1>
          </div>
          <div class="content">
            ${message}
          </div>
          <div class="footer">
            <p><strong>PASADA Interior Design</strong><br>
            No 47 LBS Nagar 1st cross K Narayanapura<br>
            Bangalore 560077, India</p>
            <p>Email: pasada.groups@gmail.com | Phone: +91 7090004948</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail(
    {
      to: recipientEmail,
      subject,
      html: htmlBody,
      text: message.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
      ...metadata,
      email_type: 'custom',
      tags: ['custom', 'with_attachment'],
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBase64,
          content_type: 'application/pdf',
        },
      ],
    },
    {
      triggered_by: adminUserId,
      trigger_action: 'manual',
    }
  );

  return result;
}

// ================================================
// EXAMPLE 4: Resend Email with Modified Content
// ================================================

export async function resendEmailWithChanges(
  originalEmailId: string,
  reason: string,
  adminUserId: string,
  modifications?: {
    new_recipient?: string;
    new_subject?: string;
    new_body?: string;
  }
) {
  const result = await resendEmail({
    email_id: originalEmailId,
    reason,
    user_id: adminUserId,
    override_to: modifications?.new_recipient,
    override_subject: modifications?.new_subject,
    override_body: modifications?.new_body,
  });

  return result;
}

// ================================================
// EXAMPLE 5: Get Email History for Lead
// ================================================

export async function getLeadEmailHistory(leadId: string) {
  const logs = await getEmailLogs({
    lead_id: leadId,
    limit: 50,
  });

  // Transform for display
  return logs.map((log) => ({
    id: log.id,
    to: log.to_email,
    subject: log.subject,
    status: log.status,
    sent_at: log.sent_at,
    opened_at: log.opened_at,
    clicked_at: log.clicked_at,
    resend_count: log.resend_count,
    email_type: log.email_type,
  }));
}

// ================================================
// EXAMPLE 6: Send Welcome Email to New Client
// ================================================

export async function sendWelcomeEmail(
  clientData: {
    email: string;
    name: string;
    project_name: string;
    client_id: string;
    project_id: string;
  }
) {
  const emailContent = await processTemplate({
    template_name: 'Welcome Client',
    merge_tags: {
      client: { name: clientData.name },
      project: { name: clientData.project_name },
      portal: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard`,
      },
    },
  });

  const result = await sendEmail(
    {
      to: clientData.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      client_id: clientData.client_id,
      project_id: clientData.project_id,
      email_type: 'welcome',
      tags: ['welcome', 'new_client'],
    },
    {
      trigger_action: 'automated',
    }
  );

  return result;
}

// ================================================
// EXAMPLE 7: Send Reminder Email
// ================================================

export async function sendReminderEmail(
  recipientEmail: string,
  reminderType: 'payment' | 'appointment' | 'follow_up',
  details: {
    title: string;
    message: string;
    due_date?: string;
    amount?: string;
    client_id?: string;
    project_id?: string;
  }
) {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .reminder-box { 
            background: #fff3cd; 
            border-left: 4px solid #d4af37; 
            padding: 20px; 
            margin: 20px 0;
          }
          .btn { 
            display: inline-block; 
            background: #d4af37; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reminder: ${details.title}</h1>
          <div class="reminder-box">
            <p>${details.message}</p>
            ${details.due_date ? `<p><strong>Due Date:</strong> ${details.due_date}</p>` : ''}
            ${details.amount ? `<p><strong>Amount:</strong> ${details.amount}</p>` : ''}
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard" class="btn">View Dashboard</a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            PASADA Interior Design<br>
            Email: pasada.groups@gmail.com | Phone: +91 7090004948
          </p>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail(
    {
      to: recipientEmail,
      subject: `Reminder: ${details.title}`,
      html: htmlBody,
      text: `${details.title}\n\n${details.message}`,
      client_id: details.client_id,
      project_id: details.project_id,
      email_type: 'reminder',
      tags: ['reminder', reminderType],
    },
    {
      trigger_action: 'automated',
    }
  );

  return result;
}

// ================================================
// EXAMPLE 8: Batch Send Emails (with rate limiting)
// ================================================

export async function sendBatchEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    metadata?: {
      lead_id?: string;
      client_id?: string;
    };
  }>,
  delayMs: number = 1000 // 1 email per second
) {
  const results = [];

  for (const email of emails) {
    const result = await sendEmail(
      {
        to: email.to,
        subject: email.subject,
        html: email.html,
        ...email.metadata,
        email_type: 'notification',
        tags: ['batch', 'bulk'],
      },
      {
        trigger_action: 'automated',
      }
    );

    results.push(result);

    // Rate limiting delay
    if (emails.indexOf(email) < emails.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    total: emails.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

// ================================================
// HELPER: Format Email for Display
// ================================================

export function formatEmailForDisplay(log: any) {
  return {
    id: log.id,
    recipient: log.to_email,
    subject: log.subject,
    status: log.status,
    type: log.email_type || 'custom',
    sentAt: new Date(log.sent_at).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    openedAt: log.opened_at
      ? new Date(log.opened_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null,
    resendCount: log.resend_count,
    isOpened: !!log.opened_at,
    isClicked: !!log.clicked_at,
    canResend: log.resend_count < 3 && log.status !== 'failed',
  };
}
