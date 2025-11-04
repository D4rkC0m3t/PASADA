import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with anon key only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE TEST ROUTE ===')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Using anon key (first 10 chars):', supabaseKey.substring(0, 10) + '...')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const body = await request.json()
    console.log('Received body:', body)
    
    // Simple insert with minimal data
    const testData = {
      name: body.name || 'Test User',
      email: body.email || 'test@example.com',
      phone: body.phone || '1234567890',
      service_type: body.service || 'Tailored Furniture',
      message: body.message || 'Test message',
      status: 'new',
      priority: 'medium',
      source: 'website_contact_form',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    console.log('Attempting insert with:', testData)
    
    const { data, error } = await supabase
      .from('leads')
      .insert([testData])
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('Insert successful:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Test submission successful',
      data: data
    })
    
  } catch (error) {
    console.error('Caught exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
