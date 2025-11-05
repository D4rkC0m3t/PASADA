'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, MapPin, DollarSign, Calendar } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Project {
  id: string
  name: string
  client_id: string
  site_location: string | null
  type: 'residential' | 'commercial' | 'retail' | 'hospitality' | 'other'
  area_sqft: number | null
  status: 'inquiry' | 'proposal' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  budget: number | null
  created_at: string
  clients: {
    name: string
  }
}

import AuthGuard from '@/components/AuthGuard'


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'inquiry' | 'proposal' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 20
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchProjects()
  }, [currentPage, searchTerm, filterStatus])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      
      let query = supabase
        .from('projects')
        .select(`
          *,
          clients (
            name
          )
        `, { count: 'exact' })
      
      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,site_location.ilike.%${searchTerm}%`)
      }
      
      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }
      
      const { data, error, count } = await query
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }
  
  const handleFilterChange = (value: typeof filterStatus) => {
    setFilterStatus(value)
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      inquiry: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      proposal: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      approved: 'bg-green-600/10 text-green-600 border-green-600/20',
      in_progress: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
      completed: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
      on_hold: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
      cancelled: 'bg-red-600/10 text-red-600 border-red-600/20',
    }
    return colors[status as keyof typeof colors] || colors.inquiry
  }

  // Calculate stats from ALL projects (for accurate totals)
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, totalBudget: 0 })
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from('projects')
          .select('status, budget')
        
        if (data) {
          setStats({
            total: data.length,
            inProgress: data.filter(p => p.status === 'in_progress').length,
            completed: data.filter(p => p.status === 'completed').length,
            totalBudget: data.reduce((sum, p) => sum + (p.budget || 0), 0)
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <AuthGuard requiredRole="admin">
    <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-zinc-400">Manage all your interior design projects</p>
          </div>
          <Link
            href="/admin/projects/new"
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value as typeof filterStatus)}
            className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="inquiry">Inquiry</option>
            <option value="proposal">Proposal</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="mb-6 text-sm text-zinc-400">
            Showing {projects.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE + 1) : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} projects
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            <p className="text-zinc-400 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-zinc-400 text-lg">No projects found</p>
            <Link
              href="/admin/projects/new"
              className="inline-block mt-4 text-yellow-600 hover:text-yellow-500"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-yellow-600/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                    <p className="text-sm text-zinc-400">{project.clients?.name || 'Unknown Client'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs border ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {project.site_location && (
                    <div className="flex items-center text-sm text-zinc-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{project.site_location}</span>
                    </div>
                  )}
                  {project.budget && (
                    <div className="flex items-center text-sm text-zinc-400">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>₹{project.budget.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {project.area_sqft && (
                    <div className="flex items-center text-sm text-zinc-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{project.area_sqft} sq.ft</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="p-2 text-zinc-400 hover:text-yellow-600 hover:bg-yellow-600/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-600/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
    <AuthGuard requiredRole="admin">
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        currentPage === pageNum
                          ? 'bg-yellow-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {pageNum}
                    </button>
    </AuthGuard>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
          </>
        )}

        {/* Stats */}
        {!loading && stats.total > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-zinc-400">Total Projects</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.inProgress}</div>
              <div className="text-sm text-zinc-400">In Progress</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
              <div className="text-sm text-zinc-400">Completed</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                ₹{stats.totalBudget.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-zinc-400">Total Budget</div>
            </div>
          </div>
        )}
    </div>
    </AuthGuard>
  )
}

