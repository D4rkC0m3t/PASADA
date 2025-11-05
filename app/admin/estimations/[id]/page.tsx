'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, FileText, ArrowRight, Calendar, User, Building, DollarSign } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

interface EstimationItem {
  id: string
  item_number: number
  category: string
  description: string
  specifications: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  notes: string
}

interface Estimation {
  id: string
  estimation_number: string
  title: string
  description: string
  project_id: string | null
  client_id: string | null
  estimation_type: 'rough' | 'detailed' | 'fixed'
  subtotal: number
  discount: number
  total: number
  margin_percent: number
  validity_days: number
  status: 'draft' | 'sent' | 'converted' | 'expired'
  notes: string
  internal_notes: string
  converted_to_quotation_id: string | null
  created_at: string
  projects?: {
    name: string
    clients: {
      name: string
      email: string
      phone: string
    }
  } | null
  clients?: {
    name: string
    email: string
    phone: string
  } | null
}

export default function EstimationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [estimation, setEstimation] = useState<Estimation | null>(null)
  const [items, setItems] = useState<EstimationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchEstimation()
  }, [params.id])

  const fetchEstimation = async () => {
    try {
      setLoading(true)

      // Fetch estimation
      const { data: estimationData, error: estimationError } = await supabase
        .from('estimations')
        .select(`
          *,
          projects (
            name,
            clients (
              name,
              email,
              phone
            )
          ),
          clients (
            name,
            email,
            phone
          )
        `)
        .eq('id', params.id)
        .single()

      if (estimationError) throw estimationError
      setEstimation(estimationData)

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('estimation_items')
        .select('*')
        .eq('estimation_id', params.id)
        .order('item_number', { ascending: true })

      if (itemsError) throw itemsError
      setItems(itemsData || [])
    } catch (error) {
      console.error('Error fetching estimation:', error)
      alert('Failed to load estimation')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${estimation?.estimation_number}?`)) {
      return
    }

    try {
      setDeleting(true)

      const { error } = await supabase
        .from('estimations')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      alert('Estimation deleted successfully!')
      router.push('/admin/estimations')
    } catch (error) {
      console.error('Error deleting estimation:', error)
      alert('Failed to delete estimation')
    } finally {
      setDeleting(false)
    }
  }

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

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-zinc-400 mt-4">Loading estimation...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!estimation) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Estimation not found</p>
            <Link
              href="/admin/estimations"
              className="inline-flex items-center space-x-2 mt-4 text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Estimations</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const client = estimation.projects?.clients || estimation.clients

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/estimations"
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{estimation.title}</h1>
              <p className="text-zinc-400">{estimation.estimation_number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(estimation.status)}`}>
              {estimation.status.charAt(0).toUpperCase() + estimation.status.slice(1)}
            </span>
            {estimation.status !== 'converted' && (
              <>
                <Link
                  href={`/admin/estimations/${params.id}/convert`}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/30"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Convert to Quotation</span>
                </Link>
                {estimation.status === 'draft' && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {estimation.description && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <p className="text-zinc-300">{estimation.description}</p>
              </div>
            )}

            {/* Line Items */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Line Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-zinc-500">#{item.item_number}</span>
                          {item.category && (
                            <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">{item.description}</h3>
                        {item.specifications && (
                          <p className="text-sm text-zinc-400 mb-2">{item.specifications}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          ₹{item.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-zinc-400">
                      <span>{item.quantity} {item.unit}</span>
                      <span>×</span>
                      <span>₹{item.unit_price.toLocaleString('en-IN')}</span>
                    </div>
                    {item.notes && (
                      <div className="mt-2 pt-2 border-t border-zinc-700">
                        <p className="text-sm text-zinc-400">{item.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {(estimation.notes || estimation.internal_notes) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
                {estimation.notes && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Client Notes:</h3>
                    <p className="text-zinc-300">{estimation.notes}</p>
                  </div>
                )}
                {estimation.internal_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Internal Notes:</h3>
                    <p className="text-zinc-300">{estimation.internal_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Subtotal:</span>
                  <span className="text-white font-medium">
                    ₹{estimation.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {estimation.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Discount:</span>
                    <span className="text-white font-medium">
                      -₹{estimation.discount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-zinc-700 flex justify-between items-center">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-blue-400 font-bold text-xl">
                    ₹{estimation.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-zinc-400 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Type</span>
                  </div>
                  <p className="text-white font-medium">{getTypeLabel(estimation.estimation_type)}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-zinc-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Validity</span>
                  </div>
                  <p className="text-white font-medium">{estimation.validity_days} days</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-zinc-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Margin</span>
                  </div>
                  <p className="text-white font-medium">{estimation.margin_percent}%</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-zinc-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Created</span>
                  </div>
                  <p className="text-white font-medium">
                    {new Date(estimation.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            {client && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 text-zinc-400 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Name</span>
                    </div>
                    <p className="text-white font-medium">{client.name}</p>
                  </div>
                  {client.email && (
                    <div>
                      <span className="text-sm text-zinc-400">Email</span>
                      <p className="text-white">{client.email}</p>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <span className="text-sm text-zinc-400">Phone</span>
                      <p className="text-white">{client.phone}</p>
                    </div>
                  )}
                  {estimation.projects && (
                    <div>
                      <div className="flex items-center space-x-2 text-zinc-400 mb-1">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">Project</span>
                      </div>
                      <p className="text-white font-medium">{estimation.projects.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Converted Info */}
            {estimation.converted_to_quotation_id && (
              <div className="bg-green-900/20 border border-green-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-green-400 mb-4">Converted</h2>
                <p className="text-zinc-300 mb-4">
                  This estimation has been converted to a quotation.
                </p>
                <Link
                  href={`/admin/quotations/${estimation.converted_to_quotation_id}`}
                  className="flex items-center space-x-2 text-green-400 hover:text-green-300"
                >
                  <span>View Quotation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
