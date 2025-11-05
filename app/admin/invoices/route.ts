import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - List all invoices
export async function GET(request: NextRequest) {
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
            email
          )
        ),
        clients (
          name,
          email
        )
      `)
      .order('invoice_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      quotation_id,
      project_id,
      client_id,
      invoice_date,
      due_date,
      payment_terms,
      subtotal,
      gst_rate,
      gst_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      total_with_gst,
      discount,
      buyer_gstin,
      seller_gstin,
      place_of_supply,
      invoice_type,
      reverse_charge,
      supply_type,
      notes,
      internal_notes,
      items
    } = body

    // Validate required fields
    if (!project_id || !client_id || !invoice_date || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        quotation_id,
        project_id,
        client_id,
        invoice_date,
        due_date,
        payment_terms: payment_terms || 'Net 30',
        subtotal,
        gst_rate,
        gst_amount,
        cgst_amount,
        sgst_amount,
        igst_amount,
        total_with_gst,
        discount: discount || 0,
        buyer_gstin,
        seller_gstin,
        place_of_supply,
        invoice_type,
        reverse_charge: reverse_charge || 'N',
        supply_type: supply_type || 'Goods',
        status: 'draft',
        e_invoice_status: 'pending',
        notes,
        internal_notes,
        created_by: session.user.id
      }])
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items if provided
    if (items && items.length > 0) {
      const invoiceItems = items.map((item: any) => ({
        invoice_id: invoice.id,
        item_number: item.item_number,
        category: item.category,
        description: item.description,
        hsn_sac_code: item.hsn_sac_code,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        taxable_value: item.taxable_value,
        tax_rate: item.tax_rate,
        gst_amount: item.gst_amount,
        cgst_amount: item.cgst_amount,
        sgst_amount: item.sgst_amount,
        igst_amount: item.igst_amount,
        total: item.total
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) throw itemsError
    }

    // If created from quotation, update quotation status
    if (quotation_id) {
      await supabase
        .from('quotations')
        .update({ status: 'converted' })
        .eq('id', quotation_id)
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
