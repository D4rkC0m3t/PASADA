'use client'

/**
 * AuthGuard Component
 * Client-side authentication wrapper for protected pages
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'staff' | 'client'
  fallbackUrl?: string
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  fallbackUrl = '/login' 
}: AuthGuardProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          router.push(fallbackUrl)
          return
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, is_active')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile || !profile.is_active) {
          router.push(fallbackUrl)
          return
        }

        // Check role if specified
        if (requiredRole) {
          if (requiredRole === 'admin' && profile.role !== 'admin' && profile.role !== 'staff') {
            router.push('/login?error=unauthorized')
            return
          }
          if (requiredRole === 'client' && profile.role !== 'client') {
            router.push('/login?error=unauthorized')
            return
          }
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('[AuthGuard] Authentication check failed:', error)
        router.push(fallbackUrl)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole, fallbackUrl, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
