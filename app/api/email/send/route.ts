/**
 * PASADA CRM - Send Email API Route
 * POST /api/email/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, processTemplate } from '@/lib/email/service';
import type { SendEmailRequest, ProcessTemplateRequest } from '@/lib/email/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient email (to) is required' },
        { status: 400 }
      );
    }

    // Extract audit metadata from request
    const auditMeta = {
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      triggered_by: body.user_id || null,
      trigger_action: body.trigger_action || 'manual',
    };

    // If template is provided, process it
    let subject = body.subject;
    let html = body.html;
    let text = body.text;

    if (body.template_id || body.template_name) {
      const templateRequest: ProcessTemplateRequest = {
        template_id: body.template_id,
        template_name: body.template_name,
        merge_tags: body.merge_tags || {},
      };

      const processed = await processTemplate(templateRequest);
      subject = processed.subject;
      html = processed.html;
      text = processed.text;
    }

    // Validate that we have subject and html
    if (!subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Email subject and HTML body are required' },
        { status: 400 }
      );
    }

    // Prepare send request
    const sendRequest: SendEmailRequest = {
      to: body.to,
      subject,
      html,
      text,
      lead_id: body.lead_id,
      client_id: body.client_id,
      project_id: body.project_id,
      quotation_id: body.quotation_id,
      email_type: body.email_type,
      tags: body.tags,
      attachments: body.attachments,
    };

    // Send email
    const result = await sendEmail(sendRequest, auditMeta);

    // Log to audit_logs table
    if (result.success && body.user_id) {
      await supabase.from('audit_logs').insert({
        action: 'email_sent',
        entity_type: 'email',
        entity_id: result.email_id,
        user_id: body.user_id,
        details: {
          to: body.to,
          subject,
          email_type: body.email_type,
          lead_id: body.lead_id,
          client_id: body.client_id,
        },
        ip_address: auditMeta.ip_address,
        user_agent: auditMeta.user_agent,
      });
    }

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error('Send email API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
