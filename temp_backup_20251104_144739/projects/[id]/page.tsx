'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, User, MapPin, Building, Calendar, DollarSign, Ruler, FileText, Plus } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Project {
  id: string
  name: string
  client_id: string
  site_location: string | null
  type: string
  area_sqft: number | null
  status: string
  budget: number | null
  timeline_days: number | null
  start_date: string | null
  end_date: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  clients: {
    id: string
    name: string
    contact_name: string | null
    email: string | null
    phone: string | null
  }
}

interface Quotation {
  id: string
  title: string
  total_amount: number
  tax_percent: number | null
  discount: number | null
  status: string
  version: number
  created_at: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      setLoading(true)

      // Fetch project with client details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            id,
            name,
            contact_name,
            email,
            phone
          )
        `)
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Fetch quotations for this project
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (quotationsError) throw quotationsError
      setQuotations(quotationsData || [])

    } catch (error) {
      console.error('Error fetching project data:', error)
      alert('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated quotations.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      
      router.push('/admin/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Make sure there are no dependencies.')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      inquiry: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      proposal: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      approved: 'bg-green-600/10 text-green-600 border-green-600/20',
      in_progress: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
      completed: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
      on_hold: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
      cancelled: 'bg-red-600/10 text-red-600 border-red-600/20',
      draft: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
      sent: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      rejected: 'bg-red-600/10 text-red-600 border-red-600/20',
      expired: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    }
    return colors[status] || 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      residential: 'bg-blue-600/10 text-blue-600',
      commercial: 'bg-purple-600/10 text-purple-600',
      retail: 'bg-pink-600/10 text-pink-600',
      hospitality: 'bg-green-600/10 text-green-600',
      other: 'bg-zinc-600/10 text-zinc-400',
    }
    return colors[type] || 'bg-zinc-600/10 text-zinc-400'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
          <Link href="/admin/projects" className="text-yellow-600 hover:text-yellow-500">
            ← Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  const calculateEndDate = () => {
    if (project.start_date && project.timeline_days) {
      const start = new Date(project.start_date)
      const end = new Date(start)
      end.setDate(end.getDate() + project.timeline_days)
      return end
    }
    return null
  }

  const endDate = calculateEndDate()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/projects"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded text-sm ${getTypeColor(project.type)}`}>
                {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
              </span>
            </div>
            <p className="text-zinc-400">
              Created {new Date(project.created_at).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/projects/${projectId}/edit`}
              className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Project</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600/10 text-red-600 rounded-lg hover:bg-red-600/20 transition-all border border-red-600/20"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-yellow-600" />
              Client Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-500 mb-1 block">Client Name</label>
                <Link 
                  href={`/admin/clients/${project.clients.id}`}
                  className="text-lg font-medium text-white hover:text-yellow-600 transition-colors"
                >
                  {project.clients.name}
                </Link>
              </div>
              
              {project.clients.contact_name && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Contact Person</label>
                  <p className="text-white">{project.clients.contact_name}</p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                {project.clients.email && (
                  <div>
                    <label className="text-sm text-zinc-500 mb-1 block">Email</label>
                    <a 
                      href={`mailto:${project.clients.email}`}
                      className="text-white hover:text-yellow-600 transition-colors"
                    >
                      {project.clients.email}
                    </a>
                  </div>
                )}
                
                {project.clients.phone && (
                  <div>
                    <label className="text-sm text-zinc-500 mb-1 block">Phone</label>
                    <a 
                      href={`tel:${project.clients.phone}`}
                      className="text-white hover:text-yellow-600 transition-colors"
                    >
                      {project.clients.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-yellow-600" />
              Project Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {project.site_location && (
                <div className="md:col-span-2">
                  <label className="text-sm text-zinc-500 mb-1 block">Site Location</label>
                  <div className="text-white flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-yellow-600" />
                    <p>{project.site_location}</p>
                  </div>
                </div>
              )}
              
              {project.area_sqft && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Area</label>
                  <div className="text-white flex items-center">
                    <Ruler className="w-4 h-4 mr-2 text-yellow-600" />
                    <p>{project.area_sqft.toLocaleString('en-IN')} sq.ft</p>
                  </div>
                </div>
              )}
              
              {project.budget && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Budget</label>
                  <div className="text-white flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-yellow-600" />
                    <p>₹{project.budget.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>

            {project.notes && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <label className="text-sm text-zinc-500 mb-2 block">Notes</label>
                <p className="text-zinc-300 whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline & Stats */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
              Timeline
            </h3>
            
            <div className="space-y-4">
              {project.start_date && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Start Date</label>
                  <p className="text-white">
                    {new Date(project.start_date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              {project.timeline_days && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Duration</label>
                  <p className="text-white">{project.timeline_days} days</p>
                </div>
              )}
              
              {endDate && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Expected Completion</label>
                  <p className="text-white">
                    {endDate.toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              {!project.start_date && !project.timeline_days && (
                <p className="text-zinc-500 text-sm">No timeline set</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-white">{quotations.length}</span>
            </div>
            <p className="text-zinc-400">Quotations</p>
          </div>

          {quotations.filter(q => q.status === 'approved').length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-white">
                  ₹{quotations
                    .filter(q => q.status === 'approved')
                    .reduce((sum, q) => sum + q.total_amount, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-zinc-400">Approved Value</p>
            </div>
          )}
        </div>
      </div>

      {/* Quotations Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-2 text-yellow-600" />
            Quotations ({quotations.length})
          </h2>
          <Link
            href={`/admin/quotations/new?project=${projectId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </Link>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">No quotations yet</p>
            <Link
              href={`/admin/quotations/new?project=${projectId}`}
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
            >
              <Plus className="w-4 h-4" />
              <span>Create first quotation</span>
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Quotation</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Amount</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Date</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {quotations.map((quotation) => {
                  const subtotal = quotation.total_amount
                  const discount = quotation.discount || 0
                  const afterDiscount = subtotal - discount
                  const tax = (quotation.tax_percent || 0) / 100 * afterDiscount
                  const total = afterDiscount + tax

                  return (
                    <tr key={quotation.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{quotation.title}</div>
                        <div className="text-xs text-zinc-500">Version {quotation.version}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-white font-medium">₹{total.toLocaleString('en-IN')}</div>
                        {quotation.tax_percent && (
                          <div className="text-xs text-zinc-500">incl. {quotation.tax_percent}% tax</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded text-xs border ${getStatusColor(quotation.status)}`}>
                            {quotation.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-400 text-sm">
                        {new Date(quotation.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Link
                            href={`/admin/quotations/${quotation.id}`}
                            className="text-yellow-600 hover:text-yellow-500 text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
