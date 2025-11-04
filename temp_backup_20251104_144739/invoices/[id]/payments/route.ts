import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - List payments for an invoice
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
      .from('payments')
      .select('*')
      .eq('invoice_id', params.id)
      .order('payment_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST - Record a new payment
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
    const {
      payment_date,
      amount,
      payment_method,
      transaction_id,
      reference_number,
      bank_name,
      cheque_number,
      upi_id,
      notes
    } = body

    // Validate required fields
    if (!payment_date || !amount || !payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get invoice to check outstanding amount
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('outstanding_amount')
      .eq('id', params.id)
      .single()

    if (invoiceError) throw invoiceError

    if (amount > invoice.outstanding_amount) {
      return NextResponse.json(
        { error: 'Payment amount exceeds outstanding amount' },
        { status: 400 }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        invoice_id: params.id,
        payment_date,
        amount,
        payment_method,
        transaction_id,
        reference_number,
        bank_name,
        cheque_number,
        upi_id,
        notes,
        status: 'completed',
        created_by: session.user.id
      }])
      .select()
      .single()

    if (paymentError) throw paymentError

    // The database trigger will automatically update the invoice status
    // But we can also manually update if needed
    const newPaidAmount = (invoice.outstanding_amount === amount) 
      ? invoice.outstanding_amount + amount 
      : amount
    
    const newOutstanding = invoice.outstanding_amount - amount

    // Determine new status
    let newStatus = 'issued'
    if (newOutstanding === 0) {
      newStatus = 'fully_paid'
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid'
    }

    // Update invoice (the trigger should handle this, but we do it explicitly for safety)
    await supabase
      .from('invoices')
      .update({
        paid_amount: supabase.raw(`paid_amount + ${amount}`),
        outstanding_amount: supabase.raw(`outstanding_amount - ${amount}`),
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}
