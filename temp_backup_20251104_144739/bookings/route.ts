import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'

// GET /api/bookings - List all bookings
export async function GET(_request: NextRequest) {
  try {
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_READ.limit, RATE_LIMITS.API_READ.windowMs)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        ),
        projects (
          id,
          name
        )
      `)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json({ data: bookings }, { status: 200 })
  } catch (error) {
    console.error('GET /api/bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.CONTACT_FORM.limit, RATE_LIMITS.CONTACT_FORM.windowMs)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createServerClient()
    
    // Check authentication (optional for bookings - public can create)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.scheduled_date || !body.scheduled_time) {
      return NextResponse.json(
        { error: 'Title, scheduled date, and time are required' },
        { status: 400 }
      )
    }

    // Prepare booking data
    const bookingData = {
      client_id: body.client_id || null,
      project_id: body.project_id || null,
      title: body.title,
      description: body.description || null,
      booking_type: body.booking_type || 'consultation',
      scheduled_date: body.scheduled_date,
      scheduled_time: body.scheduled_time,
      duration_minutes: body.duration_minutes || 60,
      location: body.location || null,
      status: body.status || 'scheduled',
      reminder_sent: false,
      notes: body.notes || null,
      created_by: user?.id || null,
      updated_by: user?.id || null
    }

    // Insert into database
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    return NextResponse.json({ data: booking }, { status: 201 })
  } catch (error) {
    console.error('POST /api/bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
