import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { renderToStream } from '@react-pdf/renderer'
import GSTQuotationPDF from '@/lib/pdf/quotation-gst-template'

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

    const quotationId = params.id

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

    // Fetch quotation with all related data including GST fields
    const { data: quotation, error } = await supabase
      .from('quotations')
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
            gstin,
            state_code,
            client_type
          )
        ),
        quote_items (
          description,
          hsn_sac_code,
          quantity,
          unit,
          unit_price,
          taxable_value,
          tax_rate,
          gst_amount,
          cgst_amount,
          sgst_amount,
          igst_amount,
          total
        )
      `)
      .eq('id', quotationId)
      .single()

    if (error || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' }, 
        { status: 404 }
      )
    }

    // Check if user has access to this quotation
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role === 'client') {
      // Check if this quotation belongs to a project owned by this client
      const { data: project } = await supabase
        .from('projects')
        .select('client_id')
        .eq('id', quotation.project_id)
        .single()

      if (project?.client_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Prepare data for GST PDF template
    const pdfData = {
      ...quotation,
      company: {
        name: company.company_name || 'PASADA INTERIORS',
        gstin: company.gstin || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        state_code: company.state_code || '',
        pin_code: company.pin_code || '',
        email: company.email || '',
        phone: company.phone || '',
      },
      project: {
        ...quotation.projects,
        clients: quotation.projects.clients,
      },
    }

    // Generate PDF
    const pdfDoc = <GSTQuotationPDF data={pdfData as any} />
    const stream = await renderToStream(pdfDoc)

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="GST-Quotation-${quotation.quotation_number}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error('GST PDF Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate GST PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
