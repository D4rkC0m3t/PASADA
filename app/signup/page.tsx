import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <Link 
          href="/" 
          className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-white">PASADA CRM</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-zinc-400 mb-8">Get started with PASADA CRM today</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-2" />
              <span className="text-sm text-zinc-400">
                I agree to the{' '}
                <Link href="/terms" className="text-yellow-600 hover:text-yellow-500">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-yellow-600 hover:text-yellow-500">Privacy Policy</Link>
              </span>
            </div>

            <button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30 font-medium">
              Create Account
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-600 hover:text-yellow-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
            <p className="text-yellow-600 text-sm text-center">
              🚧 Authentication system coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
