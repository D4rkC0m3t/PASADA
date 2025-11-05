'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Download, Check, X, FileText } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ClientLayout } from '@/components/ClientLayout'

interface Quotation {
  id: string
  quotation_number: string
  title: string
  total_amount: number
  tax_percent: number
  discount_amount: number
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'revised' | 'expired'
  version: number
  valid_until: string | null
  sent_at: string | null
  created_at: string
  projects: {
    id: string
    name: string
    type: string | null
  }
}

export default function ClientQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'approved' | 'rejected'>('all')
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchClientQuotations()
  }, [])

  const fetchClientQuotations = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user logged in')
        return
      }

      // Get client by email
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .single()

      if (clientError) {
        console.error('Client not found:', clientError)
        setQuotations([])
        return
      }

      // Fetch quotations through projects
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          projects!inner (
            id,
            name,
            type,
            client_id
          )
        `)
        .eq('projects.client_id', clientData.id)
        .in('status', ['sent', 'viewed', 'approved', 'rejected', 'revised'])
        .order('created_at', { ascending: false })

      if (quotationsError) throw quotationsError

      setQuotations(quotationsData || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (quotationId: string, quotationNumber: string) => {
    setDownloadingId(quotationId)
    try {
      const response = await fetch(`/api/quotations/${quotationId}/pdf`)
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Quotation-${quotationNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleApproveQuotation = async (quotationId: string) => {
    if (!confirm('Are you sure you want to approve this quotation?')) return

    setProcessingId(quotationId)
    try {
      const { error } = await supabase
        .from('quotations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', quotationId)

      if (error) throw error

      alert('Quotation approved successfully!')
      fetchClientQuotations()
    } catch (error) {
      console.error('Error approving quotation:', error)
      alert('Failed to approve quotation. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectQuotation = async (quotationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled

    setProcessingId(quotationId)
    try {
      const { error } = await supabase
        .from('quotations')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          notes: reason || 'Rejected by client'
        })
        .eq('id', quotationId)

      if (error) throw error

      alert('Quotation rejected. The team will be notified.')
      fetchClientQuotations()
    } catch (error) {
      console.error('Error rejecting quotation:', error)
      alert('Failed to reject quotation. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      viewed: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      approved: 'bg-green-600/10 text-green-600 border-green-600/20',
      rejected: 'bg-red-600/10 text-red-600 border-red-600/20',
      revised: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    }
    return colors[status] || colors.sent
  }

  const filteredQuotations = quotations.filter(q => 
    filterStatus === 'all' || q.status === filterStatus
  )

  return (
    <ClientLayout 
      title="My Quotations" 
      subtitle="Review and approve project quotations"
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

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="glass-input px-4 py-3 focus:border-blue-500"
          >
            <option value="all">All Quotations</option>
            <option value="sent">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Quotations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
            <p className="text-zinc-400">Loading quotations...</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="text-center py-12 glassmorphic-card">
            <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Quotations</h3>
            <p className="text-zinc-400 mb-6">
              {filterStatus === 'all' 
                ? "You don't have any quotations yet." 
                : `No ${filterStatus} quotations found.`}
            </p>
            <Link
              href="/client/projects"
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
            >
              <span>View Projects</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuotations.map((quotation) => (
              <div key={quotation.id} className="glassmorphic-card p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{quotation.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs border ${getStatusColor(quotation.status)}`}>
                        {quotation.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400 space-y-1">
                      <div>Quotation #{quotation.quotation_number} • Version {quotation.version}</div>
                      <div>Project: {quotation.projects.name}</div>
                      {quotation.valid_until && (
                        <div className={`${new Date(quotation.valid_until) < new Date() ? 'text-red-400' : 'text-zinc-400'}`}>
                          Valid until: {new Date(quotation.valid_until).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-blue-400">
                      ₹{quotation.total_amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-zinc-500">Total Amount</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 glass-divider">
                  <Link
                    href={`/client/quotations/${quotation.id}`}
                    className="glass-button flex items-center space-x-2 px-4 py-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                  
                  <button
                    onClick={() => handleDownloadPDF(quotation.id, quotation.quotation_number)}
                    disabled={downloadingId === quotation.id}
                    className="glass-button flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingId === quotation.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>

                  {quotation.status === 'sent' || quotation.status === 'viewed' ? (
                    <>
                      <button
                        onClick={() => handleApproveQuotation(quotation.id)}
                        disabled={processingId === quotation.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleRejectQuotation(quotation.id)}
                        disabled={processingId === quotation.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : quotation.status === 'approved' ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-600/10 text-green-600 rounded-lg border border-green-600/20">
                      <Check className="w-4 h-4" />
                      <span>Approved</span>
                    </div>
                  ) : quotation.status === 'rejected' ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-red-600/10 text-red-600 rounded-lg border border-red-600/20">
                      <X className="w-4 h-4" />
                      <span>Rejected</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && quotations.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-white">{quotations.length}</div>
              <div className="text-sm text-blue-300">Total Quotations</div>
            </div>
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-blue-400">
                {quotations.filter(q => q.status === 'sent' || q.status === 'viewed').length}
              </div>
              <div className="text-sm text-blue-300">Pending Review</div>
            </div>
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-green-400">
                {quotations.filter(q => q.status === 'approved').length}
              </div>
              <div className="text-sm text-blue-300">Approved</div>
            </div>
            <div className="glass-card p-4 hover:shadow-lg transition-all">
              <div className="text-2xl font-bold text-blue-400">
                ₹{quotations
                  .filter(q => q.status === 'approved')
                  .reduce((sum, q) => sum + q.total_amount, 0)
                  .toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-blue-300">Approved Value</div>
            </div>
          </div>
        )}
    </ClientLayout>
  )
}

