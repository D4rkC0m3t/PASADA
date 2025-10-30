'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, FolderKanban, FileText, Package, Calendar, Settings, LogOut, Bell, BarChart3 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

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
    { name: 'Quotations', href: '/admin/quotations', icon: FileText },
    { name: 'Materials', href: '/admin/materials', icon: Package },
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-pasada-950 border-r border-pasada-900 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-pasada-900">
          <Link href="/admin/dashboard" className="flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-400 tracking-wider">PASADA</div>
              <div className="text-sm font-medium text-gold-500/70 tracking-widest">GROUPS</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-400'
                    : 'text-pasada-300 hover:text-[#fff8f1] hover:bg-pasada-900/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-pasada-900 space-y-2">
          <button className="flex items-center space-x-3 px-4 py-3 text-pasada-300 hover:text-[#fff8f1] hover:bg-pasada-900/50 rounded-lg transition-all w-full">
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
            <span className="ml-auto bg-gold-500 text-pasada-950 text-xs font-semibold rounded-full px-2 py-0.5">3</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-pasada-300 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
}
