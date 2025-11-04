import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
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

    // Get request body
    const body = await request.json()
    const { invoice_date, due_date, payment_terms } = body

    // Validate dates
    if (!invoice_date || !due_date) {
      return NextResponse.json(
        { error: 'Invoice date and due date are required' },
        { status: 400 }
      )
    }

    // Fetch quotation with items
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', params.id)
      .single()

    if (quotationError) throw quotationError

    // Check if quotation is approved
    if (quotation.status !== 'approved' && quotation.status !== 'sent') {
      return NextResponse.json(
        { error: 'Only approved or sent quotations can be converted to invoices' },
        { status: 400 }
      )
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        quotation_id: quotation.id,
        project_id: quotation.project_id,
        client_id: quotation.client_id,
        invoice_date,
        due_date,
        payment_terms: payment_terms || 'Net 30',
        subtotal: quotation.subtotal,
        gst_rate: quotation.gst_rate,
        gst_amount: quotation.gst_amount,
        cgst_amount: quotation.cgst_amount,
        sgst_amount: quotation.sgst_amount,
        igst_amount: quotation.igst_amount,
        total_with_gst: quotation.total_with_gst,
        discount: quotation.discount,
        buyer_gstin: quotation.buyer_gstin,
        seller_gstin: quotation.seller_gstin,
        place_of_supply: quotation.place_of_supply,
        invoice_type: quotation.quotation_type,
        reverse_charge: quotation.reverse_charge || 'N',
        supply_type: 'Goods',
        status: 'draft',
        e_invoice_status: 'pending',
        notes: quotation.notes,
        internal_notes: quotation.internal_notes,
        created_by: session.user.id
      }])
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items from quotation items
    const invoiceItems = quotation.quotation_items.map((item: any) => ({
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

    // Update quotation status
    const { error: updateError } = await supabase
      .from('quotations')
      .update({ status: 'converted' })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number
    })

  } catch (error) {
    console.error('Error converting quotation:', error)
    return NextResponse.json(
      { error: 'Failed to convert quotation to invoice' },
      { status: 500 }
    )
  }
}
