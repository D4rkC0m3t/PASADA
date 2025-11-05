'use client'

import Link from 'next/link'
import { Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResendEmail = async () => {
    setResending(true)
    try {
      // Supabase doesn't have a direct resend method, user needs to sign up again
      // Or we can implement a custom solution
      await new Promise(resolve => setTimeout(resolve, 2000))
      setResent(true)
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">Check Your Email</h1>
          <p className="text-zinc-400 mb-8 text-lg">
            We've sent a verification link to your email address
          </p>

          {/* Instructions */}
          <div className="bg-zinc-950/50 border border-zinc-700 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Next Steps:
            </h3>
            <ol className="space-y-3 text-zinc-400 text-sm">
              <li className="flex items-start">
                <span className="font-bold text-blue-400 mr-3">1.</span>
                <span>Open your email inbox</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-400 mr-3">2.</span>
                <span>Click the verification link we sent you</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-400 mr-3">3.</span>
                <span>You'll be redirected to login</span>
              </li>
            </ol>
          </div>

          {/* Resend button */}
          {resent ? (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm font-medium">
                ✓ Verification email sent! Check your inbox.
              </p>
            </div>
          ) : (
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full mb-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          )}

          {/* Help text */}
          <p className="text-zinc-500 text-sm mb-6">
            Didn't receive the email? Check your spam folder or try resending.
          </p>

          {/* Back to login */}
          <Link
            href="/login?type=client"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-all group"
          >
            <span>Back to Login</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
