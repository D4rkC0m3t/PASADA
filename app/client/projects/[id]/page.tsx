'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Home, FolderOpen, FileText, Calendar, MessageSquare, LogOut, ArrowLeft, 
  MapPin, Ruler, IndianRupee, Clock, User, Upload, Eye,
  CheckCircle, XCircle, AlertCircle, PlayCircle, PauseCircle, Package
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentUpload from '@/components/DocumentUpload'

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
  clients: {
    name: string
    email: string
    phone: string | null
  }
}

interface Quotation {
  id: string
  quotation_number: string
  title: string
  total_amount: number
  status: string
  created_at: string
}

interface ActivityLog {
  id: string
  action: string
  details: string | null
  created_at: string
  user_profiles: {
    full_name: string
  } | null
}

export default function ClientProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'quotations' | 'documents'>('overview')
  const supabase = createBrowserClient()

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
      fetchQuotations()
      fetchActivities()
    }
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            name,
            email,
            phone
          )
        `)
        .eq('id', projectId)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('id, quotation_number, title, total_amount, status, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
    }
  }

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          id,
          action,
          details,
          created_at,
          user_profiles (
            full_name
          )
        `)
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      // Transform the response to match ActivityLog interface
      const transformedData: ActivityLog[] = (data || []).map((item: any) => ({
        id: item.id,
        action: item.action,
        details: item.details,
        created_at: item.created_at,
        user_profiles: Array.isArray(item.user_profiles) && item.user_profiles.length > 0 
          ? item.user_profiles[0] 
          : null
      }))
      
      setActivities(transformedData)
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      planning: AlertCircle,
      design: Package,
      quotation: FileText,
      approved: CheckCircle,
      in_progress: PlayCircle,
      completed: CheckCircle,
      on_hold: PauseCircle,
      cancelled: XCircle,
    }
    const Icon = icons[status] || AlertCircle
    return Icon
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

  const getQuotationStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-600/10 text-gray-600 border-gray-600/20',
      sent: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      viewed: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      approved: 'bg-green-600/10 text-green-600 border-green-600/20',
      rejected: 'bg-red-600/10 text-red-600 border-red-600/20',
    }
    return colors[status] || colors.draft
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateProgress = () => {
    if (!project) return 0
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

  const calculateDaysRemaining = () => {
    if (!project?.end_date) return null
    const endDate = new Date(project.end_date)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
          <p className="text-zinc-400">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Project Not Found</h3>
          <p className="text-zinc-400 mb-6">This project doesn't exist or you don't have access to it.</p>
          <Link
            href="/client/projects"
            className="glass-button inline-flex items-center space-x-2 px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(project.status)
  const daysRemaining = calculateDaysRemaining()

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 p-6 z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-white">PASADA</span>
        </div>

        <nav className="space-y-2">
          <Link href="/client/dashboard" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/client/projects" className="flex items-center space-x-3 px-4 py-3 bg-yellow-600/10 text-yellow-600 rounded-lg">
            <FolderOpen className="w-5 h-5" />
            <span>My Projects</span>
          </Link>
          <Link href="/client/quotations" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <FileText className="w-5 h-5" />
            <span>Quotations</span>
          </Link>
          <Link href="/client/bookings" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <Calendar className="w-5 h-5" />
            <span>Bookings</span>
          </Link>
          <Link href="/client/messages" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/login" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/projects"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">{project.name}</h1>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(project.status)}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-medium">{project.status.replace('_', ' ').toUpperCase()}</span>
                </span>
                {project.type && (
                  <span className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 capitalize">
                    {project.type.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="ml-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-w-[280px]">
              <div className="space-y-4">
                <div>
                  <div className="text-zinc-400 text-sm mb-1">Progress</div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-zinc-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          project.status === 'completed' ? 'bg-green-600' :
                          project.status === 'cancelled' ? 'bg-red-600' :
                          project.status === 'on_hold' ? 'bg-orange-600' :
                          'bg-blue-600'
                        }`}
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-bold text-lg">{calculateProgress()}%</span>
                  </div>
                </div>

                {daysRemaining !== null && project.status !== 'completed' && (
                  <div>
                    <div className="text-zinc-400 text-sm mb-1">Time Remaining</div>
                    <div className={`text-2xl font-bold ${
                      daysRemaining < 0 ? 'text-red-400' :
                      daysRemaining < 7 ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days`}
                    </div>
                  </div>
                )}

                {project.budget && (
                  <div>
                    <div className="text-zinc-400 text-sm mb-1">Budget</div>
                    <div className="text-xl font-bold text-yellow-600">
                      ₹{project.budget.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-zinc-800">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-2 font-medium transition-all ${
                activeTab === 'overview'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-4 px-2 font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Timeline & Activity
            </button>
            <button
              onClick={() => setActiveTab('quotations')}
              className={`pb-4 px-2 font-medium transition-all ${
                activeTab === 'quotations'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Quotations ({quotations.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-4 px-2 font-medium transition-all ${
                activeTab === 'documents'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Documents
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Project Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Description */}
              {project.description && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-zinc-400 leading-relaxed">{project.description}</p>
                </div>
              )}

              {/* Client Information */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Client Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-zinc-500 text-sm mb-1">Name</div>
                    <div className="text-white font-medium">{project.clients.name}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-sm mb-1">Email</div>
                    <div className="text-white">{project.clients.email}</div>
                  </div>
                        Area
                      </div>
                      <div className="text-white font-medium">{project.area_sqft} sq ft</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-zinc-500 text-sm mb-1">Start Date</div>
                    <div className="text-white font-medium">{formatDate(project.start_date)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-sm mb-1">Expected Completion</div>
                    <div className="text-white font-medium">{formatDate(project.end_date)}</div>
                  </div>
                  {project.completion_date && (
                    <div>
                      <div className="text-zinc-500 text-sm mb-1">Actual Completion</div>
                      <div className="text-green-400 font-medium">{formatDate(project.completion_date)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Budget Tracking */}
            {project.budget && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2" />
                  Budget Overview
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-zinc-400 text-sm mb-2">Budget Allocated</div>
                    <div className="text-3xl font-bold text-white">
                      ₹{project.budget.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {project.actual_cost && (
                    <>
                      <div>
                        <div className="text-zinc-400 text-sm mb-2">Actual Cost</div>
                        <div className={`text-3xl font-bold ${
                          project.actual_cost > project.budget ? 'text-red-400' : 'text-green-400'
                        }`}>
                          ₹{project.actual_cost.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-400 text-sm mb-2">Variance</div>
                        <div className={`text-3xl font-bold ${
                          project.actual_cost > project.budget ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {project.actual_cost > project.budget ? '+' : '-'}
                          ₹{Math.abs(project.budget - project.actual_cost).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Project Activity</h3>
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400">No activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 h-full bg-zinc-800 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-white font-medium">{activity.action}</div>
                        <div className="text-zinc-500 text-sm">{formatDateTime(activity.created_at)}</div>
                      </div>
                      {activity.details && (
                        <div className="text-zinc-400 text-sm mb-2">{activity.details}</div>
                      )}
                      {activity.user_profiles && (
                        <div className="text-zinc-500 text-xs">
                          by {activity.user_profiles.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="space-y-6">
            {quotations.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Quotations</h3>
                <p className="text-zinc-400">No quotations have been created for this project yet.</p>
              </div>
            ) : (
              quotations.map((quotation) => (
                <div key={quotation.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-white">{quotation.title}</h4>
                        <span className={`px-3 py-1 rounded text-xs border ${getQuotationStatusColor(quotation.status)}`}>
                          {quotation.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-400">
                        {quotation.quotation_number} • {formatDate(quotation.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">
                          ₹{quotation.total_amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-zinc-500">Total Amount</div>
                      </div>
                      <Link
                        href={`/client/quotations/${quotation.id}`}
                        className="glass-button flex items-center space-x-2 px-4 py-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <DocumentUpload 
              projectId={projectId}
              onUploadComplete={() => {
                // Optionally refresh documents or show notification
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
