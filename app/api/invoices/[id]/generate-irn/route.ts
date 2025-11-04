import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateIRN } from '@/lib/e-invoice/gst-api'

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

    // Fetch invoice with all details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
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
        )
      `)
      .eq('id', params.id)
      .single()

    if (invoiceError) throw invoiceError

    // Validate invoice status
    if (invoice.status === 'draft') {
      return NextResponse.json(
        { error: 'Cannot generate IRN for draft invoices. Issue the invoice first.' },
        { status: 400 }
      )
    }

    if (invoice.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot generate IRN for cancelled invoices' },
        { status: 400 }
      )
    }

    // Check if IRN already generated
    if (invoice.irn) {
      return NextResponse.json(
        { error: 'IRN already generated for this invoice' },
        { status: 400 }
      )
    }

    // Check if B2B invoice (IRN only for B2B)
    if (invoice.invoice_type !== 'B2B' || !invoice.buyer_gstin) {
      return NextResponse.json(
        { error: 'IRN can only be generated for B2B invoices with valid GSTIN' },
        { status: 400 }
      )
    }

    // Fetch company settings
    const { data: company, error: companyError } = await supabase
      .from('company_settings')
      .select('*')
      .single()

    if (companyError) throw companyError

    // Generate IRN using GST API
    const result = await generateIRN({
      invoice,
      company,
      items: invoice.invoice_items
    })

    if (!result.success) {
      // Log the error
      await supabase
        .from('e_invoice_logs')
        .insert([{
          invoice_id: params.id,
          action: 'generate_irn',
          request_payload: { invoice_id: params.id },
          response_payload: result,
          status_code: 500,
          error_message: result.errors?.join(', '),
          created_by: session.user.id
        }])

      return NextResponse.json(
        { error: result.errors?.join(', ') || 'Failed to generate IRN' },
        { status: 500 }
      )
    }

    // Update invoice with IRN details
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        irn: result.irn,
        ack_no: result.ack_no,
        ack_date: result.ack_date,
        signed_invoice: result.signed_invoice,
        signed_qr_code: result.signed_qr_code,
        qr_code_image: result.qr_code_image,
        e_invoice_status: 'generated',
        irn_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: session.user.id
      })
      .eq('id', params.id)

    if (updateError) throw updateError

    // Log success
    await supabase
      .from('e_invoice_logs')
      .insert([{
        invoice_id: params.id,
        action: 'generate_irn',
        request_payload: { invoice_id: params.id },
        response_payload: result,
        status_code: 200,
        created_by: session.user.id
      }])

    return NextResponse.json({
      success: true,
      irn: result.irn,
      ack_no: result.ack_no,
      ack_date: result.ack_date,
      qr_code_image: result.qr_code_image
    })

  } catch (error) {
    console.error('Error generating IRN:', error)
    return NextResponse.json(
      { error: 'Failed to generate IRN' },
      { status: 500 }
    )
  }
}
