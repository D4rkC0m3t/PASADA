import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cancelIRN } from '@/lib/e-invoice/gst-api'

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

    const body = await request.json()
    const { cancellation_reason, cancellation_remark } = body

    // Validate cancellation reason
    const validReasons = ['1', '2', '3', '4'] // As per GST portal
    if (!cancellation_reason || !validReasons.includes(cancellation_reason)) {
      return NextResponse.json(
        { error: 'Invalid cancellation reason. Must be 1, 2, 3, or 4' },
        { status: 400 }
      )
    }

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single()

    if (invoiceError) throw invoiceError

    // Check if IRN exists
    if (!invoice.irn) {
      return NextResponse.json(
        { error: 'No IRN found for this invoice' },
        { status: 400 }
      )
    }

    // Check if already cancelled
    if (invoice.e_invoice_status === 'cancelled') {
      return NextResponse.json(
        { error: 'IRN already cancelled' },
        { status: 400 }
      )
    }

    // Check if cancellation is within 24 hours
    const irnGeneratedAt = new Date(invoice.irn_generated_at)
    const now = new Date()
    const hoursDiff = (now.getTime() - irnGeneratedAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'IRN can only be cancelled within 24 hours of generation' },
        { status: 400 }
      )
    }

    // Fetch company settings
    const { data: company, error: companyError } = await supabase
      .from('company_settings')
      .select('*')
      .single()

    if (companyError) throw companyError

    // Cancel IRN using GST API
    const result = await cancelIRN({
      irn: invoice.irn,
      cancellation_reason,
      cancellation_remark: cancellation_remark || 'Cancelled by user',
      company
    })

    if (!result.success) {
      // Log the error
      await supabase
        .from('e_invoice_logs')
        .insert([{
          invoice_id: params.id,
          action: 'cancel_irn',
          request_payload: { irn: invoice.irn, cancellation_reason, cancellation_remark },
          response_payload: result,
          status_code: 500,
          error_message: result.errors?.join(', '),
          created_by: session.user.id
        }])

      return NextResponse.json(
        { error: result.errors?.join(', ') || 'Failed to cancel IRN' },
        { status: 500 }
      )
    }

    // Update invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        e_invoice_status: 'cancelled',
        irn_cancelled_at: new Date().toISOString(),
        cancellation_reason: `Reason ${cancellation_reason}: ${cancellation_remark || 'Cancelled'}`,
        status: 'cancelled',
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
        action: 'cancel_irn',
        request_payload: { irn: invoice.irn, cancellation_reason, cancellation_remark },
        response_payload: result,
        status_code: 200,
        created_by: session.user.id
      }])

    return NextResponse.json({
      success: true,
      message: 'IRN cancelled successfully',
      cancelled_date: result.cancelled_date
    })

  } catch (error) {
    console.error('Error cancelling IRN:', error)
    return NextResponse.json(
      { error: 'Failed to cancel IRN' },
      { status: 500 }
    )
  }
}
