'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { 
  Folder, LayoutDashboard, FolderOpen, Receipt, Settings, LogOut,
  Calendar, MessageSquare, ArrowRight, Plus, Filter, Search
} from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"

interface Project {
  id: string
  name: string
  status: string
  budget: number | null
  start_date: string | null
  completion_percentage: number | null
  type: string | null
  description: string | null
}

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
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

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      setProjects(projectsData || [])
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
            <Button variant="secondary" className="w-full justify-start" asChild>
              <Link href="/client/projects">
                <FolderOpen className="mr-2 h-4 w-4" />
                Projects
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Projects</h1>
                <p className="text-muted-foreground">
                  Manage and track all your interior design projects
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                All Projects
              </Button>
              <Button variant="ghost" size="sm">In Progress</Button>
              <Button variant="ghost" size="sm">Completed</Button>
              <Button variant="ghost" size="sm">Planning</Button>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/client/projects/${project.id}`)}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge variant={
                          project.status === 'completed' ? 'default' :
                          project.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {formatStatus(project.status)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {project.type ? formatStatus(project.type) : 'Interior Design'}
                        {project.start_date && ` • Started ${new Date(project.start_date).toLocaleDateString()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.completion_percentage || 0}%</span>
                          </div>
                          <Progress value={project.completion_percentage || 0} />
                        </div>
                        {project.budget && (
                          <p className="text-sm text-muted-foreground">
                            Budget: ₹{project.budget.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="w-full">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Folder className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Your projects will appear here once they are created</p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Request a Project
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
