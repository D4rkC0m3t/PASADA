import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { renderToStream } from '@react-pdf/renderer'
import { render } from '@react-email/render'
import QuotationPDF from '@/lib/pdf/quotation-template'
import QuotationEmail from '@/lib/email/quotation-email-template'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
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

    // Get user role - only admin/staff can send emails
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const quotationId = params.id

    // Parse request body for optional custom message and recipient
    const body = await request.json().catch(() => ({}))
    const customMessage = body.customMessage
    const customRecipient = body.recipientEmail

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

    // Get client email
    const recipientEmail = customRecipient || quotation.project.client.email
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Client email not found. Please add email to client profile.' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfDoc = QuotationPDF({ data: quotation })
    const pdfStream = await renderToStream(pdfDoc)

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    const pdfBuffer = Buffer.concat(chunks)

    // Render email HTML
    const emailHtml = render(
      QuotationEmail({
        clientName: quotation.project.client.name,
        quotationNumber: quotation.quotation_number,
        quotationTitle: quotation.title,
        projectName: quotation.project.name,
        totalAmount: quotation.total_amount,
        validUntil: quotation.valid_until,
        viewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/quotations/${quotation.id}`,
      })
    )

    // Send email with Resend
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'PASADA Interiors <quotations@pasada.in>',
      to: [recipientEmail],
      subject: `Quotation ${quotation.quotation_number} - ${quotation.title}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Quotation-${quotation.quotation_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (emailResult.error) {
      console.error('Resend Error:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      )
    }

    // Update quotation status to 'sent' and record send details
    const { error: updateError } = await supabase
      .from('quotations')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_to: recipientEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId)

    if (updateError) {
      console.error('Error updating quotation status:', updateError)
      // Don't fail the request since email was sent successfully
    }

    // Log the email send activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: session.user.id,
        action: 'quotation_sent',
        entity_type: 'quotation',
        entity_id: quotationId,
        details: {
          quotation_number: quotation.quotation_number,
          recipient: recipientEmail,
          email_id: emailResult.data?.id,
        },
      })
      .catch((err) => console.error('Error logging activity:', err))

    return NextResponse.json({
      success: true,
      message: 'Quotation sent successfully',
      emailId: emailResult.data?.id,
      sentTo: recipientEmail,
    })

  } catch (error) {
    console.error('Email Send Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
