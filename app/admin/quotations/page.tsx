'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, FileText, Download, Send } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Quotation {
  id: string
  title: string
  quotation_number: string
  project_id: string
  total_amount: number
  tax_percent: number | null
  discount: number | null
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  version: number
  valid_until: string | null
  created_at: string
  projects: {
    name: string
    clients: {
      name: string
    }
  }
}

import AuthGuard from '@/components/AuthGuard'


export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'>('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          projects (
            name,
            clients (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.projects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.projects?.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || quotation.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
      sent: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      approved: 'bg-green-600/10 text-green-600 border-green-600/20',
      rejected: 'bg-red-600/10 text-red-600 border-red-600/20',
      expired: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getTotalWithTax = (quotation: Quotation) => {
    const subtotal = quotation.total_amount
    const discount = quotation.discount || 0
    const afterDiscount = subtotal - discount
    const tax = (quotation.tax_percent || 0) / 100 * afterDiscount
    return afterDiscount + tax
  }

  const handleDownloadPDF = async (quotationId: string, quotationNumber: string, gstVersion: boolean = false) => {
    setDownloadingId(quotationId)
    try {
      const endpoint = gstVersion ? `/api/quotations/${quotationId}/pdf-gst` : `/api/quotations/${quotationId}/pdf`
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const prefix = gstVersion ? 'GST-Quotation' : 'Quotation'
      link.download = `${prefix}-${quotationNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert(`Failed to download PDF: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSendEmail = async (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setShowSendModal(true)
  }

  const confirmSendEmail = async () => {
    if (!selectedQuotation) return

    setSendingId(selectedQuotation.id)
    try {
      const response = await fetch(`/api/quotations/${selectedQuotation.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      alert(`Quotation sent successfully to ${result.sentTo}!`)
      setShowSendModal(false)
      setSelectedQuotation(null)
      
      // Refresh quotations to show updated status
      fetchQuotations()
    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSendingId(null)
    }
  }

  return (
    <AuthGuard requiredRole="admin">
    <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Quotations</h1>
            <p className="text-zinc-400">Manage project quotations and proposals</p>
          </div>
          <Link
            href="/admin/quotations/new"
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Quotation</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search quotations..."
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Quotations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            <p className="text-zinc-400 mt-4">Loading quotations...</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">No quotations found</p>
            <Link
              href="/admin/quotations/new"
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first quotation</span>
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Quotation</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Project</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Amount</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-600/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{quotation.title}</div>
                          <div className="text-sm text-zinc-500">v{quotation.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{quotation.projects?.clients?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-400">{quotation.projects?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-white">
                        ₹{getTotalWithTax(quotation).toLocaleString('en-IN')}
                      </div>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/quotations/${quotation.id}`}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(quotation.id, quotation.quotation_number)}
                          disabled={downloadingId === quotation.id}
                          className="p-2 text-zinc-400 hover:text-green-600 hover:bg-green-600/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download PDF"
                        >
                          {downloadingId === quotation.id ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSendEmail(quotation)}
                          disabled={sendingId === quotation.id}
                          className="p-2 text-zinc-400 hover:text-yellow-600 hover:bg-yellow-600/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send Email"
                        >
                          {sendingId === quotation.id ? (
                            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {!loading && filteredQuotations.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{filteredQuotations.length}</div>
              <div className="text-sm text-zinc-400">Total Quotations</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {filteredQuotations.filter(q => q.status === 'sent').length}
              </div>
              <div className="text-sm text-zinc-400">Sent</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredQuotations.filter(q => q.status === 'approved').length}
              </div>
              <div className="text-sm text-zinc-400">Approved</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                ₹{filteredQuotations
                  .filter(q => q.status === 'approved')
                  .reduce((sum, q) => sum + getTotalWithTax(q), 0)
                  .toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-zinc-400">Approved Value</div>
            </div>
          </div>
        )}

        {/* Send Email Confirmation Modal */}
        {showSendModal && selectedQuotation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">Send Quotation via Email</h3>
              
              <div className="mb-6">
                <p className="text-zinc-400 mb-4">
                  Are you sure you want to send this quotation via email?
                </p>
                
                <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Quotation:</span>
                    <span className="text-white font-medium">{selectedQuotation.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Client:</span>
                    <span className="text-white font-medium">
                      {selectedQuotation.projects?.clients?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Amount:</span>
                    <span className="text-white font-medium">
                      ₹{getTotalWithTax(selectedQuotation).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    The quotation PDF will be attached and sent to the client's email address.
                    The status will be updated to "Sent".
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSendModal(false)
                    setSelectedQuotation(null)
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
                  disabled={sendingId === selectedQuotation.id}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendEmail}
                  disabled={sendingId === selectedQuotation.id}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sendingId === selectedQuotation.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
    </AuthGuard>
  )
}
