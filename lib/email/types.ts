/**
 * PASADA CRM - Email System TypeScript Types
 * Comprehensive type definitions for merchant-grade email backend
 */

// ================================================
// EMAIL STATUS & TYPES
// ================================================

export type EmailStatus =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed'
  | 'resent';

export type EmailType =
  | 'quotation'
  | 'invoice'
  | 'follow_up'
  | 'welcome'
  | 'reminder'
  | 'notification'
  | 'custom';

export type TemplateType = EmailType;

// ================================================
// DATABASE MODELS
// ================================================

export interface EmailLog {
  id: string;
  // Relationships
  lead_id?: string | null;
  client_id?: string | null;
  project_id?: string | null;
  quotation_id?: string | null;
  // Email Details
  to_email: string;
  from_email: string;
  subject: string;
  html_body: string;
  text_body?: string | null;
  // Resend Integration
  resend_id?: string | null;
  resend_status?: string | null;
  // Status
  status: EmailStatus;
  // Resend Information
  resend_count: number;
  resend_reason?: string | null;
  resend_by?: string | null;
  resend_at?: Date | null;
  parent_email_id?: string | null;
  // Timestamps
  sent_at: Date;
  delivered_at?: Date | null;
  opened_at?: Date | null;
  clicked_at?: Date | null;
  bounced_at?: Date | null;
  // Audit & Metadata
  audit_meta?: Record<string, any>;
  triggered_by?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  // Tags & Categories
  email_type?: EmailType | null;
  tags?: string[] | null;
  // Error Tracking
  error_message?: string | null;
  error_code?: string | null;
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface InboundEmail {
  id: string;
  // Email Details
  from_email: string;
  to_email: string;
  subject?: string | null;
  body_text?: string | null;
  body_html?: string | null;
  // Matching & Relationships
  matched_lead_id?: string | null;
  matched_client_id?: string | null;
  matched_project_id?: string | null;
  original_email_id?: string | null;
  // Processing Status
  is_processed: boolean;
  processed_at?: Date | null;
  processed_by?: string | null;
  // Metadata
  headers?: Record<string, any> | null;
  attachments?: Record<string, any>[] | null;
  // Timestamps
  received_at: Date;
  created_at: Date;
}

export interface EmailTemplate {
  id: string;
  // Template Details
  name: string;
  description?: string | null;
  subject_template: string;
  html_template: string;
  text_template?: string | null;
  // Template Type
  template_type?: TemplateType | null;
  // Status
  is_active: boolean;
  // Merge Tags
  available_merge_tags?: string[] | null;
  merge_tag_examples?: Record<string, any> | null;
  // Usage Statistics
  times_used: number;
  last_used_at?: Date | null;
  // Timestamps
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
}

// ================================================
// API REQUEST/RESPONSE TYPES
// ================================================

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  // Optional relationships
  lead_id?: string;
  client_id?: string;
  project_id?: string;
  quotation_id?: string;
  // Metadata
  email_type?: EmailType;
  tags?: string[];
  // Attachments
  attachments?: EmailAttachment[];
}

export interface SendEmailResponse {
  success: boolean;
  email_id?: string;
  resend_id?: string;
  message?: string;
  error?: string;
}

export interface ResendEmailRequest {
  email_id: string;
  reason: string;
  user_id: string;
  // Optional overrides
  override_to?: string;
  override_subject?: string;
  override_body?: string;
}

export interface ResendEmailResponse {
  success: boolean;
  new_email_id?: string;
  resend_id?: string;
  resend_count?: number;
  message?: string;
  error?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  content_type?: string;
}

// ================================================
// TEMPLATE PROCESSING TYPES
// ================================================

export interface MergeTags {
  lead?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
    [key: string]: any;
  };
  client?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  project?: {
    id?: string;
    name?: string;
    type?: string;
    status?: string;
    [key: string]: any;
  };
  quotation?: {
    id?: string;
    number?: string;
    total?: string;
    valid_until?: string;
    [key: string]: any;
  };
  portal?: {
    url?: string;
    login_url?: string;
    [key: string]: any;
  };
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ProcessTemplateRequest {
  template_id?: string;
  template_name?: string;
  merge_tags: MergeTags;
  // Or provide custom templates
  custom_subject?: string;
  custom_html?: string;
  custom_text?: string;
}

export interface ProcessTemplateResponse {
  subject: string;
  html: string;
  text?: string;
  template_name?: string;
}

// ================================================
// ANALYTICS TYPES
// ================================================

export interface EmailAnalytics {
  email_type?: EmailType;
  status: EmailStatus;
  date: Date;
  total_sent: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  failed_count: number;
  resent_count: number;
  avg_resend_count: number;
  open_rate_percent?: number;
  click_rate_percent?: number;
}

export interface ResendStatistics {
  lead_id?: string | null;
  to_email: string;
  total_resends: number;
  max_resend_count: number;
  resend_reasons: string[];
  first_sent: Date;
  last_resent?: Date | null;
  hours_between_first_and_last?: number;
}

// ================================================
// AUDIT TYPES
// ================================================

export interface EmailAuditMeta {
  triggered_by?: string;
  trigger_action?: 'manual' | 'automated' | 'resend' | string;
  ip_address?: string;
  device?: string;
  location?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  app_version?: string;
  transport?: 'resend' | 'smtp';
  smtp_host?: string;
  smtp_user?: string;
  message_id?: string;
  error?: string;
  // Custom metadata
  [key: string]: any;
}

// ================================================
// WEBHOOK TYPES (Resend)
// ================================================

export interface ResendWebhookPayload {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced' | 'email.opened' | 'email.clicked';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at?: string;
    // Event-specific data
    bounce_type?: string;
    error_message?: string;
    link?: string;
  };
}

// ================================================
// EMAIL QUEUE TYPES (Future Enhancement)
// ================================================

export interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  html: string;
  priority: 'high' | 'normal' | 'low';
  scheduled_at?: Date;
  attempts: number;
  max_attempts: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  error?: string;
  created_at: Date;
}

// ================================================
// BULK EMAIL TYPES
// ================================================

export interface BulkEmailRequest {
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  email_type?: EmailType;
  tags?: string[];
  batch_size?: number; // For rate limiting
}

export interface BulkEmailResponse {
  success: boolean;
  total_sent: number;
  total_failed: number;
  results: {
    email: string;
    success: boolean;
    email_id?: string;
    error?: string;
  }[];
}

// ================================================
// VALIDATION TYPES
// ================================================

export interface EmailValidationResult {
  is_valid: boolean;
  email: string;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

// ================================================
// ERROR TYPES
// ================================================

export class EmailSendError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EmailSendError';
  }
}

export class ResendLimitExceededError extends Error {
  constructor(
    message: string,
    public email_id: string,
    public current_count: number
  ) {
    super(message);
    this.name = 'ResendLimitExceededError';
  }
}

export class TemplateNotFoundError extends Error {
  constructor(
    message: string,
    public template_name: string
  ) {
    super(message);
    this.name = 'TemplateNotFoundError';
  }
}
