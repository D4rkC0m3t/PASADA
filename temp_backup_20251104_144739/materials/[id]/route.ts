import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'

// GET /api/materials/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: material, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 })
    }

    return NextResponse.json({ data: material }, { status: 200 })
  } catch (error) {
    console.error('GET /api/materials/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/materials/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_WRITE.limit, RATE_LIMITS.API_WRITE.windowMs)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData: any = { updated_at: new Date().toISOString() }

    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory
    if (body.unit !== undefined) updateData.unit = body.unit
    if (body.unit_price !== undefined) updateData.unit_price = body.unit_price
    if (body.cost_price !== undefined) updateData.cost_price = body.cost_price
    if (body.tax_percent !== undefined) updateData.tax_percent = body.tax_percent
    if (body.stock_quantity !== undefined) updateData.stock_quantity = body.stock_quantity
    if (body.min_stock_level !== undefined) updateData.min_stock_level = body.min_stock_level
    if (body.supplier_name !== undefined) updateData.supplier_name = body.supplier_name
    if (body.supplier_contact !== undefined) updateData.supplier_contact = body.supplier_contact
    if (body.lead_time_days !== undefined) updateData.lead_time_days = body.lead_time_days
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.specifications !== undefined) updateData.specifications = body.specifications
    if (body.status !== undefined) updateData.status = body.status

    const { data: material, error } = await supabase
      .from('materials')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update material' }, { status: 500 })
    }

    return NextResponse.json({ data: material }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/materials/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/materials/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_WRITE.limit, RATE_LIMITS.API_WRITE.windowMs)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Material deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/materials/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
