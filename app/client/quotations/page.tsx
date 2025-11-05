'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { 
  FileText, LayoutDashboard, FolderOpen, Receipt, Settings, LogOut,
  Calendar, MessageSquare, Download, Eye, ThumbsUp, ThumbsDown, Filter
} from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

interface Quotation {
  id: string
  quotation_number: string
  title: string
  total_amount: number | null
  status: string
  created_at: string
  valid_until: string | null
}

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        setError('Please log in')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('client_id, role')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      if (!profile || !profile.client_id) {
        setError('Client record not found')
        return
      }

      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select('id, quotation_number, title, total_amount, status, created_at, valid_until')
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false })

      if (quotationsError) throw quotationsError

      setQuotations(quotationsData || [])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
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
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">PASADA</h1>
            <p className="text-sm text-muted-foreground">Interior Design</p>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/projects">
                <FolderOpen className="mr-2 h-4 w-4" />
                Projects
              </Link>
            </Button>
            <Button variant="secondary" className="w-full justify-start" asChild>
              <Link href="/client/quotations">
                <Receipt className="mr-2 h-4 w-4" />
                Quotations
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/meetings">
                <Calendar className="mr-2 h-4 w-4" />
                Meetings
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
          </nav>

          <Separator className="my-4" />

          <nav className="space-y-2">
            <ThemeToggle />
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/client/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Quotations</h1>
              <p className="text-muted-foreground">
                Review and manage your project quotations
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                All Quotations
              </Button>
              <Button variant="ghost" size="sm">Pending</Button>
              <Button variant="ghost" size="sm">Approved</Button>
              <Button variant="ghost" size="sm">Rejected</Button>
            </div>

            {/* Quotations Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : quotations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotations.map(quotation => (
                  <Card key={quotation.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{quotation.title}</CardTitle>
                          <CardDescription>#{quotation.quotation_number}</CardDescription>
                        </div>
                        <Badge variant={
                          quotation.status === 'approved' ? 'default' :
                          quotation.status === 'sent' || quotation.status === 'viewed' ? 'secondary' :
                          quotation.status === 'rejected' ? 'destructive' :
                          'outline'
                        }>
                          {formatStatus(quotation.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold">
                          ₹{(quotation.total_amount || 0).toLocaleString('en-IN')}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {new Date(quotation.created_at).toLocaleDateString()}
                        </p>
                        {quotation.valid_until && (
                          <p className="text-sm text-muted-foreground">
                            Valid until {new Date(quotation.valid_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {(quotation.status === 'sent' || quotation.status === 'viewed') && (
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1" asChild>
                        <Link href={`/client/quotations/${quotation.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Quotations Yet</h3>
                  <p className="text-sm text-muted-foreground">Quotations will appear here once they are sent to you</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
