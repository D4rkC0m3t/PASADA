'use client'

/**
 * CRMLayout Component
 * Shared layout for all CRM pages (admin & client dashboards)
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Package, 
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface CRMLayoutProps {
  children: React.ReactNode
  userRole?: 'admin' | 'client'
  userName?: string
}

export default function CRMLayout({ children, userRole = 'admin', userName }: CRMLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const adminNav = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/clients', icon: Users, label: 'Clients' },
    { href: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/admin/materials', icon: Package, label: 'Materials' },
    { href: '/admin/quotations', icon: FileText, label: 'Quotations' },
  ]

  const clientNav = [
    { href: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/client/projects', icon: FolderKanban, label: 'My Projects' },
    { href: '/client/quotations', icon: FileText, label: 'Quotations' },
  ]

  const navigation = userRole === 'admin' ? adminNav : clientNav

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-zinc-900 border-r border-zinc-800
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-lg"></div>
                <span className="text-xl font-semibold text-white">PASADA CRM</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {userName && (
              <p className="mt-2 text-sm text-zinc-400">
                {userRole === 'admin' ? 'Administrator' : 'Client'}: {userName}
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-700 text-white' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800">
            <Link
              href="/en"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mb-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Public Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-zinc-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
