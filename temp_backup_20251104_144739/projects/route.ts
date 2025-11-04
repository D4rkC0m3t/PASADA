import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'

// GET /api/projects - List all projects with client details
export async function GET(_request: NextRequest) {
  try {
    // Rate limiting
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_READ.limit, RATE_LIMITS.API_READ.windowMs)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch projects with client details
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (
          id,
          name,
          contact_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: projects }, { status: 200 })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_WRITE.limit, RATE_LIMITS.API_WRITE.windowMs)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.client_id) {
      return NextResponse.json(
        { error: 'Project name and client ID are required' },
        { status: 400 }
      )
    }

    // Prepare project data
    const projectData = {
      client_id: body.client_id,
      name: body.name,
      description: body.description || null,
      site_location: body.site_location || null,
      type: body.type || 'other',
      area_sqft: body.area_sqft || null,
      status: body.status || 'planning',
      budget: body.budget || null,
      actual_cost: body.actual_cost || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      completion_date: body.completion_date || null,
      priority: body.priority || 'medium',
      notes: body.notes || null,
      created_by: user.id,
      updated_by: user.id
    }

    // Insert into database
    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select(`
        *,
        clients (
          id,
          name,
          contact_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
