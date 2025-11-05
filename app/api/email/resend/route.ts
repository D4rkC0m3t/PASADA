/**
 * PASADA CRM - Resend Email API Route
 * POST /api/email/resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resendEmail } from '@/lib/email/service';
import type { ResendEmailRequest } from '@/lib/email/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email_id) {
      return NextResponse.json(
        { success: false, error: 'Original email ID (email_id) is required' },
        { status: 400 }
      );
    }

    if (!body.reason) {
      return NextResponse.json(
        { success: false, error: 'Resend reason is required' },
        { status: 400 }
      );
    }

    if (!body.user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required for audit tracking' },
        { status: 400 }
      );
    }

    // Prepare resend request
    const resendRequest: ResendEmailRequest = {
      email_id: body.email_id,
      reason: body.reason,
      user_id: body.user_id,
      override_to: body.override_to,
      override_subject: body.override_subject,
      override_body: body.override_body,
    };

    // Resend email
    const result = await resendEmail(resendRequest);

    // Log to audit_logs table
    if (result.success) {
      await supabase.from('audit_logs').insert({
        action: 'email_resent',
        entity_type: 'email',
        entity_id: result.new_email_id,
        user_id: body.user_id,
        details: {
          original_email_id: body.email_id,
          reason: body.reason,
          resend_count: result.resend_count,
          override_to: body.override_to,
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });
    }

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error('Resend email API error:', error);

    // Handle specific errors
    if (error.name === 'ResendLimitExceededError') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'RESEND_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

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
