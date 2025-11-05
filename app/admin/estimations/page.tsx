'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, FileText, ArrowRight, Trash2, Download } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'

interface Estimation {
  id: string
  estimation_number: string
  title: string
  project_id: string | null
  client_id: string | null
  estimation_type: 'rough' | 'detailed' | 'fixed'
  subtotal: number
  discount: number
  total: number
  status: 'draft' | 'sent' | 'converted' | 'expired'
  validity_days: number
  created_at: string
  converted_to_quotation_id: string | null
  projects?: {
    name: string
    clients: {
      name: string
    }
  } | null
  clients?: {
    name: string
  } | null
}

export default function EstimationsPage() {
  const [estimations, setEstimations] = useState<Estimation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'converted' | 'expired'>('all')
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchEstimations()
  }, [])

  const fetchEstimations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('estimations')
        .select(`
          *,
          projects (
            name,
            clients (
              name
            )
          ),
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEstimations(data || [])
    } catch (error) {
      console.error('Error fetching estimations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, estimationNumber: string) => {
    if (!confirm(`Are you sure you want to delete estimation ${estimationNumber}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('estimations')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('Estimation deleted successfully!')
      fetchEstimations()
    } catch (error) {
      console.error('Error deleting estimation:', error)
      alert('Failed to delete estimation. Please try again.')
    }
  }

  const handleDownloadPDF = async (estimationId: string, estimationNumber: string) => {
    try {
      const response = await fetch(`/api/estimations/${estimationId}/pdf`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate PDF')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Estimation-${estimationNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error downloading PDF:', error)
      alert(error.message || 'Failed to download PDF. Please try again.')
    }
  }

  const filteredEstimations = estimations.filter(estimation => {
    const matchesSearch = estimation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimation.estimation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimation.projects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimation.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || estimation.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
      sent: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      converted: 'bg-green-600/10 text-green-600 border-green-600/20',
      expired: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      rough: 'Rough (±20%)',
      detailed: 'Detailed (±10%)',
      fixed: 'Fixed Price',
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Estimations</h1>
            <p className="text-zinc-400">Quick cost calculations before formal quotations</p>
          </div>
          <Link
            href="/admin/estimations/new"
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Estimation</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search estimations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="converted">Converted</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Estimations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            <p className="text-zinc-400 mt-4">Loading estimations...</p>
          </div>
        ) : filteredEstimations.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">No estimations found</p>
            <Link
              href="/admin/estimations/new"
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first estimation</span>
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Estimation</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Client/Project</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Type</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Amount</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredEstimations.map((estimation) => (
                  <tr key={estimation.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{estimation.title}</div>
                          <div className="text-sm text-zinc-500">{estimation.estimation_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {estimation.projects ? (
                          <>
                            <div className="text-white">{estimation.projects.clients.name}</div>
                            <div className="text-zinc-500">{estimation.projects.name}</div>
                          </>
                        ) : estimation.clients ? (
                          <div className="text-white">{estimation.clients.name}</div>
                        ) : (
                          <div className="text-zinc-500">No client</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-400">
                        {getTypeLabel(estimation.estimation_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-medium">
                        ₹{estimation.total.toLocaleString('en-IN')}
                      </div>
                      {estimation.discount > 0 && (
                        <div className="text-xs text-zinc-500">
                          Discount: ₹{estimation.discount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(estimation.status)}`}>
                          {estimation.status.charAt(0).toUpperCase() + estimation.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/estimations/${estimation.id}`}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(estimation.id, estimation.estimation_number)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {estimation.status !== 'converted' && (
                          <Link
                            href={`/admin/estimations/${estimation.id}/convert`}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Convert to Quotation"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        {estimation.status === 'draft' && (
                          <button
                            onClick={() => handleDelete(estimation.id, estimation.estimation_number)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

