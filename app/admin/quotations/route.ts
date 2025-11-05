import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'

// GET /api/quotations - List all quotations
export async function GET(_request: NextRequest) {
  try {
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.QUOTATION.limit, RATE_LIMITS.QUOTATION.windowMs)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: quotations, error } = await supabase
      .from('quotations')
      .select(`
        *,
        projects (
          id,
          name,
          clients (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 })
    }

    return NextResponse.json({ data: quotations }, { status: 200 })
  } catch (error) {
    console.error('GET /api/quotations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/quotations - Create new quotation with items
export async function POST(request: NextRequest) {
  try {
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.QUOTATION.limit, RATE_LIMITS.QUOTATION.windowMs)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.project_id || !body.title || !body.quotation_number) {
      return NextResponse.json(
        { error: 'Project ID, title, and quotation number are required' },
        { status: 400 }
      )
    }

    // Prepare quotation data
    const quotationData = {
      quotation_number: body.quotation_number,
      project_id: body.project_id,
      title: body.title,
      description: body.description || null,
      subtotal: body.subtotal || 0,
      tax_percent: body.tax_percent || 18.00,
      tax_amount: body.tax_amount || 0,
      discount_percent: body.discount_percent || 0,
      discount_amount: body.discount_amount || 0,
      total_amount: body.total_amount || 0,
      status: body.status || 'draft',
      version: body.version || 1,
      valid_until: body.valid_until || null,
      notes: body.notes || null,
      terms_and_conditions: body.terms_and_conditions || null,
      payment_terms: body.payment_terms || null,
      created_by: user.id,
      updated_by: user.id
    }

    // Insert quotation
    const { data: quotation, error } = await supabase
      .from('quotations')
      .insert(quotationData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 })
    }

    // Insert line items if provided
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      const items = body.items.map((item: any, index: number) => ({
        quotation_id: quotation.id,
        item_number: index + 1,
        category: item.category || null,
        description: item.description,
        specifications: item.specifications || null,
        quantity: item.quantity || 1,
        unit: item.unit || 'pcs',
        unit_price: item.unit_price,
        tax_percent: item.tax_percent || 18.00,
        discount_percent: item.discount_percent || 0
      }))

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(items)

      if (itemsError) {
        console.error('Items error:', itemsError)
        // Rollback quotation if items fail
        await supabase.from('quotations').delete().eq('id', quotation.id)
        return NextResponse.json({ error: 'Failed to create quotation items' }, { status: 500 })
      }
    }

    return NextResponse.json({ data: quotation }, { status: 201 })
  } catch (error) {
    console.error('POST /api/quotations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
