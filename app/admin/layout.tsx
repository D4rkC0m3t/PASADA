'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, FolderKanban, FileText, Package, Calendar, Settings, LogOut, Bell, BarChart3, Calculator, Receipt, ChevronLeft, Menu, X, Truck } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useState } from 'react'
import '@/app/styles/dashboard-theme.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Use replace to prevent back button from returning to dashboard
    router.replace('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Analytics & Leads', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Estimations', href: '/admin/estimations', icon: Calculator },
    { name: 'Quotations', href: '/admin/quotations', icon: FileText },
    { name: 'E-Invoice', href: '/admin/invoices', icon: Receipt },
    { name: 'Materials', href: '/admin/materials', icon: Package },
    { name: 'Vendors', href: '/admin/vendors', icon: Truck },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen dashboard-dark">
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[1001] p-2 bg-[#2a2e30] border border-[rgba(255,255,255,0.08)] rounded-lg text-white hover:bg-[#2f3335] transition-all"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Premium Glassmorphic Sidebar */}
      <aside className={`premium-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle hidden lg:flex"
        >
          <ChevronLeft className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/admin/dashboard">
            <div className="sidebar-logo-text">
              <div className="sidebar-logo-main">PASADA</div>
              <div className="sidebar-logo-sub">GROUPS</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
              >
                <Icon className="sidebar-nav-icon" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-footer">
          <button className="sidebar-footer-btn">
            <Bell className="sidebar-nav-icon" />
            <span>Notifications</span>
            <span className="sidebar-nav-badge">3</span>
          </button>
          <button
            onClick={handleLogout}
            className="sidebar-footer-btn logout"
          >
            <LogOut className="sidebar-nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${collapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'} ml-0`}>
        {children}
      </main>
    </div>
  )
}
