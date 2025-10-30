import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'

// GET /api/quotations/[id] - Get quotation with items
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch quotation with project, client, and items
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        projects (
          id,
          name,
          clients (
            id,
            name,
            email,
            phone
          )
        ),
        quote_items (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 })
    }

    return NextResponse.json({ data: quotation }, { status: 200 })
  } catch (error) {
    console.error('GET /api/quotations/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/quotations/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.subtotal !== undefined) updateData.subtotal = body.subtotal
    if (body.tax_percent !== undefined) updateData.tax_percent = body.tax_percent
    if (body.tax_amount !== undefined) updateData.tax_amount = body.tax_amount
    if (body.discount_percent !== undefined) updateData.discount_percent = body.discount_percent
    if (body.discount_amount !== undefined) updateData.discount_amount = body.discount_amount
    if (body.total_amount !== undefined) updateData.total_amount = body.total_amount
    if (body.status !== undefined) updateData.status = body.status
    if (body.valid_until !== undefined) updateData.valid_until = body.valid_until
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.terms_and_conditions !== undefined) updateData.terms_and_conditions = body.terms_and_conditions
    if (body.payment_terms !== undefined) updateData.payment_terms = body.payment_terms

    const { data: quotation, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 })
    }

    return NextResponse.json({ data: quotation }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/quotations/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/quotations/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete will cascade to quote_items
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Quotation deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/quotations/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
