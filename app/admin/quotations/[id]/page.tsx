'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Download, Send, Trash2, FileText, Calendar, DollarSign, Building, User, Phone, Mail, Package } from 'lucide-react'
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
  discount_percent: number
  subtotal: number
  discount_amount: number
  tax_amount: number
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
  discount_percent: number
  discount_amount: number
  total_amount: number
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'revised' | 'expired'
  version: number
  valid_until: string | null
  notes: string | null
  terms_and_conditions: string | null
  payment_terms: string | null
  pdf_url: string | null
  sent_at: string | null
  viewed_at: string | null
  approved_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
  projects: {
    id: string
    name: string
    type: string | null
    site_location: string | null
    clients: {
      id: string
      name: string
      contact_name: string
      email: string | null
      phone: string | null
      address: string | null
      city: string | null
    }
  }
}

export default function QuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string
  const supabase = createBrowserClient()

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  useEffect(() => {
    if (quotationId) {
      fetchQuotationDetails()
    }
  }, [quotationId])

  const fetchQuotationDetails = async () => {
    setLoading(true)
    try {
      // Fetch quotation with project and client details
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .select(`
          *,
          projects (
            id,
            name,
            type,
            site_location,
            clients (
              id,
              name,
              contact_name,
              email,
              phone,
              address,
              city
            )
          )
        `)
        .eq('id', quotationId)
        .single()

      if (quotationError) throw quotationError
      setQuotation(quotationData)

      // Fetch quote items
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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
      sent: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      viewed: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      approved: 'bg-green-600/10 text-green-600 border-green-600/20',
      rejected: 'bg-red-600/10 text-red-600 border-red-600/20',
      revised: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
      expired: 'bg-gray-600/10 text-gray-600 border-gray-600/20',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const handleDownloadPDF = async () => {
    if (!quotation) return
    setDownloadingPDF(true)
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
      setDownloadingPDF(false)
    }
  }

  const handleSendEmail = async () => {
    if (!quotation) return
    setSendingEmail(true)
    try {
      const response = await fetch(`/api/quotations/${quotationId}/send`, {
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
      
      // Refresh to show updated status
      fetchQuotationDetails()
    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDelete = async () => {
    if (!quotation) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', quotationId)

      if (error) throw error

      alert('Quotation deleted successfully')
      router.push('/admin/quotations')
    } catch (error) {
      console.error('Error deleting quotation:', error)
      alert('Failed to delete quotation')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
          <p className="text-zinc-400">Loading quotation...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Quotation Not Found</h2>
          <p className="text-zinc-400 mb-6">The quotation you're looking for doesn't exist.</p>
          <Link
            href="/admin/quotations"
            className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quotations</span>
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
          href="/admin/quotations"
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
              {quotation.quotation_number} • Version {quotation.version} • Created {new Date(quotation.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/quotations/${quotationId}/edit`}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingPDF ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              disabled={sendingEmail}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send Email</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Client Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Client Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-zinc-500 mb-1">Company Name</div>
              <div className="text-white font-medium">{quotation.projects.clients.name}</div>
            </div>
            <div>
              <div className="text-zinc-500 mb-1">Contact Person</div>
              <div className="text-white">{quotation.projects.clients.contact_name}</div>
            </div>
            {quotation.projects.clients.email && (
              <div className="flex items-center space-x-2 text-zinc-400">
                <Mail className="w-4 h-4" />
                <span>{quotation.projects.clients.email}</span>
              </div>
            )}
            {quotation.projects.clients.phone && (
              <div className="flex items-center space-x-2 text-zinc-400">
                <Phone className="w-4 h-4" />
                <span>{quotation.projects.clients.phone}</span>
              </div>
            )}
            {quotation.projects.clients.address && (
              <div>
                <div className="text-zinc-500 mb-1">Address</div>
                <div className="text-zinc-400">
                  {quotation.projects.clients.address}
                  {quotation.projects.clients.city && `, ${quotation.projects.clients.city}`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Project Details</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-zinc-500 mb-1">Project Name</div>
              <div className="text-white font-medium">{quotation.projects.name}</div>
            </div>
            {quotation.projects.type && (
              <div>
                <div className="text-zinc-500 mb-1">Type</div>
                <div className="text-zinc-400 capitalize">{quotation.projects.type.replace('_', ' ')}</div>
              </div>
            )}
            {quotation.projects.site_location && (
              <div>
                <div className="text-zinc-500 mb-1">Location</div>
                <div className="text-zinc-400">{quotation.projects.site_location}</div>
              </div>
            )}
            <div>
              <Link
                href={`/admin/projects/${quotation.projects.id}`}
                className="text-yellow-600 hover:text-yellow-500 transition-colors"
              >
                View Project Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-600/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Quotation Info</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-zinc-500 mb-1">Quotation Number</div>
              <div className="text-white font-mono">{quotation.quotation_number}</div>
            </div>
            <div>
              <div className="text-zinc-500 mb-1">Version</div>
              <div className="text-zinc-400">Version {quotation.version}</div>
            </div>
            {quotation.valid_until && (
              <div>
                <div className="text-zinc-500 mb-1">Valid Until</div>
                <div className="text-zinc-400">{new Date(quotation.valid_until).toLocaleDateString()}</div>
              </div>
            )}
            {quotation.sent_at && (
              <div>
                <div className="text-zinc-500 mb-1">Sent At</div>
                <div className="text-zinc-400">{new Date(quotation.sent_at).toLocaleString()}</div>
              </div>
            )}
            {quotation.approved_at && (
              <div>
                <div className="text-zinc-500 mb-1">Approved At</div>
                <div className="text-green-400">{new Date(quotation.approved_at).toLocaleString()}</div>
              </div>
            )}
          </div>
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
            <h3 className="text-lg font-semibold text-white">Line Items</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">#</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Description</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Qty</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Unit Price</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Tax %</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {quoteItems.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-400">{item.item_number}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-600/10 text-blue-400 rounded text-xs">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">{item.description}</div>
                    {item.specifications && (
                      <div className="text-sm text-zinc-500 mt-1">{item.specifications}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-400">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4 text-right text-white">
                    ₹{item.unit_price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-400">
                    {item.tax_percent}%
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

      {/* Totals */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* Notes and Terms */}
          {(quotation.notes || quotation.terms_and_conditions || quotation.payment_terms) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              {quotation.notes && (
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2">Notes</h4>
                  <p className="text-zinc-400 text-sm">{quotation.notes}</p>
                </div>
              )}
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
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
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
                <span>Discount ({quotation.discount_percent}%)</span>
                <span className="text-red-400">-₹{quotation.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between text-zinc-400">
              <span>Tax ({quotation.tax_percent}%)</span>
              <span>₹{quotation.tax_amount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="h-px bg-zinc-800"></div>
            
            <div className="flex justify-between text-white text-xl font-bold">
              <span>Total</span>
              <span className="text-yellow-600">₹{quotation.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Send Quotation via Email</h3>
            
            <div className="mb-6">
              <p className="text-zinc-400 mb-4">
                Are you sure you want to send this quotation via email?
              </p>
              
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">To:</span>
                  <span className="text-white font-medium">
                    {quotation.projects.clients.email || 'No email available'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Amount:</span>
                  <span className="text-white font-medium">
                    ₹{quotation.total_amount.toLocaleString('en-IN')}
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
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sendingEmail ? (
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Delete Quotation</h3>
            
            <div className="mb-6">
              <p className="text-zinc-400 mb-4">
                Are you sure you want to delete this quotation? This action cannot be undone.
              </p>
              
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">
                  <strong>Warning:</strong> All line items and associated data will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
