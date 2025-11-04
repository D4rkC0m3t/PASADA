import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import servicesConfig from '@/lib/services-config.json'

// Initialize Supabase client with service_role key (bypasses RLS for server-side operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
console.log('Using Supabase URL:', supabaseUrl)
console.log('Using service_role key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'YES (bypasses RLS)' : 'NO (using anon key)')
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Phone validation regex (supports various formats)
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,}$/

// Get all valid service values from config
const VALID_SERVICES = servicesConfig.serviceCategories.flatMap(
  category => category.services.map(service => service.value)
)

// Service priority mapping (for future use)
// const SERVICE_PRIORITY_MAP = new Map(
//   servicesConfig.serviceCategories.flatMap(
//     category => category.services.map(service => [service.value, service.tag])
//   )
// )

// Get priority from service type
function getPriorityFromService(serviceType: string): string {
  for (const category of servicesConfig.serviceCategories) {
    const service = category.services.find(s => s.value === serviceType)
    if (service) {
      return service.priority
    }
  }
  return 'medium' // default
}

// Get service tag from service type
function getServiceTag(serviceType: string): string | null {
  for (const category of servicesConfig.serviceCategories) {
    const service = category.services.find(s => s.value === serviceType)
    if (service) {
      return service.tag
    }
  }
  return null
}

// Get category from service type
function getServiceCategory(serviceType: string): string | null {
  for (const category of servicesConfig.serviceCategories) {
    const service = category.services.find(s => s.value === serviceType)
    if (service) {
      return category.label
    }
  }
  return null
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (limit.count >= 5) { // Max 5 submissions per minute
    return false
  }
  
  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    console.log('Received form data:', body)
    
    const {
      name,
      email,
      phone,
      service,
      message,
      termsAccepted
    } = body

    // Validate required fields
    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPhone = sanitizeInput(phone)
    const sanitizedMessage = sanitizeInput(message)

    // Validate email format
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!PHONE_REGEX.test(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validate service type against allowed values
    if (!VALID_SERVICES.includes(service)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      )
    }

    // Get service metadata
    const serviceTag = getServiceTag(service)
    const servicePriority = getPriorityFromService(service)
    const serviceCategory = getServiceCategory(service)

    // Insert lead into database with audit trail
    console.log('Attempting to insert lead with data:', {
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      service_type: service,
      service_tag: serviceTag,
      service_category: serviceCategory,
      priority: servicePriority
    })

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
          service_type: service,
          service_tag: serviceTag,
          service_category: serviceCategory,
          message: sanitizedMessage,
          status: 'new',
          priority: servicePriority,
          source: 'website_contact_form',
          ip_address: ip,
          user_agent: request.headers.get('user-agent') || 'unknown',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // Check for duplicate email (if unique constraint exists)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A lead with this email already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      )
    }

    // Log successful submission to audit trail (optional)
    // Note: Audit logging temporarily disabled for anonymous submissions
    // TODO: Re-enable once user_id is optional in audit_logs table
    try {
      const auditResult = await supabase
        .from('audit_logs')
        .insert([
          {
            action: 'lead_created',
            entity_type: 'lead',
            entity_id: data.id,
            details: {
              service_type: service,
              service_tag: serviceTag,
              priority: servicePriority,
              source: 'website_contact_form'
            },
            ip_address: ip,
            user_agent: request.headers.get('user-agent'),
            created_at: new Date().toISOString()
          }
        ])
      
      if (auditResult.error) {
        console.warn('Audit log error (non-critical):', auditResult.error)
      }
    } catch (auditError) {
      console.warn('Audit logging failed (non-critical):', auditError)
    }

    // TODO: Trigger webhook for CRM notifications (optional)
    // await triggerWebhook(data)

    // Return success response (don't expose internal IDs)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you! Your inquiry has been received. We will contact you soon.',
        reference: data.id.substring(0, 8) // Partial ID for user reference
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form submission error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
