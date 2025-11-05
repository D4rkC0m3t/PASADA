/**
 * PASADA CRM - Zoho SMTP Service
 * Handles manual support/sales emails via Zoho Mail
 */

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import type { SendEmailRequest, SendEmailResponse, EmailAuditMeta } from './types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ================================================
// SMTP CONFIGURATION
// ================================================

const ZOHO_SMTP_CONFIG = {
  host: 'smtp.zoho.in',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER || 'support@pasada.in',
    pass: process.env.SMTP_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: true,
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(ZOHO_SMTP_CONFIG);
  }
  return transporter;
}

// ================================================
// SMTP EMAIL SENDING
// ================================================

/**
 * Send email via Zoho SMTP (for manual support/sales emails)
 */
export async function sendEmailViaSMTP(
  request: SendEmailRequest & {
    from_name?: string;
    reply_to?: string;
    cc?: string[];
    bcc?: string[];
  },
  auditMeta?: EmailAuditMeta
): Promise<SendEmailResponse> {
  try {
    // Validate SMTP credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD in .env');
    }

    // Validate email address
    if (!isValidEmail(request.to)) {
      throw new Error(`Invalid recipient email address: ${request.to}`);
    }

    // Get transporter
    const transport = getTransporter();

    // Prepare from address with name
    const fromName = request.from_name || process.env.SMTP_FROM_NAME || 'PASADA Interior Design';
    const fromAddress = process.env.SMTP_USER || 'support@pasada.in';
    const from = `${fromName} <${fromAddress}>`;

    // Prepare mail options
    const mailOptions: nodemailer.SendMailOptions = {
      from,
      to: request.to,
      subject: request.subject,
      html: request.html,
      text: request.text,
      replyTo: request.reply_to || fromAddress,
      cc: request.cc,
      bcc: request.bcc,
    };

    // Add attachments if provided
    if (request.attachments && request.attachments.length > 0) {
      mailOptions.attachments = request.attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.content_type,
      }));
    }

    // Send email
    const info = await transport.sendMail(mailOptions);

    console.log('SMTP Email sent:', info.messageId);

    // Log to database
    const { data: emailLog, error: dbError } = await supabase
      .from('email_logs')
      .insert({
        // Relationships
        lead_id: request.lead_id || null,
        client_id: request.client_id || null,
        project_id: request.project_id || null,
        quotation_id: request.quotation_id || null,
        // Email Details
        to_email: request.to,
        from_email: from,
        subject: request.subject,
        html_body: request.html,
        text_body: request.text || null,
        // SMTP specific
        resend_id: info.messageId, // Use SMTP message ID
        resend_status: 'sent_via_smtp',
        // Status
        status: 'sent',
        // Resend Information
        resend_count: 0,
        // Timestamps
        sent_at: new Date().toISOString(),
        // Audit & Metadata
        audit_meta: {
          ...auditMeta,
          transport: 'smtp',
          smtp_host: ZOHO_SMTP_CONFIG.host,
          smtp_user: ZOHO_SMTP_CONFIG.auth.user,
          message_id: info.messageId,
        },
        triggered_by: auditMeta?.triggered_by || null,
        ip_address: auditMeta?.ip_address || null,
        user_agent: auditMeta?.user_agent || null,
        // Tags & Categories
        email_type: request.email_type || 'custom',
        tags: request.tags ? [...request.tags, 'smtp', 'manual'] : ['smtp', 'manual'],
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to log SMTP email to database:', dbError);
      // Don't throw error, email was sent successfully
    }

    return {
      success: true,
      email_id: emailLog?.id,
      resend_id: info.messageId,
      message: 'Email sent successfully via SMTP',
    };
  } catch (error: any) {
    console.error('SMTP send error:', error);

    // Log failed attempt to database
    await supabase.from('email_logs').insert({
      to_email: request.to,
      from_email: process.env.SMTP_USER || 'support@pasada.in',
      subject: request.subject,
      html_body: request.html,
      text_body: request.text || null,
      status: 'failed',
      error_message: error.message || 'SMTP send failed',
      error_code: error.code || 'SMTP_ERROR',
      sent_at: new Date().toISOString(),
      audit_meta: {
        ...auditMeta,
        transport: 'smtp',
        error: error.message,
      },
      triggered_by: auditMeta?.triggered_by || null,
      email_type: request.email_type || 'custom',
      tags: ['smtp', 'failed'],
    });

    return {
      success: false,
      error: error.message || 'Failed to send email via SMTP',
    };
  }
}

// ================================================
// SMTP CONNECTION TESTING
// ================================================

/**
 * Test SMTP connection and credentials
 */
export async function testSMTPConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const transport = getTransporter();
    await transport.verify();

    return {
      success: true,
      message: 'SMTP connection successful',
      details: {
        host: ZOHO_SMTP_CONFIG.host,
        port: ZOHO_SMTP_CONFIG.port,
        user: ZOHO_SMTP_CONFIG.auth.user,
        secure: ZOHO_SMTP_CONFIG.secure,
      },
    };
  } catch (error: any) {
    console.error('SMTP connection test failed:', error);

    return {
      success: false,
      message: error.message || 'SMTP connection failed',
      details: {
        host: ZOHO_SMTP_CONFIG.host,
        port: ZOHO_SMTP_CONFIG.port,
        error: error.message,
      },
    };
  }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get available SMTP accounts (from environment)
 */
export function getAvailableSMTPAccounts(): Array<{
  email: string;
  name: string;
  type: 'support' | 'sales' | 'noreply';
}> {
  const accounts: Array<{
    email: string;
    name: string;
    type: 'support' | 'sales' | 'noreply';
  }> = [];

  // Primary SMTP account
  if (process.env.SMTP_USER) {
    const email = process.env.SMTP_USER;
    const type: 'support' | 'sales' | 'noreply' = email.includes('support')
      ? 'support'
      : email.includes('sales')
      ? 'sales'
      : 'noreply';

    accounts.push({
      email,
      name: process.env.SMTP_FROM_NAME || 'PASADA Support',
      type,
    });
  }

  // Additional accounts (if configured)
  if (process.env.SMTP_SALES_USER) {
    accounts.push({
      email: process.env.SMTP_SALES_USER,
      name: 'PASADA Sales',
      type: 'sales' as const,
    });
  }

  if (process.env.SMTP_NOREPLY_USER) {
    accounts.push({
      email: process.env.SMTP_NOREPLY_USER,
      name: 'PASADA Notifications',
      type: 'noreply' as const,
    });
  }

  return accounts;
}

/**
 * Close SMTP connection (cleanup)
 */
export function closeSMTPConnection(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}
