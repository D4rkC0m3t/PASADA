'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { 
  MessageSquare, LayoutDashboard, FolderOpen, Receipt, Settings, LogOut,
  Calendar, Send
} from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login?type=client')
  }

  return (
    <AuthGuard requiredRole="client">
      <div className="min-h-screen bg-background">
        <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">PASADA</h1>
            <p className="text-sm text-muted-foreground">Interior Design</p>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/projects"><FolderOpen className="mr-2 h-4 w-4" />Projects</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/quotations"><Receipt className="mr-2 h-4 w-4" />Quotations</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/meetings"><Calendar className="mr-2 h-4 w-4" />Meetings</Link>
            </Button>
            <Button variant="secondary" className="w-full justify-start" asChild>
              <Link href="/client/messages"><MessageSquare className="mr-2 h-4 w-4" />Messages</Link>
            </Button>
          </nav>

          <Separator className="my-4" />

          <nav className="space-y-2">
            <ThemeToggle />
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />Logout
            </Button>
          </nav>
        </aside>

        <main className="ml-64 p-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Messages</h1>
              <p className="text-muted-foreground">
                Communicate with your design team
              </p>
            </div>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Messages Coming Soon</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Direct messaging with your designers will be available soon
                </p>
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
