import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/analytics/log-visit
 * Logs a visitor to the database for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Parse request body
    const body = await request.json();
    const { 
      page_name, 
      page_url, 
      referrer, 
      session_id,
      utm_source,
      utm_medium,
      utm_campaign,
      duration_seconds 
    } = body;

    // Get visitor metadata from headers
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const user_agent = request.headers.get('user-agent') || '';

    // Parse user agent for device info (basic)
    const device_type = user_agent.toLowerCase().includes('mobile') 
      ? 'mobile' 
      : user_agent.toLowerCase().includes('tablet') 
        ? 'tablet' 
        : 'desktop';

    // Extract browser info (basic)
    let browser = 'unknown';
    if (user_agent.includes('Chrome')) browser = 'Chrome';
    else if (user_agent.includes('Firefox')) browser = 'Firefox';
    else if (user_agent.includes('Safari')) browser = 'Safari';
    else if (user_agent.includes('Edge')) browser = 'Edge';

    // Extract OS info (basic)
    let os = 'unknown';
    if (user_agent.includes('Windows')) os = 'Windows';
    else if (user_agent.includes('Mac')) os = 'macOS';
    else if (user_agent.includes('Linux')) os = 'Linux';
    else if (user_agent.includes('Android')) os = 'Android';
    else if (user_agent.includes('iOS')) os = 'iOS';

    // Insert visitor log
    const { data, error } = await supabase
      .from('visitors')
      .insert({
        session_id,
        ip_address,
        user_agent,
        device_type,
        browser,
        os,
        page_url: page_url || request.url,
        page_name,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        duration_seconds,
        visited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging visit:', error);
      return NextResponse.json(
        { error: 'Failed to log visit', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, visitor_id: data.id },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in log-visit API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
