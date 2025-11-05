import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        projects (
          name,
          clients (
            name,
            email,
            phone,
            gstin,
            address,
            city,
            state,
            pincode
          )
        ),
        clients (
          name,
          email,
          phone,
          gstin,
          address,
          city,
          state,
          pincode
        ),
        invoice_items (*),
        payments (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if invoice can be edited (only draft invoices)
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', params.id)
      .single()

    if (existingInvoice && existingInvoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be edited' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if invoice can be deleted (only draft invoices)
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('status, e_invoice_status')
      .eq('id', params.id)
      .single()

    if (existingInvoice && existingInvoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      )
    }

    if (existingInvoice && existingInvoice.e_invoice_status === 'generated') {
      return NextResponse.json(
        { error: 'Cannot delete invoice with generated IRN. Cancel IRN first.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
