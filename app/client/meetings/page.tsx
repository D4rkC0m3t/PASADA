'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { 
  Calendar as CalendarIcon, LayoutDashboard, FolderOpen, Receipt, Settings, LogOut,
  MessageSquare, Plus, Clock
} from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

interface Booking {
  id: string
  title: string
  scheduled_date: string
  scheduled_time: string | null
  booking_type: string
  status: string
}

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export default function MeetingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('client_id')
        .eq('id', user.id)
        .single()

      if (!profile?.client_id) return

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', profile.client_id)
        .order('scheduled_date', { ascending: true })

      setBookings(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

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
            <Button variant="secondary" className="w-full justify-start" asChild>
              <Link href="/client/meetings"><CalendarIcon className="mr-2 h-4 w-4" />Meetings</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Meetings</h1>
                <p className="text-muted-foreground">Schedule and manage your consultations</p>
              </div>
              <Button asChild>
                <Link href="/book-consultation">
                  <Plus className="mr-2 h-4 w-4" />Book Meeting
                </Link>
              </Button>
            </div>

            {bookings.length > 0 ? (
              <div className="grid gap-4">
                {bookings.map(booking => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <CalendarIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle>{booking.title}</CardTitle>
                            <CardDescription>{formatStatus(booking.booking_type)}</CardDescription>
                          </div>
                        </div>
                        <Badge>{formatStatus(booking.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{new Date(booking.scheduled_date).toLocaleDateString('en-US', { 
                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                          })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">{booking.scheduled_time || 'TBD'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Meetings Scheduled</h3>
                  <p className="text-sm text-muted-foreground mb-4">Book a consultation to get started</p>
                  <Button asChild>
                    <Link href="/book-consultation">
                      <Plus className="mr-2 h-4 w-4" />Book Consultation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
