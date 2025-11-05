/**
 * PASADA CRM - Resend Webhook Handler
 * POST /api/email/webhook
 * Handles webhook events from Resend for email tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  markEmailOpened,
  markEmailClicked,
  markEmailBounced,
  markEmailDelivered,
} from '@/lib/email/service';
import type { ResendWebhookPayload } from '@/lib/email/types';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (recommended for production)
    // const signature = request.headers.get('x-resend-signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payload: ResendWebhookPayload = await request.json();

    console.log('Resend webhook received:', payload.type, payload.data.email_id);

    // Handle different webhook events
    switch (payload.type) {
      case 'email.delivered':
        await markEmailDelivered(payload.data.email_id);
        break;

      case 'email.opened':
        await markEmailOpened(payload.data.email_id);
        break;

      case 'email.clicked':
        await markEmailClicked(payload.data.email_id);
        break;

      case 'email.bounced':
        await markEmailBounced(payload.data.email_id, payload.data.error_message);
        break;

      case 'email.complained':
        // Handle spam complaints
        console.warn('Spam complaint received for:', payload.data.email_id);
        break;

      case 'email.delivery_delayed':
        // Log delayed delivery
        console.warn('Delivery delayed for:', payload.data.email_id);
        break;

      default:
        console.log('Unhandled webhook type:', payload.type);
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

// Webhook signature verification (implement based on Resend docs)
function verifySignature(signature: string | null, body: any): boolean {
  // TODO: Implement signature verification
  // See: https://resend.com/docs/api-reference/webhooks/verify-signature
  return true;
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-resend-signature',
    },
  });
}
