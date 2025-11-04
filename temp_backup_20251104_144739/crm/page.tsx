'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Users, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export default function CRMPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-[#2b2b2b] bg-[#0a0a0a]/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 tracking-wider">PASADA</div>
              <div className="text-xs font-medium text-yellow-500/70 tracking-widest">GROUPS</div>
            </div>
          </div>
          <Link 
            href="/"
            className="text-sm text-gray-400 hover:text-yellow-400 transition-colors"
          >
            Back to Website
          </Link>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-yellow-400">CRM Portal</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your interior design projects, clients, and quotations all in one place.
          </p>
        </motion.div>

        {/* Portal Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Admin Portal */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative group"
          >
            <Link href="/login?type=admin">
              <div className="bg-gradient-to-br from-[#252525] to-[#1a1a1a] rounded-2xl p-8 border border-[#333] hover:border-yellow-400/50 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 transition-colors">
                  <Shield className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Admin Portal</h2>
                <p className="text-gray-400 mb-6">
                  Full access to manage clients, projects, materials, and system settings.
                </p>
                <div className="flex items-center text-yellow-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Login as Admin
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Client Portal */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative group"
          >
            <Link href="/login?type=client">
              <div className="bg-gradient-to-br from-[#252525] to-[#1a1a1a] rounded-2xl p-8 border border-[#333] hover:border-yellow-400/50 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-blue-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-400/20 transition-colors">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Client Portal</h2>
                <p className="text-gray-400 mb-6">
                  View your projects, quotations, and communicate with your design team.
                </p>
                <div className="flex items-center text-yellow-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Login as Client
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2b2b2b] text-center">
            <TrendingUp className="w-10 h-10 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
            <p className="text-sm text-gray-400">Track your business performance with live data</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2b2b2b] text-center">
            <Calendar className="w-10 h-10 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Project Management</h3>
            <p className="text-sm text-gray-400">Organize and track all your design projects</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2b2b2b] text-center">
            <Users className="w-10 h-10 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Client Collaboration</h3>
            <p className="text-sm text-gray-400">Seamless communication with your clients</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
