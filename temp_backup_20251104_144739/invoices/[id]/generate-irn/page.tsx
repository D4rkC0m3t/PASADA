'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

export default function GenerateIRNPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [irnData, setIrnData] = useState<any>(null)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch invoice')
      
      const data = await response.json()
      setInvoice(data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      setError('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateIRN = async () => {
    try {
      setGenerating(true)
      setError('')

      const response = await fetch(`/api/invoices/${params.id}/generate-irn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate IRN')
      }

      setSuccess(true)
      setIrnData(data)
      
      // Refresh invoice data
      await fetchInvoice()
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/admin/invoices/${params.id}`)
      }, 3000)
    } catch (error) {
      console.error('Error generating IRN:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate IRN')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="text-zinc-400 mt-4">Loading invoice...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!invoice) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Invoice not found</p>
            <Link
              href="/admin/invoices/list"
              className="inline-flex items-center space-x-2 mt-4 text-green-600 hover:text-green-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invoices</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Check if IRN already generated
  if (invoice.irn) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="mb-8 flex items-center space-x-4">
            <Link
              href={`/admin/invoices/${params.id}`}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">E-Invoice IRN</h1>
              <p className="text-zinc-400">{invoice.invoice_number}</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="bg-green-900/20 border border-green-800 rounded-xl p-6">
              <div className="flex items-start space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-green-400 mb-2">IRN Already Generated</h2>
                  <p className="text-zinc-300">This invoice already has a valid IRN from the GST portal.</p>
                </div>
              </div>
              
              <div className="bg-zinc-900 rounded-lg p-4 mt-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-zinc-400">IRN:</span>
                    <p className="text-white font-mono text-xs break-all mt-1">{invoice.irn}</p>
                  </div>
                  {invoice.ack_no && (
                    <div>
                      <span className="text-zinc-400">Acknowledgement No:</span>
                      <p className="text-white font-medium mt-1">{invoice.ack_no}</p>
                    </div>
                  )}
                  {invoice.ack_date && (
                    <div>
                      <span className="text-zinc-400">Acknowledgement Date:</span>
                      <p className="text-white font-medium mt-1">
                        {new Date(invoice.ack_date).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Link
                href={`/admin/invoices/${params.id}`}
                className="inline-flex items-center space-x-2 mt-6 text-green-400 hover:text-green-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Check if invoice can generate IRN
  const canGenerateIRN = invoice.status !== 'draft' && 
                         invoice.status !== 'cancelled' && 
                         invoice.invoice_type === 'B2B' && 
                         invoice.buyer_gstin

  const client = invoice.projects?.clients || invoice.clients

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center space-x-4">
          <Link
            href={`/admin/invoices/${params.id}`}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Generate E-Invoice IRN</h1>
            <p className="text-zinc-400">{invoice.invoice_number}</p>
          </div>
        </div>

        <div className="max-w-2xl">
          {/* Success Message */}
          {success && irnData && (
            <div className="mb-6 bg-green-900/20 border border-green-800 rounded-xl p-6">
              <div className="flex items-start space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-green-400 mb-2">IRN Generated Successfully!</h2>
                  <p className="text-zinc-300">Your invoice now has a valid IRN from the GST portal.</p>
                </div>
              </div>
              
              <div className="bg-zinc-900 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-zinc-400">IRN:</span>
                    <p className="text-white font-mono text-xs break-all mt-1">{irnData.irn}</p>
                  </div>
                  {irnData.ack_no && (
                    <div>
                      <span className="text-zinc-400">Acknowledgement No:</span>
                      <p className="text-white font-medium mt-1">{irnData.ack_no}</p>
                    </div>
                  )}
                  {irnData.ack_date && (
                    <div>
                      <span className="text-zinc-400">Acknowledgement Date:</span>
                      <p className="text-white font-medium mt-1">
                        {new Date(irnData.ack_date).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-zinc-400 text-sm mt-4">Redirecting to invoice details...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Error Generating IRN</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {!canGenerateIRN && (
            <div className="mb-6 bg-orange-900/20 border border-orange-800 rounded-xl p-4">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-medium">Cannot Generate IRN</p>
                  <p className="text-orange-300 text-sm mt-1">This invoice does not meet the requirements for IRN generation:</p>
                </div>
              </div>
              <ul className="text-orange-300 text-sm space-y-1 ml-8">
                {invoice.status === 'draft' && (
                  <li>• Invoice is in draft status. Issue the invoice first.</li>
                )}
                {invoice.status === 'cancelled' && (
                  <li>• Invoice is cancelled.</li>
                )}
                {invoice.invoice_type !== 'B2B' && (
                  <li>• IRN can only be generated for B2B invoices.</li>
                )}
                {!invoice.buyer_gstin && (
                  <li>• Client must have a valid GSTIN.</li>
                )}
              </ul>
            </div>
          )}

          {/* Invoice Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Invoice Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-400">Invoice Number:</span>
                <p className="text-white font-medium">{invoice.invoice_number}</p>
              </div>
              <div>
                <span className="text-zinc-400">Invoice Date:</span>
                <p className="text-white font-medium">
                  {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-zinc-400">Client:</span>
                <p className="text-white font-medium">{client.name}</p>
              </div>
              <div>
                <span className="text-zinc-400">Client GSTIN:</span>
                <p className="text-white font-mono text-xs">{invoice.buyer_gstin || 'N/A'}</p>
              </div>
              <div>
                <span className="text-zinc-400">Invoice Type:</span>
                <p className="text-white font-medium">{invoice.invoice_type}</p>
              </div>
              <div>
                <span className="text-zinc-400">Total Amount:</span>
                <p className="text-white font-bold">₹{invoice.total_with_gst.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-6">
            <h3 className="text-blue-400 font-medium mb-2">What is IRN?</h3>
            <p className="text-blue-300 text-sm mb-3">
              Invoice Reference Number (IRN) is a unique number generated by the GST portal for e-invoices. 
              It is mandatory for B2B transactions and ensures invoice authenticity.
            </p>
            <h3 className="text-blue-400 font-medium mb-2">Important Notes:</h3>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• IRN can only be generated once per invoice</li>
              <li>• IRN can be cancelled within 24 hours of generation</li>
              <li>• Both seller and buyer GSTIN must be valid</li>
              <li>• Invoice must be issued (not draft) before generating IRN</li>
              <li>• QR code will be generated automatically with IRN</li>
            </ul>
          </div>

          {/* Action Button */}
          {canGenerateIRN && !success && (
            <button
              onClick={handleGenerateIRN}
              disabled={generating}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating IRN...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Generate IRN from GST Portal</span>
                </>
              )}
            </button>
          )}

          {!canGenerateIRN && (
            <Link
              href={`/admin/invoices/${params.id}`}
              className="block w-full text-center px-6 py-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Back to Invoice
            </Link>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
