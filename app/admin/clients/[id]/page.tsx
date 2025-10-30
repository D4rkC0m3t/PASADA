'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Building, Calendar, FolderKanban, FileText, Plus } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  type: 'residential' | 'commercial'
  notes: string | null
  status: string | null
  created_at: string
  updated_at: string | null
}

interface Project {
  id: string
  name: string
  type: string
  status: string
  budget: number | null
  area_sqft: number | null
  start_date: string | null
  created_at: string
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
  projects: {
    name: string
  }
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clientId) {
      fetchClientData()
    }
  }, [clientId])

  const fetchClientData = async () => {
    try {
      setLoading(true)

      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      setClient(clientData)

      // Fetch projects for this client
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError
      setProjects(projectsData || [])

      // Fetch quotations for this client's projects
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          projects (
            name
          )
        `)
        .in('project_id', projectsData?.map(p => p.id) || [])
        .order('created_at', { ascending: false })

      if (quotationsError) throw quotationsError
      setQuotations(quotationsData || [])

    } catch (error) {
      console.error('Error fetching client data:', error)
      alert('Failed to load client details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated projects and quotations.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error
      
      router.push('/admin/clients')
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client. Make sure there are no dependencies.')
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Client Not Found</h2>
          <Link href="/admin/clients" className="text-yellow-600 hover:text-yellow-500">
            ← Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/clients"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{client.name}</h1>
              <span className={`px-3 py-1 rounded text-sm border ${
                client.type === 'residential'
                  ? 'bg-blue-600/10 text-blue-600 border-blue-600/20'
                  : 'bg-purple-600/10 text-purple-600 border-purple-600/20'
              }`}>
                {client.type === 'residential' ? 'Residential' : 'Commercial'}
              </span>
            </div>
            <p className="text-zinc-400">
              Client since {new Date(client.created_at).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/clients/${clientId}/edit`}
              className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Client</span>
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

      {/* Client Information */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Contact Information */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Building className="w-5 h-5 mr-2 text-yellow-600" />
            Contact Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {client.contact_name && (
              <div>
                <label className="text-sm text-zinc-500 mb-1 block">Contact Person</label>
                <p className="text-white font-medium">{client.contact_name}</p>
              </div>
            )}
            
            {client.email && (
              <div>
                <label className="text-sm text-zinc-500 mb-1 block">Email</label>
                <a 
                  href={`mailto:${client.email}`}
                  className="text-white hover:text-yellow-600 transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {client.email}
                </a>
              </div>
            )}
            
            {client.phone && (
              <div>
                <label className="text-sm text-zinc-500 mb-1 block">Phone</label>
                <a 
                  href={`tel:${client.phone}`}
                  className="text-white hover:text-yellow-600 transition-colors flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {client.phone}
                </a>
              </div>
            )}
            
            {(client.address || client.city) && (
              <div className="md:col-span-2">
                <label className="text-sm text-zinc-500 mb-1 block">Address</label>
                <div className="text-white flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    {client.address && <p>{client.address}</p>}
                    {(client.city || client.state || client.pincode) && (
                      <p>
                        {[client.city, client.state, client.pincode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {client.notes && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <label className="text-sm text-zinc-500 mb-2 block">Notes</label>
              <p className="text-zinc-300 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FolderKanban className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-white">{projects.length}</span>
            </div>
            <p className="text-zinc-400">Total Projects</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-white">{quotations.length}</span>
            </div>
            <p className="text-zinc-400">Quotations</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-white">
                {projects.filter(p => p.status === 'in_progress').length}
              </span>
            </div>
            <p className="text-zinc-400">Active Projects</p>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FolderKanban className="w-6 h-6 mr-2 text-yellow-600" />
            Projects ({projects.length})
          </h2>
          <Link
            href={`/admin/projects/new?client=${clientId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <FolderKanban className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">No projects yet</p>
            <Link
              href={`/admin/projects/new?client=${clientId}`}
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
            >
              <Plus className="w-4 h-4" />
              <span>Create first project</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-yellow-600/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-yellow-600 transition-colors">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Type:</span>
                    <span className="text-white capitalize">{project.type}</span>
                  </div>
                  {project.budget && (
                    <div className="flex items-center justify-between">
                      <span>Budget:</span>
                      <span className="text-white">₹{project.budget.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {project.area_sqft && (
                    <div className="flex items-center justify-between">
                      <span>Area:</span>
                      <span className="text-white">{project.area_sqft.toLocaleString('en-IN')} sq.ft</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span>Created:</span>
                    <span className="text-white">
                      {new Date(project.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quotations Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-yellow-600" />
          Quotations ({quotations.length})
        </h2>

        {quotations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">No quotations yet</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Quotation</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Project</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Amount</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/quotations/${quotation.id}`}
                        className="text-white hover:text-yellow-600 transition-colors"
                      >
                        {quotation.title}
                        <span className="text-xs text-zinc-500 ml-2">v{quotation.version}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{quotation.projects?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      ₹{quotation.total_amount.toLocaleString('en-IN')}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
