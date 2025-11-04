'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DebugAuthPage() {
  const [authData, setAuthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        let profileData = null
        if (session?.user) {
          // Get profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          profileData = {
            profile,
            profileError: profileError?.message
          }
        }

        setAuthData({
          session: session ? {
            user_id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at
          } : null,
          sessionError: sessionError?.message,
          ...profileData
        })
      } catch (error: any) {
        setAuthData({
          error: error.message
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔍 Authentication Debug</h1>
          <p className="text-zinc-400">Check your current authentication status and role</p>
        </div>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Session Status</h2>
            <pre className="bg-zinc-950 p-4 rounded-lg text-sm text-green-400 overflow-auto">
              {JSON.stringify(authData?.session, null, 2)}
            </pre>
            {authData?.sessionError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">Error: {authData.sessionError}</p>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">User Profile</h2>
            <pre className="bg-zinc-950 p-4 rounded-lg text-sm text-blue-400 overflow-auto">
              {JSON.stringify(authData?.profile, null, 2)}
            </pre>
            {authData?.profileError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">Error: {authData.profileError}</p>
              </div>
            )}
          </div>

          {/* Role Check */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Role Analysis</h2>
            {authData?.profile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg">
                  <span className="text-zinc-400">Current Role:</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {authData.profile.role || 'NONE'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-semibold">Access Permissions:</h3>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg ${authData.profile.role === 'client' ? 'bg-green-500/10 border border-green-500/20' : 'bg-zinc-950'}`}>
                      <span className="text-white">✓ Client Portal Access</span>
                      {authData.profile.role === 'client' && <span className="ml-2 text-green-500">GRANTED</span>}
                    </div>
                    <div className={`p-3 rounded-lg ${authData.profile.role === 'admin' || authData.profile.role === 'staff' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <span className="text-white">Admin Portal Access</span>
                      {(authData.profile.role === 'admin' || authData.profile.role === 'staff') ? (
                        <span className="ml-2 text-green-500">✓ GRANTED</span>
                      ) : (
                        <span className="ml-2 text-red-500">✗ DENIED</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-500 text-sm">
                    <strong>Note:</strong> If you're a client and can still access admin pages, 
                    the AuthGuard is not being enforced properly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500">No profile found or not logged in</p>
              </div>
            )}
          </div>

          {/* Test Links */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Test Access</h2>
            <div className="space-y-3">
              <Link 
                href="/client/dashboard"
                className="block p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
              >
                Try Client Portal →
              </Link>
              <Link 
                href="/admin/dashboard"
                className="block p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-center transition-colors"
              >
                Try Admin Portal →
              </Link>
              <Link 
                href="/login"
                className="block p-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-center transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>

          {/* General Error */}
          {authData?.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-red-400">{authData.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
