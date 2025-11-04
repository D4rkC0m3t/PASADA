import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { renderToStream } from '@react-pdf/renderer'
import InvoicePDF from '@/lib/pdf/invoice-template'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoiceId = params.id

    // Fetch company settings for GST details
    const { data: company, error: companyError } = await supabase
      .from('company_settings')
      .select('*')
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company settings not found. Please configure company details first.' }, 
        { status: 404 }
      )
    }

    // Fetch invoice with all related data including GST fields
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        projects (
          name,
          site_location,
          clients (
            name,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            gstin
          )
        ),
        clients (
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          gstin
        ),
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' }, 
        { status: 404 }
      )
    }

    // Get client from either project or direct client
    const client = invoice.projects?.clients || invoice.clients

    if (!client) {
      return NextResponse.json(
        { error: 'Client information not found' }, 
        { status: 404 }
      )
    }

    // Prepare invoice data for PDF
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      payment_terms: invoice.payment_terms,
      project_name: invoice.projects?.name || 'Direct Invoice',
      site_location: invoice.projects?.site_location || client.address,
      client: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        state: client.state,
        pincode: client.pincode,
        gstin: client.gstin
      },
      items: invoice.invoice_items.map((item: any) => ({
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
      })),
      subtotal: invoice.subtotal,
      gst_rate: invoice.gst_rate,
      gst_amount: invoice.gst_amount,
      cgst_amount: invoice.cgst_amount,
      sgst_amount: invoice.sgst_amount,
      igst_amount: invoice.igst_amount,
      total_with_gst: invoice.total_with_gst,
      discount: invoice.discount,
      buyer_gstin: invoice.buyer_gstin,
      seller_gstin: invoice.seller_gstin,
      place_of_supply: invoice.place_of_supply,
      invoice_type: invoice.invoice_type,
      reverse_charge: invoice.reverse_charge,
      supply_type: invoice.supply_type,
      notes: invoice.notes,
      irn: invoice.irn,
      ack_no: invoice.ack_no,
      ack_date: invoice.ack_date,
      qr_code_image: invoice.qr_code_image
    }

    // Generate PDF
    const pdfStream = await renderToStream(
      React.createElement(InvoicePDF, { 
        invoice: invoiceData, 
        company 
      })
    )

    // Return PDF as stream
    return new NextResponse(pdfStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' }, 
      { status: 500 }
    )
  }
}
