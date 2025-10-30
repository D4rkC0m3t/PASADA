import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('type', 'admin')
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has admin or staff role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (error || !profile || !profile.is_active || (profile.role !== 'admin' && profile.role !== 'staff')) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protected client routes
  if (req.nextUrl.pathname.startsWith('/client')) {
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('type', 'client')
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Verify user exists and is active
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('is_active')
      .eq('id', session.user.id)
      .single()

    if (error || !profile || !profile.is_active) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*'],
}
