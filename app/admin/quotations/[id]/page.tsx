'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Check, X, FileText, Calendar, DollarSign, Building, User, Package } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface QuoteItem {
  id: string
  item_number: number
  category: string
  description: string
  specifications: string | null
  quantity: number
  unit: string
  unit_price: number
  tax_percent: number
  total: number
}

interface Quotation {
  id: string
  quotation_number: string
  title: string
  description: string | null
  subtotal: number
  tax_percent: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  status: string
  version: number
  valid_until: string | null
  notes: string | null
  terms_and_conditions: string | null
  payment_terms: string | null
  sent_at: string | null
  created_at: string
  projects: {
    id: string
    name: string
    type: string | null
    site_location: string | null
  }
}

export default function ClientQuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string
  const supabase = createBrowserClient()

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (quotationId) {
      fetchQuotationDetails()
      markAsViewed()
    }
  }, [quotationId])

  const fetchQuotationDetails = async () => {
    setLoading(true)
    try {
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .select(`
          *,
          projects (
            id,
            name,
            type,
            site_location
          )
        `)
        .eq('id', quotationId)
        .single()

      if (quotationError) throw quotationError
      setQuotation(quotationData)

      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quotation_id', quotationId)
        .order('item_number', { ascending: true })

      if (itemsError) throw itemsError
      setQuoteItems(itemsData || [])
    } catch (error) {
      console.error('Error fetching quotation:', error)
      alert('Failed to load quotation details')
    } finally {
      setLoading(false)
    }
  }

  const markAsViewed = async () => {
    try {
      const { data: quotationData } = await supabase
        .from('quotations')
        .select('status, viewed_at')
        .eq('id', quotationId)
        .single()

      if (quotationData && quotationData.status === 'sent' && !quotationData.viewed_at) {
        await supabase
          .from('quotations')
          .update({
            status: 'viewed',
            viewed_at: new Date().toISOString()
          })
          .eq('id', quotationId)
      }
    } catch (error) {
      console.error('Error marking as viewed:', error)
    }
  }

  const handleDownloadPDF = async () => {
    if (!quotation) return
    setDownloading(true)
    try {
      const response = await fetch(`/api/quotations/${quotationId}/pdf`)
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Quotation-${quotation.quotation_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this quotation?')) return

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('quotations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', quotationId)

      if (error) throw error

      alert('Quotation approved successfully! The team will be notified.')
      fetchQuotationDetails()
    } catch (error) {
      console.error('Error approving quotation:', error)
      alert('Failed to approve quotation. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return

    setProcessing(true)
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
      fetchQuotationDetails()
    } catch (error) {
      console.error('Error rejecting quotation:', error)
      alert('Failed to reject quotation. Please try again.')
    } finally {
      setProcessing(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
          <p className="text-zinc-400">Loading quotation...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Quotation Not Found</h2>
          <Link href="/client/quotations" className="text-yellow-600 hover:text-yellow-500">
            Back to Quotations
          </Link>
        </div>
      </div>
    )
  }

  const canApproveReject = quotation.status === 'sent' || quotation.status === 'viewed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/quotations"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotations
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{quotation.title}</h1>
                <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(quotation.status)}`}>
                  {quotation.status.toUpperCase()}
                </span>
              </div>
              <p className="text-zinc-400">
                {quotation.quotation_number} • Version {quotation.version}
              </p>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="glass-button flex items-center space-x-2 px-6 py-3 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Project Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Project Details</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 mb-1">Project Name</div>
              <div className="text-white font-medium">{quotation.projects.name}</div>
            </div>
            {quotation.projects.type && (
              <div>
                <div className="text-zinc-500 mb-1">Type</div>
                <div className="text-white capitalize">{quotation.projects.type.replace('_', ' ')}</div>
              </div>
            )}
            {quotation.valid_until && (
              <div>
                <div className="text-zinc-500 mb-1">Valid Until</div>
                <div className={`font-medium ${new Date(quotation.valid_until) < new Date() ? 'text-red-400' : 'text-white'}`}>
                  {new Date(quotation.valid_until).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {quotation.description && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-zinc-400">{quotation.description}</p>
          </div>
        )}

        {/* Line Items */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-white">Items Included</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Item</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Qty</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Unit Price</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {quoteItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{item.description}</div>
                      {item.specifications && (
                        <div className="text-sm text-zinc-500 mt-1">{item.specifications}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-400">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      ₹{item.unit_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      ₹{item.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-600/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Summary</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>₹{quotation.subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {quotation.discount_amount > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Discount</span>
                <span className="text-green-400">-₹{quotation.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between text-zinc-400">
              <span>Tax ({quotation.tax_percent}%)</span>
              <span>₹{quotation.tax_amount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="h-px bg-zinc-800"></div>
            
            <div className="flex justify-between text-white text-2xl font-bold">
              <span>Total Amount</span>
              <span className="text-yellow-600">₹{quotation.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {(quotation.terms_and_conditions || quotation.payment_terms) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            {quotation.terms_and_conditions && (
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2">Terms & Conditions</h4>
                <p className="text-zinc-400 text-sm whitespace-pre-line">{quotation.terms_and_conditions}</p>
              </div>
            )}
            {quotation.payment_terms && (
              <div>
                <h4 className="text-white font-semibold mb-2">Payment Terms</h4>
                <p className="text-zinc-400 text-sm whitespace-pre-line">{quotation.payment_terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {canApproveReject && (
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              <Check className="w-6 h-6" />
              <span>{processing ? 'Processing...' : 'Approve Quotation'}</span>
            </button>
            
            <button
              onClick={handleReject}
              disabled={processing}
              className="glass-button flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              <X className="w-6 h-6" />
              <span>{processing ? 'Processing...' : 'Reject Quotation'}</span>
            </button>
          </div>
        )}

        {quotation.status === 'approved' && (
          <div className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600/10 text-green-600 rounded-lg border border-green-600/20">
            <Check className="w-6 h-6" />
            <span className="text-lg font-semibold">This quotation has been approved</span>
          </div>
        )}

        {quotation.status === 'rejected' && (
          <div className="flex items-center justify-center space-x-2 px-6 py-4 bg-red-600/10 text-red-600 rounded-lg border border-red-600/20">
            <X className="w-6 h-6" />
            <span className="text-lg font-semibold">This quotation has been rejected</span>
          </div>
        )}
      </div>
    </div>
  )
}
