import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { renderToStream } from '@react-pdf/renderer'
import QuotationPDF from '@/lib/pdf/quotation-template'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
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

    // Fetch quotation with all related data
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        project:projects (
          name,
          location,
          client:clients (
            name,
            email,
            phone,
            address
          )
        ),
        quote_items (
          material_name,
          description,
          quantity,
          unit,
          unit_price,
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
    // Admin/staff can see all, clients can only see their own
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

    // Generate PDF
    const pdfDoc = QuotationPDF({ data: quotation })
    const stream = await renderToStream(pdfDoc)

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Quotation-${quotation.quotation_number}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
