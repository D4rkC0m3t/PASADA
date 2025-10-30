'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const redirectTo = searchParams.get('redirectTo') || null
  const errorParam = searchParams.get('error')
  const loginType = searchParams.get('type') || 'admin' // admin or client

  useEffect(() => {
    if (errorParam === 'unauthorized') {
      setError('You do not have permission to access this resource.')
    }
  }, [errorParam])

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // User is already logged in, redirect them
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          if (redirectTo) {
            router.replace(redirectTo)
          } else if (profile.role === 'admin' || profile.role === 'staff') {
            router.replace('/admin/dashboard')
          } else {
            router.replace('/client/dashboard')
          }
        }
      }
    }

    checkAuth()
  }, [redirectTo, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      if (data.user) {
        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, is_active')
          .eq('id', data.user.id)
          .single()

        if (!profile || !profile.is_active) {
          throw new Error('Your account is inactive. Please contact support.')
        }

        // Redirect to the original requested page or default dashboard
        if (redirectTo) {
          router.push(redirectTo)
        } else if (profile.role === 'admin' || profile.role === 'staff') {
          router.push('/admin/dashboard')
        } else {
          router.push('/client/dashboard')
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <Link
          href="/crm"
          className="inline-flex items-center text-pasada-300 hover:text-[#fff8f1] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-medium">Back to CRM Portal</span>
        </Link>

        <div className="bg-pasada-950 border border-pasada-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400 tracking-wider">PASADA</div>
              <div className="text-base font-medium text-gold-500/70 tracking-widest">GROUPS</div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#fff8f1] mb-2">
            {loginType === 'client' ? 'Client Portal Login' : 'Admin Portal Login'}
          </h1>
          <p className="text-pasada-300 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pasada-200 mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pasada-200 mb-2" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 accent-gold-500" disabled={loading} />
                <span className="text-sm text-pasada-300 font-medium">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-gold-400 hover:text-gold-300 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-pasada-950 font-semibold rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-gold-900/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-yellow-600 hover:text-yellow-500 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
            <p className="text-blue-400 text-sm text-center font-medium">
              Demo: pasada.groups@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
