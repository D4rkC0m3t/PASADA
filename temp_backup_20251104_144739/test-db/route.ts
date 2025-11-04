import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon')
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection by querying the leads table
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tableExists: true
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
