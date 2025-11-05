import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { renderToBuffer } from '@react-pdf/renderer'
import { EstimationPDF } from '@/lib/pdf/estimation-template'

/**
 * GET /api/estimations/[id]/pdf
 * Generates and downloads estimation PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check user role (admin or staff only)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['admin', 'staff'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin or staff access required' },
        { status: 403 }
      )
    }
    
    // Fetch estimation data with all related information
    const { data: estimation, error: estimationError } = await supabase
      .from('estimations')
      .select(`
        id,
        estimation_number,
        created_at,
        validity_days,
        estimation_type,
        margin_percent,
        subtotal,
        discount,
        total,
        status,
        notes,
        project:projects (
          name,
          location,
          client:clients (
            name,
            email,
            phone,
            address
          )
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (estimationError || !estimation) {
      return NextResponse.json(
        { error: 'Estimation not found', details: estimationError?.message },
        { status: 404 }
      )
    }
    
    // Fetch estimation items
    const { data: estimationItems, error: itemsError } = await supabase
      .from('estimation_items')
      .select('*')
      .eq('estimation_id', params.id)
      .order('item_number', { ascending: true })
    
    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch estimation items', details: itemsError.message },
        { status: 500 }
      )
    }
    
    // Transform data for PDF template
    const pdfData = {
      id: estimation.id,
      estimation_number: estimation.estimation_number,
      created_at: estimation.created_at,
      validity_days: estimation.validity_days,
      estimation_type: estimation.estimation_type,
      margin_percent: estimation.margin_percent,
      subtotal: parseFloat(estimation.subtotal.toString()),
      discount: parseFloat(estimation.discount.toString()),
      total: parseFloat(estimation.total.toString()),
      status: estimation.status,
      notes: estimation.notes,
      project: {
        name: estimation.project.name,
        location: estimation.project.location,
        client: {
          name: estimation.project.client.name,
          email: estimation.project.client.email,
          phone: estimation.project.client.phone,
          address: estimation.project.client.address,
        }
      },
      estimation_items: (estimationItems || []).map(item => ({
        description: item.description,
        category: item.category,
        quantity: parseFloat(item.quantity.toString()),
        unit: item.unit,
        unit_price: parseFloat(item.unit_price.toString()),
        total: parseFloat(item.total.toString()),
      }))
    }
    
    // Generate PDF
    const pdfBuffer = await renderToBuffer(<EstimationPDF data={pdfData} />)
    
    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Estimation-${estimation.estimation_number}.pdf"`,
      },
    })
    
  } catch (error: any) {
    console.error('Error generating estimation PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}
