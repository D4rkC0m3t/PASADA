'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Shield, User, Eye, EyeOff, Lock, Mail, CheckCircle, AlertTriangle, Zap, Key, Chrome } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const redirectTo = searchParams?.get('redirectTo') || null
  const errorParam = searchParams?.get('error')
  const loginType = searchParams?.get('type') || 'admin' // admin or client

  useEffect(() => {
    if (errorParam === 'unauthorized') {
      setError('You do not have permission to access this resource.')
    }
    
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('pasada_remember_email')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
  }, [errorParam])

  // Caps Lock detection
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockOn(true)
    } else {
      setCapsLockOn(false)
    }
  }

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle email blur
  const handleEmailBlur = () => {
    if (formData.email) {
      setEmailValid(validateEmail(formData.email))
    }
  }

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Store session for UI display
        setCurrentSession(session)
        
        // User is already logged in
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          // Only redirect if there's a specific redirectTo URL
          // Don't auto-redirect if user explicitly came to login page
          if (redirectTo) {
            router.replace(redirectTo)
          } 
          // If user tries to access wrong portal type, redirect to their portal
          else if (loginType === 'admin' && profile.role === 'client') {
            router.replace('/client/dashboard')
          }
          else if (loginType === 'client' && (profile.role === 'admin' || profile.role === 'staff')) {
            // Show error that they need to logout first
            setError('You are logged in as Admin. Please logout first to access Client Portal.')
          }
          else if (!redirectTo && window.location.search.includes('?type=')) {
            // User explicitly navigated to login with type parameter - don't auto-redirect
            // Let them see the login page (they might want to switch accounts)
            return
          }
          else {
            // Auto-redirect to appropriate dashboard only if no type parameter
            if (profile.role === 'admin' || profile.role === 'staff') {
              router.replace('/admin/dashboard')
            } else {
              router.replace('/client/dashboard')
            }
          }
        }
      }
    }

    checkAuth()
  }, [redirectTo, router, supabase, loginType])

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentSession(null)
    setError('')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('pasada_remember_email', formData.email)
      } else {
        localStorage.removeItem('pasada_remember_email')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setLoginAttempts(prev => prev + 1)
        throw error
      }
      
      // Show success animation
      setLoginSuccess(true)

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

        // Log the user's role for debugging
        console.log(`User ${data.user.email} logging in with role: ${profile.role}`)

        // Redirect to the original requested page or default dashboard
        if (redirectTo) {
          router.push(redirectTo)
        } else if (profile.role === 'admin' || profile.role === 'staff') {
          router.push('/admin/dashboard')
        } else if (profile.role === 'client') {
          router.push('/client/dashboard')
        } else {
          // Default fallback if role is undefined or invalid
          console.error(`Invalid role detected: ${profile.role}`)
          router.push('/client/dashboard')
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
      setLoginSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Quick login for demo
  const quickLogin = (email: string) => {
    setFormData({ ...formData, email })
  }

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?type=${loginType}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

      // OAuth will redirect, so we don't need to do anything else
    } catch (err: any) {
      console.error('Google login error:', err)
      setError(err.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  // Keyboard shortcut (Ctrl/Cmd + Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.querySelector('form')
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Role-specific styling
  const isClientLogin = loginType === 'client'
  const roleConfig = isClientLogin ? {
    title: 'Client Portal',
    subtitle: 'Access your projects and documents',
    icon: User,
    gradient: 'from-blue-500 to-blue-600',
    hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
    accentColor: 'blue',
    borderColor: 'border-blue-500/20',
    bgAccent: 'bg-blue-500/10'
  } : {
    title: 'Admin Portal',
    subtitle: 'Manage your business operations',
    icon: Shield,
    gradient: 'from-gold-500 to-gold-600',
    hoverGradient: 'hover:from-gold-600 hover:to-gold-700',
    accentColor: 'gold',
    borderColor: 'border-gold-500/20',
    bgAccent: 'bg-gold-500/10'
  }

  const RoleIcon = roleConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-6 py-12">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-900/10 via-transparent to-transparent"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Back button */}
        <Link
          href="/crm"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Login card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50 hover:shadow-gold-500/5 transition-all duration-500">
          {/* Logo & Role Badge */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-3xl font-bold text-gold-400 tracking-wider">PASADA</div>
              <div className="text-sm font-medium text-gold-500/70 tracking-widest">GROUPS</div>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 ${roleConfig.bgAccent} ${roleConfig.borderColor} border rounded-full`}>
              <RoleIcon className={`w-4 h-4 text-${roleConfig.accentColor}-400`} />
              <span className={`text-xs font-semibold text-${roleConfig.accentColor}-400 uppercase tracking-wide`}>
                {isClientLogin ? 'Client' : 'Admin'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <span>{roleConfig.title}</span>
            </h1>
            <p className="text-zinc-400">{roleConfig.subtitle}</p>
          </div>

          {/* Already logged in warning */}
          {currentSession && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start space-x-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-400 text-sm font-bold">Already Logged In</p>
                  <p className="text-yellow-300 text-xs mt-1">
                    You're currently logged in as {currentSession.user?.email}. To login as a different user, please logout first.
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 font-semibold rounded-lg transition-all"
              >
                Logout and Continue
              </button>
            </div>
          )}

          {/* Success animation */}
          {loginSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start space-x-3 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <p className="text-green-400 text-sm font-bold">Login successful! Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">{error}</p>
                {loginAttempts >= 3 && (
                  <p className="text-red-300 text-xs mt-1">Multiple failed attempts. Please check your credentials.</p>
                )}
              </div>
            </div>
          )}

          {/* Account lockout warning */}
          {loginAttempts >= 5 && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-orange-400 text-sm font-medium">Too many failed attempts</p>
                <p className="text-orange-300 text-xs mt-1">Your account may be temporarily locked. Contact support if you need help.</p>
              </div>
            </div>
          )}
          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-gold-400 transition-colors" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (!emailValid) setEmailValid(true)
                  }}
                  onBlur={handleEmailBlur}
                  className={`w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border rounded-xl text-white placeholder-zinc-500 focus:outline-none transition-all ${
                    !emailValid && formData.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-zinc-700 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
                  }`}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
                {!emailValid && formData.email && (
                  <p className="text-red-400 text-xs mt-1 ml-1">Please enter a valid email address</p>
                )}
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-gold-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={handleKeyPress}
                  onKeyUp={handleKeyPress}
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-950/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {capsLockOn && (
                <div className="flex items-center space-x-2 mt-2 text-orange-400 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Caps Lock is ON</span>
                </div>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 text-gold-500 focus:ring-gold-500 focus:ring-offset-0 focus:ring-2 transition-all cursor-pointer" 
                  disabled={loading} 
                />
                <span className="ml-2 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors font-medium">Remember me</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-gold-400 hover:text-gold-300 font-semibold hover:underline transition-all"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r ${roleConfig.gradient} ${roleConfig.hoverGradient} text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl shadow-${roleConfig.accentColor}-900/30 hover:shadow-${roleConfig.accentColor}-500/50 hover:scale-[1.02] active:scale-[0.98] mt-8`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {roleConfig.title}</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-zinc-900/50 text-zinc-500 uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading || loginSuccess}
            className="w-full mb-6 py-3.5 bg-white hover:bg-gray-50 text-zinc-900 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl border border-zinc-200"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Additional links */}
          <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
            {/* Switch portal type */}
            <div className="text-center">
              <p className="text-zinc-500 text-sm mb-2">
                {isClientLogin ? 'Are you an admin?' : 'Are you a client?'}
              </p>
              <Link 
                href={`/login?type=${isClientLogin ? 'admin' : 'client'}`}
                className="text-gold-400 hover:text-gold-300 font-semibold text-sm hover:underline transition-all"
              >
                Switch to {isClientLogin ? 'Admin' : 'Client'} Portal →
              </Link>
            </div>

            {/* Quick login buttons */}
            <div className="space-y-2">
              <p className="text-zinc-500 text-xs text-center font-medium">Quick Demo Login</p>
              {!isClientLogin ? (
                <button
                  type="button"
                  onClick={() => quickLogin('pasada.groups@gmail.com')}
                  className="w-full p-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all group"
                  disabled={loading}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-blue-400 text-xs font-medium">Admin Account</p>
                      <p className="text-blue-300 text-xs font-mono">pasada.groups@gmail.com</p>
                    </div>
                    <Zap className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => quickLogin('arjunin2020@gmail.com')}
                  className="w-full p-3 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 hover:border-green-500/40 rounded-xl transition-all group"
                  disabled={loading}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-green-400 text-xs font-medium">Client Account</p>
                      <p className="text-green-300 text-xs font-mono">arjunin2020@gmail.com</p>
                    </div>
                    <Zap className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )}
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="flex items-center justify-center space-x-2 text-zinc-600 text-xs">
              <Key className="w-3 h-3" />
              <span>Press Ctrl+Enter to login quickly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
