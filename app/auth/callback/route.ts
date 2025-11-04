import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') || 'client'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange code for session
      await supabase.auth.exchangeCodeForSession(code)
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        let userRole = type; // Default to the type parameter

        // If profile doesn't exist, create it
        if (!profile) {
          await supabase
            .from('user_profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
              phone: session.user.user_metadata?.phone,
              company: session.user.user_metadata?.company,
              role: type, // Use the type parameter (client or admin)
              is_active: true
            })
        } else {
          // If profile exists, use the role from the database
          userRole = profile.role;
          
          // Log for debugging
          console.log(`User ${session.user.email} has existing role: ${userRole}`);
        }

        // Redirect based on the actual role (from database if exists, otherwise from type parameter)
        if (userRole === 'admin' || userRole === 'staff') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else {
          return NextResponse.redirect(new URL('/client/dashboard', request.url))
        }
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
    }
  }

  // Return to login with error if something went wrong
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
}
