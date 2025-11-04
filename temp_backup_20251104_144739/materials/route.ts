import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'

// GET /api/materials - List all materials with filters
export async function GET(request: NextRequest) {
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

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: materials, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch materials' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: materials }, { status: 200 })
  } catch (error) {
    console.error('GET /api/materials error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/materials - Create new material
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
    if (!body.name || !body.category || body.unit_price === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and unit price are required' },
        { status: 400 }
      )
    }

    // Prepare material data
    const materialData = {
      sku: body.sku || null,
      name: body.name,
      description: body.description || null,
      category: body.category,
      subcategory: body.subcategory || null,
      unit: body.unit || 'pcs',
      unit_price: body.unit_price,
      cost_price: body.cost_price || null,
      tax_percent: body.tax_percent || 18.00,
      stock_quantity: body.stock_quantity || 0,
      min_stock_level: body.min_stock_level || 0,
      supplier_name: body.supplier_name || null,
      supplier_contact: body.supplier_contact || null,
      lead_time_days: body.lead_time_days || null,
      image_url: body.image_url || null,
      specifications: body.specifications || null,
      status: body.status || 'active'
    }

    // Insert into database
    const { data: material, error } = await supabase
      .from('materials')
      .insert(materialData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create material' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: material }, { status: 201 })
  } catch (error) {
    console.error('POST /api/materials error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
