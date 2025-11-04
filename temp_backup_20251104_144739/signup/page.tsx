'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Loader2, AlertCircle, User, Eye, EyeOff, Lock, Mail, 
  CheckCircle, Shield, Phone, Building, AlertTriangle, Chrome 
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: ''
  })

  const redirectTo = searchParams.get('redirectTo') || null

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password))
    } else {
      setPasswordStrength(0)
    }
  }, [formData.password])

  // Check password match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword)
    } else {
      setPasswordMatch(true)
    }
  }, [formData.password, formData.confirmPassword])

  // Handle email blur
  const handleEmailBlur = () => {
    if (formData.email) {
      setEmailValid(validateEmail(formData.email))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Sign up with Supabase
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            company: formData.company
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signupError) throw signupError

      if (authData.user) {
        // Create user profile as client
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            company: formData.company,
            role: 'client',
            is_active: true
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw - user is created, just log the error
        }

        setSuccess(true)
        
        // Wait a moment to show success message
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo)
          } else {
            router.push('/signup/verify-email')
          }
        }, 2000)
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth
  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?type=client`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

      // OAuth will redirect, so we don't need to do anything else
    } catch (err: any) {
      console.error('Google signup error:', err)
      setError(err.message || 'Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  // Password strength colors
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-orange-500'
    if (passwordStrength <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    if (passwordStrength <= 4) return 'Strong'
    return 'Very Strong'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-6 py-12">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Back button */}
        <Link
          href="/login?type=client"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Login</span>
        </Link>

        {/* Signup card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50 hover:shadow-blue-500/5 transition-all duration-500">
          {/* Logo & Badge */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-3xl font-bold text-gold-400 tracking-wider">PASADA</div>
              <div className="text-sm font-medium text-gold-500/70 tracking-widest">GROUPS</div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border-blue-500/20 border rounded-full">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                Client
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-zinc-400">Join PASADA to start your design journey</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start space-x-3 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <p className="text-green-400 text-sm font-bold">Account created successfully!</p>
                <p className="text-green-300 text-xs mt-1">Please check your email to verify your account.</p>
              </div>
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Google signup button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading || success}
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

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-zinc-900/50 text-zinc-500 uppercase tracking-wider">Or continue with email</span>
            </div>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="fullName">
                Full Name *
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="John Doe"
                  required
                  disabled={loading || success}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="email">
                Email Address *
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (!emailValid) setEmailValid(true)
                  }}
                  onBlur={handleEmailBlur}
                  className={`w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border rounded-xl text-white placeholder-zinc-500 focus:outline-none transition-all ${
                    !emailValid && formData.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading || success}
                  autoComplete="email"
                />
                {!emailValid && formData.email && (
                  <p className="text-red-400 text-xs mt-1 ml-1">Please enter a valid email address</p>
                )}
              </div>
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="phone">
                Phone Number <span className="text-zinc-500 text-xs">(Optional)</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="+1 (555) 123-4567"
                  disabled={loading || success}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Company (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="company">
                Company <span className="text-zinc-500 text-xs">(Optional)</span>
              </label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Your Company Name"
                  disabled={loading || success}
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="password">
                Password *
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-950/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Create a strong password"
                  required
                  disabled={loading || success}
                  autoComplete="new-password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  disabled={loading || success}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength meter */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength <= 1 ? 'text-red-400' :
                      passwordStrength <= 3 ? 'text-orange-400' :
                      passwordStrength <= 4 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          level <= passwordStrength ? getStrengthColor() : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Use 8+ characters with letters, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-200" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3.5 bg-zinc-950/50 border rounded-xl text-white placeholder-zinc-500 focus:outline-none transition-all ${
                    !passwordMatch && formData.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="Confirm your password"
                  required
                  disabled={loading || success}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  disabled={loading || success}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <div className="flex items-center space-x-2 mt-2 text-red-400 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Passwords do not match</span>
                </div>
              )}
              {passwordMatch && formData.confirmPassword && formData.password && (
                <div className="flex items-center space-x-2 mt-2 text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Terms acceptance */}
            <div className="pt-2">
              <label className="flex items-start cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-2 transition-all cursor-pointer" 
                  disabled={loading || success}
                  required
                />
                <span className="ml-3 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || success || !termsAccepted}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl shadow-blue-900/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Account Created!</span>
                </>
              ) : (
                <>
                  <span>Create Client Account</span>
                  <Shield className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login?type=client"
                className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-all"
              >
                Sign in here →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
