import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter, RATE_LIMITS, getClientIp } from '@/lib/security'
import { encryptData, decryptData } from '@/lib/security'

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
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

    // Fetch clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    // Decrypt sensitive fields if encryption key is available
    const decryptedClients = await Promise.all(
      (clients || []).map(async (client) => {
        try {
          if (process.env.ENCRYPTION_KEY && client.phone) {
            client.phone = await decryptData(client.phone)
          }
          if (process.env.ENCRYPTION_KEY && client.address) {
            client.address = await decryptData(client.address)
          }
        } catch (decryptError) {
          // If decryption fails, data might not be encrypted yet
          console.warn('Decryption warning for client:', client.id)
        }
        return client
      })
    )

    return NextResponse.json({ data: decryptedClients }, { status: 200 })
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
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
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    // Encrypt sensitive fields
    const clientData = {
      name: body.name,
      contact_name: body.contact_name || null,
      phone: body.phone ? (process.env.ENCRYPTION_KEY ? await encryptData(body.phone) : body.phone) : null,
      email: body.email || null,
      address: body.address ? (process.env.ENCRYPTION_KEY ? await encryptData(body.address) : body.address) : null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
      zip_code: body.zip_code || null,
      type: body.type || 'residential',
      status: body.status || 'active',
      notes: body.notes || null,
      created_by: user.id,
      updated_by: user.id
    }

    // Insert into database
    const { data: client, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      )
    }

    // Decrypt before returning
    if (process.env.ENCRYPTION_KEY) {
      if (client.phone) client.phone = await decryptData(client.phone)
      if (client.address) client.address = await decryptData(client.address)
    }

    return NextResponse.json({ data: client }, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
