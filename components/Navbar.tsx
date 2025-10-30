'use client'

/**
 * Public Website Navbar
 * Used for PASADA website pages (not CRM)
 */

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/en" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-lg"></div>
            <span className="text-xl font-semibold text-white">PASADA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/en" className="text-zinc-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/en/about" className="text-zinc-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/en/projects" className="text-zinc-300 hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/en/contant-us" className="text-zinc-300 hover:text-white transition-colors">
              Contact
            </Link>
            <Link 
              href="/admin/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-700 text-white rounded-lg hover:shadow-lg transition-all"
            >
              CRM Dashboard
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/en"
              className="block px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/en/about"
              className="block px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/en/projects"
              className="block px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/en/contant-us"
              className="block px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/admin/dashboard"
              className="block px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-700 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              CRM Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
