import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

/**
 * Validation schema for lead submission
 */
const LeadSchema = z.object({
  // Required fields
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  consent_privacy: z.boolean().refine(val => val === true, 'Privacy consent is required'),
  
  // Optional fields
  phone: z.string().optional(),
  company: z.string().optional(),
  service_type: z.string().optional(),
  project_type: z.string().optional(),
  budget_range: z.string().optional(),
  message: z.string().optional(),
  consent_marketing: z.boolean().optional(),
  
  // Tracking fields
  visitor_id: z.string().uuid().optional(),
  page_url: z.string().optional(),
  referrer: z.string().optional(),
  source: z.string().optional(),
});

/**
 * POST /api/analytics/submit-lead
 * Handles contact form submissions and creates leads
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = LeadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Get visitor metadata from headers
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const user_agent = request.headers.get('user-agent') || '';

    // Prepare lead data
    const leadData = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || null,
      company: validatedData.company || null,
      service_type: validatedData.service_type || null,
      project_type: validatedData.project_type || null,
      budget_range: validatedData.budget_range || null,
      message: validatedData.message || null,
      consent_privacy: validatedData.consent_privacy,
      consent_marketing: validatedData.consent_marketing || false,
      visitor_id: validatedData.visitor_id || null,
      page_url: validatedData.page_url || request.url,
      referrer: validatedData.referrer || null,
      source: validatedData.source || 'website',
      ip_address,
      user_agent,
      status: 'new',
      priority: determinePriority(validatedData),
      submitted_at: new Date().toISOString()
    };

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Error submitting lead:', error);
      return NextResponse.json(
        { error: 'Failed to submit lead', details: error.message },
        { status: 500 }
      );
    }

    // Create initial activity log
    await supabase
      .from('lead_activities')
      .insert({
        lead_id: data.id,
        activity_type: 'lead_created',
        description: `Lead submitted from ${validatedData.page_url || 'website'}`,
        completed_at: new Date().toISOString()
      });

    // Optional: Send notification to admin (implement separately)
    // await sendLeadNotification(data);

    // Optional: Send auto-response email to customer (implement separately)
    // await sendAutoResponseEmail(data.email, data.name);

    return NextResponse.json(
      { 
        success: true, 
        lead_id: data.id,
        message: 'Thank you for contacting us! We will get back to you shortly.'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error in submit-lead API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Determine lead priority based on submission data
 */
function determinePriority(data: z.infer<typeof LeadSchema>): string {
  // High priority if budget is high or specific urgent keywords
  if (data.budget_range === '25L+' || data.budget_range === '10-25L') {
    return 'high';
  }
  
  // Check for urgent keywords in message
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'quickly'];
  if (data.message) {
    const messageLower = data.message.toLowerCase();
    if (urgentKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'urgent';
    }
  }

  // Medium priority for commercial projects
  if (data.project_type === 'Commercial' || data.project_type === 'Hospitality') {
    return 'medium';
  }

  // Default to medium
  return 'medium';
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
