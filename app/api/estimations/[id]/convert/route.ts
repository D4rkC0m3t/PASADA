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
    const { items_with_hsn } = body

    // Fetch estimation
    const { data: estimation, error: estimationError } = await supabase
      .from('estimations')
      .select(`
        *,
        estimation_items (*)
      `)
      .eq('id', params.id)
      .single()

    if (estimationError) throw estimationError

    // Check if already converted
    if (estimation.status === 'converted') {
      return NextResponse.json(
        { error: 'Estimation already converted' },
        { status: 400 }
      )
    }

    // Fetch company settings for GST
    const { data: company, error: companyError } = await supabase
      .from('company_settings')
      .select('*')
      .single()

    if (companyError) throw companyError

    // Fetch client/project for GST detection
    let clientGSTIN = null
    let clientState = null

    if (estimation.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('clients (gstin, state)')
        .eq('id', estimation.project_id)
        .single()
      
      clientGSTIN = project?.clients?.gstin
      clientState = project?.clients?.state
    } else if (estimation.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('gstin, state')
        .eq('id', estimation.client_id)
        .single()
      
      clientGSTIN = client?.gstin
      clientState = client?.state
    }

    // Determine GST type
    const isB2B = !!clientGSTIN
    const isIntraState = company.state === clientState
    const gstRate = 18 // Default GST rate, can be customized per item

    // Calculate GST
    const subtotal = estimation.subtotal
    const gstAmount = (subtotal * gstRate) / 100
    const cgstAmount = isIntraState ? gstAmount / 2 : 0
    const sgstAmount = isIntraState ? gstAmount / 2 : 0
    const igstAmount = !isIntraState ? gstAmount : 0
    const totalWithGST = subtotal + gstAmount

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert([{
        project_id: estimation.project_id,
        client_id: estimation.client_id,
        title: estimation.title,
        description: estimation.description,
        subtotal: subtotal,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        total_with_gst: totalWithGST,
        discount: estimation.discount,
        buyer_gstin: clientGSTIN,
        seller_gstin: company.gstin,
        place_of_supply: clientState || company.state,
        quotation_type: isB2B ? 'B2B' : 'B2C',
        status: 'draft',
        notes: estimation.notes,
        internal_notes: estimation.internal_notes,
        created_by: session.user.id
      }])
      .select()
      .single()

    if (quotationError) throw quotationError

    // Create quotation items with HSN/SAC codes
    const quotationItems = estimation.estimation_items.map((item: any, index: number) => {
      const itemWithHSN = items_with_hsn?.find((i: any) => i.item_number === item.item_number)
      const itemGSTRate = itemWithHSN?.gst_rate || gstRate
      const taxableValue = item.total
      const itemGSTAmount = (taxableValue * itemGSTRate) / 100
      const itemCGST = isIntraState ? itemGSTAmount / 2 : 0
      const itemSGST = isIntraState ? itemGSTAmount / 2 : 0
      const itemIGST = !isIntraState ? itemGSTAmount : 0

      return {
        quotation_id: quotation.id,
        item_number: item.item_number,
        category: item.category,
        description: item.description,
        hsn_sac_code: itemWithHSN?.hsn_sac_code || '998599', // Default service code
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        taxable_value: taxableValue,
        tax_rate: itemGSTRate,
        gst_amount: itemGSTAmount,
        cgst_amount: itemCGST,
        sgst_amount: itemSGST,
        igst_amount: itemIGST,
        total: taxableValue + itemGSTAmount,
        notes: item.notes
      }
    })

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(quotationItems)

    if (itemsError) throw itemsError

    // Update estimation status
    const { error: updateError } = await supabase
      .from('estimations')
      .update({
        status: 'converted',
        converted_to_quotation_id: quotation.id,
        converted_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      quotation_id: quotation.id,
      quotation_number: quotation.quotation_number
    })

  } catch (error) {
    console.error('Error converting estimation:', error)
    return NextResponse.json(
      { error: 'Failed to convert estimation' },
      { status: 500 }
    )
  }
}
