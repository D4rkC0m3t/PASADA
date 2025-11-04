import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'
import { encryptData, decryptData } from '@/lib/security'

// GET /api/clients/[id] - Get single client
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_READ.limit, RATE_LIMITS.API_READ.windowMs)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch client
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch client' },
        { status: 500 }
      )
    }

    // Decrypt sensitive fields
    if (process.env.ENCRYPTION_KEY) {
      try {
        if (client.phone) client.phone = await decryptData(client.phone)
        if (client.address) client.address = await decryptData(client.address)
      } catch (decryptError) {
        console.warn('Decryption warning for client:', client.id)
      }
    }

    return NextResponse.json({ data: client }, { status: 200 })
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/clients/[id] - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_WRITE.limit, RATE_LIMITS.API_WRITE.windowMs)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Prepare update data with encryption
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.contact_name !== undefined) updateData.contact_name = body.contact_name
    if (body.phone !== undefined) {
      updateData.phone = body.phone && process.env.ENCRYPTION_KEY 
        ? await encryptData(body.phone) 
        : body.phone
    }
    if (body.email !== undefined) updateData.email = body.email
    if (body.address !== undefined) {
      updateData.address = body.address && process.env.ENCRYPTION_KEY 
        ? await encryptData(body.address) 
        : body.address
    }
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.country !== undefined) updateData.country = body.country
    if (body.zip_code !== undefined) updateData.zip_code = body.zip_code
    if (body.type !== undefined) updateData.type = body.type
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes

    // Update in database
    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      )
    }

    // Decrypt before returning
    if (process.env.ENCRYPTION_KEY) {
      try {
        if (client.phone) client.phone = await decryptData(client.phone)
        if (client.address) client.address = await decryptData(client.address)
      } catch (decryptError) {
        console.warn('Decryption warning for client:', client.id)
      }
    }

    return NextResponse.json({ data: client }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/clients/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = await getClientIp()
    const { success } = await rateLimiter.check(ip, RATE_LIMITS.API_WRITE.limit, RATE_LIMITS.API_WRITE.windowMs)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete from database
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Client deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
