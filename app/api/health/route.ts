import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by Docker healthcheck, load balancers, and monitoring systems
 */
export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Optional: Check database connection
    // Uncomment if you want to verify Supabase connectivity
    /*
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      const { error } = await supabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        return NextResponse.json(
          { 
            status: 'unhealthy', 
            error: 'Database connection failed',
            details: error.message 
          },
          { status: 503 }
        );
      }
      
      health.database = 'connected';
    } catch (dbError) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          error: 'Database check failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 503 }
      );
    }
    */

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
