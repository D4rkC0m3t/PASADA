/**
 * PASADA CRM - Email Service with Resend Integration
 * Handles all email sending, resending, and logging functionality
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import type {
  SendEmailRequest,
  SendEmailResponse,
  ResendEmailRequest,
  ResendEmailResponse,
  EmailLog,
  EmailAuditMeta,
  ProcessTemplateRequest,
  ProcessTemplateResponse,
  MergeTags,
  EmailSendError,
  ResendLimitExceededError,
  TemplateNotFoundError,
} from './types';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client with service role (for bypassing RLS)
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
// TEMPLATE PROCESSING
// ================================================

/**
 * Replace merge tags in template string
 */
export function replaceMergeTags(template: string, tags: MergeTags): string {
  let result = template;

  // Replace nested tags like {{lead.name}}, {{client.email}}
  const tagPattern = /\{\{([^}]+)\}\}/g;
  result = result.replace(tagPattern, (match, path) => {
    const keys = path.trim().split('.');
    let value: any = tags;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return match; // Keep original if path not found
      }
    }

    return value !== null && value !== undefined ? String(value) : match;
  });

  return result;
}

/**
 * Process email template with merge tags
 */
export async function processTemplate(
  request: ProcessTemplateRequest
): Promise<ProcessTemplateResponse> {
  // If custom templates provided
  if (request.custom_subject && request.custom_html) {
    return {
      subject: replaceMergeTags(request.custom_subject, request.merge_tags),
      html: replaceMergeTags(request.custom_html, request.merge_tags),
      text: request.custom_text
        ? replaceMergeTags(request.custom_text, request.merge_tags)
        : undefined,
    };
  }

  // Fetch template from database
  const query = request.template_id
    ? supabase.from('email_templates').select('*').eq('id', request.template_id).single()
    : supabase.from('email_templates').select('*').eq('name', request.template_name).single();

  const { data: template, error } = await query;

  if (error || !template) {
    throw new TemplateNotFoundError(
      `Template not found: ${request.template_id || request.template_name}`,
      request.template_name || request.template_id || 'unknown'
    );
  }

  return {
    subject: replaceMergeTags(template.subject_template, request.merge_tags),
    html: replaceMergeTags(template.html_template, request.merge_tags),
    text: template.text_template
      ? replaceMergeTags(template.text_template, request.merge_tags)
      : undefined,
    template_name: template.name,
  };
}

// ================================================
// EMAIL SENDING
// ================================================

/**
 * Send email via Resend and log to database
 */
export async function sendEmail(
  request: SendEmailRequest,
  auditMeta?: EmailAuditMeta
): Promise<SendEmailResponse> {
  try {
    // Validate email address
    if (!isValidEmail(request.to)) {
      throw new EmailSendError('Invalid recipient email address', 'INVALID_EMAIL', {
        email: request.to,
      });
    }

    // Send email via Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'PASADA Interiors <quotations@pasada.in>';

    const resendResponse = await resend.emails.send({
      from: fromEmail,
      to: request.to,
      subject: request.subject,
      html: request.html,
      text: request.text,
      attachments: request.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    });

    // Check for errors
    if (resendResponse.error) {
      throw new EmailSendError(
        resendResponse.error.message || 'Failed to send email',
        'RESEND_ERROR',
        resendResponse.error
      );
    }

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
        from_email: fromEmail,
        subject: request.subject,
        html_body: request.html,
        text_body: request.text || null,
        // Resend Integration
        resend_id: resendResponse.data?.id || null,
        resend_status: 'sent',
        // Status
        status: 'sent',
        // Resend Information
        resend_count: 0,
        // Timestamps
        sent_at: new Date().toISOString(),
        // Audit & Metadata
        audit_meta: auditMeta || {},
        triggered_by: auditMeta?.triggered_by || null,
        ip_address: auditMeta?.ip_address || null,
        user_agent: auditMeta?.user_agent || null,
        // Tags & Categories
        email_type: request.email_type || null,
        tags: request.tags || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to log email to database:', dbError);
      // Don't throw error, email was sent successfully
    }

    return {
      success: true,
      email_id: emailLog?.id,
      resend_id: resendResponse.data?.id,
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    console.error('Email send error:', error);

    // Log failed attempt to database
    await supabase.from('email_logs').insert({
      to_email: request.to,
      from_email: process.env.RESEND_FROM_EMAIL || 'PASADA Interiors <quotations@pasada.in>',
      subject: request.subject,
      html_body: request.html,
      text_body: request.text || null,
      status: 'failed',
      error_message: error.message || 'Unknown error',
      error_code: error.code || 'UNKNOWN_ERROR',
      sent_at: new Date().toISOString(),
      audit_meta: auditMeta || {},
      triggered_by: auditMeta?.triggered_by || null,
      email_type: request.email_type || null,
    });

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

// ================================================
// EMAIL RESENDING
// ================================================

/**
 * Resend an existing email with tracking
 */
export async function resendEmail(
  request: ResendEmailRequest
): Promise<ResendEmailResponse> {
  try {
    // Fetch original email
    const { data: originalEmail, error: fetchError } = await supabase
      .from('email_logs')
      .select('*')
      .eq('id', request.email_id)
      .single();

    if (fetchError || !originalEmail) {
      throw new EmailSendError('Original email not found', 'EMAIL_NOT_FOUND', {
        email_id: request.email_id,
      });
    }

    // Check resend limit
    if (originalEmail.resend_count >= 3) {
      throw new ResendLimitExceededError(
        'Resend limit exceeded: Maximum 3 resends allowed per email',
        request.email_id,
        originalEmail.resend_count
      );
    }

    // Prepare resend request
    const resendRequest: SendEmailRequest = {
      to: request.override_to || originalEmail.to_email,
      subject: request.override_subject || originalEmail.subject,
      html: request.override_body || originalEmail.html_body,
      text: originalEmail.text_body || undefined,
      lead_id: originalEmail.lead_id,
      client_id: originalEmail.client_id,
      project_id: originalEmail.project_id,
      quotation_id: originalEmail.quotation_id,
      email_type: originalEmail.email_type,
      tags: originalEmail.tags || undefined,
    };

    // Send email
    const sendResult = await sendEmail(resendRequest, {
      triggered_by: request.user_id,
      trigger_action: 'resend',
      ...originalEmail.audit_meta,
    });

    if (!sendResult.success) {
      throw new EmailSendError('Failed to resend email', 'RESEND_FAILED', sendResult);
    }

    // Update new email log with resend information
    await supabase
      .from('email_logs')
      .update({
        parent_email_id: request.email_id,
        resend_count: originalEmail.resend_count + 1,
        resend_reason: request.reason,
        resend_by: request.user_id,
        resend_at: new Date().toISOString(),
        status: 'resent',
      })
      .eq('id', sendResult.email_id);

    // Update original email's resend count
    await supabase
      .from('email_logs')
      .update({
        resend_count: originalEmail.resend_count + 1,
      })
      .eq('id', request.email_id);

    return {
      success: true,
      new_email_id: sendResult.email_id,
      resend_id: sendResult.resend_id,
      resend_count: originalEmail.resend_count + 1,
      message: 'Email resent successfully',
    };
  } catch (error: any) {
    console.error('Email resend error:', error);

    return {
      success: false,
      error: error.message || 'Failed to resend email',
    };
  }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get email logs for a specific lead/client
 */
export async function getEmailLogs(filters: {
  lead_id?: string;
  client_id?: string;
  project_id?: string;
  quotation_id?: string;
  limit?: number;
  offset?: number;
}): Promise<EmailLog[]> {
  let query = supabase.from('email_logs').select('*').order('sent_at', { ascending: false });

  if (filters.lead_id) query = query.eq('lead_id', filters.lead_id);
  if (filters.client_id) query = query.eq('client_id', filters.client_id);
  if (filters.project_id) query = query.eq('project_id', filters.project_id);
  if (filters.quotation_id) query = query.eq('quotation_id', filters.quotation_id);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }

  return data as EmailLog[];
}

/**
 * Get email analytics
 */
export async function getEmailAnalytics(filters?: {
  start_date?: string;
  end_date?: string;
  email_type?: string;
}): Promise<any[]> {
  let query = supabase.from('email_analytics').select('*').order('date', { ascending: false });

  if (filters?.start_date) query = query.gte('date', filters.start_date);
  if (filters?.end_date) query = query.lte('date', filters.end_date);
  if (filters?.email_type) query = query.eq('email_type', filters.email_type);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching email analytics:', error);
    return [];
  }

  return data;
}

/**
 * Get resend statistics
 */
export async function getResendStatistics(filters?: {
  lead_id?: string;
  limit?: number;
}): Promise<any[]> {
  let query = supabase.from('resend_statistics').select('*').order('total_resends', { ascending: false });

  if (filters?.lead_id) query = query.eq('lead_id', filters.lead_id);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching resend statistics:', error);
    return [];
  }

  return data;
}

/**
 * Mark email as opened (called from tracking pixel or webhook)
 */
export async function markEmailOpened(resend_id: string): Promise<void> {
  await supabase
    .from('email_logs')
    .update({
      status: 'opened',
      opened_at: new Date().toISOString(),
    })
    .eq('resend_id', resend_id)
    .is('opened_at', null); // Only update if not already opened
}

/**
 * Mark email as clicked (called from link tracking or webhook)
 */
export async function markEmailClicked(resend_id: string): Promise<void> {
  await supabase
    .from('email_logs')
    .update({
      status: 'clicked',
      clicked_at: new Date().toISOString(),
    })
    .eq('resend_id', resend_id)
    .is('clicked_at', null); // Only update if not already clicked
}

/**
 * Mark email as bounced (called from webhook)
 */
export async function markEmailBounced(resend_id: string, error_message?: string): Promise<void> {
  await supabase
    .from('email_logs')
    .update({
      status: 'bounced',
      bounced_at: new Date().toISOString(),
      error_message: error_message || 'Email bounced',
    })
    .eq('resend_id', resend_id);
}

/**
 * Mark email as delivered (called from webhook)
 */
export async function markEmailDelivered(resend_id: string): Promise<void> {
  await supabase
    .from('email_logs')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('resend_id', resend_id)
    .is('delivered_at', null);
}
