'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, ArrowLeft, FolderOpen } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ClientLayout } from '@/app/components/ClientLayout'

interface Project {
  id: string
  name: string
  description: string | null
  type: string | null
  site_location: string | null
  area_sqft: number | null
  status: string
  budget: number | null
  actual_cost: number | null
  start_date: string | null
  end_date: string | null
  completion_date: string | null
  created_at: string
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  // We'll use this state if we need to display client name in the future
  const [clientName, setClientName] = useState('')
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchClientProjects()
  }, [])

  const fetchClientProjects = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user logged in')
        return
      }

      // Get user profile to find client_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // For now, we'll fetch projects by email matching
      // In production, you'd have a proper client_id relationship
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('email', user.email)
        .single()

      if (clientError) {
        console.error('Client not found:', clientError)
        setProjects([])
        return
      }

      // Store client name if needed for UI
      // Currently not used but keeping for future features
      setClientName(clientData.name)

      // Fetch projects for this client
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      setProjects(projectsData || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
      design: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      quotation: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      approved: 'bg-green-600/10 text-green-600 border-green-600/20',
      in_progress: 'bg-cyan-600/10 text-cyan-600 border-cyan-600/20',
      completed: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
      on_hold: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
      cancelled: 'bg-red-600/10 text-red-600 border-red-600/20',
    }
    return colors[status] || colors.planning
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateProgress = (project: Project) => {
    if (project.status === 'completed') return 100
    if (project.status === 'cancelled') return 0
    
    const statusProgress: Record<string, number> = {
      planning: 10,
      design: 25,
      quotation: 40,
      approved: 50,
      in_progress: 75,
      on_hold: 50,
    }
    
    return statusProgress[project.status] || 0
  }

  return (
    <ClientLayout 
      title="My Projects" 
      subtitle="View and track your interior design projects"
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/client/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
            <p className="text-zinc-400">Loading your projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 glassmorphic-card">
            <FolderOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
            <p className="text-zinc-400 mb-6">You don't have any projects assigned yet.</p>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
            >
              <span>Go to Dashboard</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="glassmorphic-card p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-semibold text-white">{project.name}</h2>
                      <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-zinc-400 text-sm mb-3">{project.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {project.type && (
                        <div>
                          <div className="text-zinc-500 mb-1">Type</div>
                          <div className="text-white capitalize">{project.type.replace('_', ' ')}</div>
                        </div>
                      )}
                      {project.site_location && (
                        <div>
                          <div className="text-zinc-500 mb-1">Location</div>
                          <div className="text-white">{project.site_location}</div>
                        </div>
                      )}
                      {project.area_sqft && (
                        <div>
                          <div className="text-zinc-500 mb-1">Area</div>
                          <div className="text-white">{project.area_sqft} sq ft</div>
                        </div>
                      )}
                      {project.budget && (
                        <div>
                          <div className="text-zinc-500 mb-1">Budget</div>
                          <div className="text-white">₹{project.budget.toLocaleString('en-IN')}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/client/projects/${project.id}`}
                    className="glass-button flex items-center space-x-2 px-4 py-2 ml-4"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                </div>

                {/* Timeline */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="glass-card p-4">
                    <div className="text-zinc-400 text-xs mb-1">Start Date</div>
                    <div className="text-white font-medium">{formatDate(project.start_date)}</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-zinc-400 text-xs mb-1">Expected End</div>
                    <div className="text-white font-medium">{formatDate(project.end_date)}</div>
                  </div>
                  {project.completion_date && (
                    <div className="glass-card p-4">
                      <div className="text-zinc-400 text-xs mb-1">Completed On</div>
                      <div className="text-green-400 font-medium">{formatDate(project.completion_date)}</div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Progress</span>
                    <span className="text-white font-medium">{calculateProgress(project)}%</span>
                  </div>
                  <div className="w-full bg-pasada-900/50 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        project.status === 'completed' ? 'bg-green-600' :
                        project.status === 'cancelled' ? 'bg-red-600' :
                        project.status === 'on_hold' ? 'bg-orange-600' :
                        'bg-blue-600'
                      }`}
                      style={{ width: `${calculateProgress(project)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget Tracking */}
                {project.budget && (
                  <div className="mt-4 pt-4 glass-divider">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-zinc-400 text-sm">Budget Allocated</span>
                        <div className="text-white font-medium">₹{project.budget.toLocaleString('en-IN')}</div>
                      </div>
                      {project.actual_cost && (
                        <div className="text-right">
                          <span className="text-zinc-400 text-sm">Actual Cost</span>
                          <div className={`font-medium ${
                            project.actual_cost > project.budget ? 'text-red-400' : 'text-green-400'
                          }`}>
                            ₹{project.actual_cost.toLocaleString('en-IN')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && projects.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <div className="text-sm text-blue-300">Total Projects</div>
            </div>
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-blue-400">
                {projects.filter(p => p.status === 'in_progress').length}
              </div>
              <div className="text-sm text-blue-300">In Progress</div>
            </div>
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-green-400">
                {projects.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-blue-300">Completed</div>
            </div>
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-blue-400">
                {projects.filter(p => ['planning', 'design', 'quotation'].includes(p.status)).length}
              </div>
              <div className="text-sm text-blue-300">Planning</div>
            </div>
          </div>
        )}
    </ClientLayout>
  )
}
