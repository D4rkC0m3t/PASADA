'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quotationId = searchParams.get('quotation_id')
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
  const [quotations, setQuotations] = useState<any[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<string>('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Net 30')

  useEffect(() => {
    fetchQuotations()
    if (quotationId) {
      setSelectedQuotation(quotationId)
    }
    // Set default due date to 30 days from now
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 30)
    setDueDate(defaultDueDate.toISOString().split('T')[0])
  }, [quotationId])

  const fetchQuotations = async () => {
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
          ),
          clients (
            name
          )
        `)
        .in('status', ['approved', 'sent'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedQuotation) {
      alert('Please select a quotation')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/quotations/${selectedQuotation}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_date: invoiceDate,
          due_date: dueDate,
          payment_terms: paymentTerms
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }

      alert(`Invoice ${data.invoice_number} created successfully!`)
      router.push(`/admin/invoices/${data.invoice_id}`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert(error instanceof Error ? error.message : 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const selectedQuotationData = quotations.find(q => q.id === selectedQuotation)

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center space-x-4">
          <Link
            href="/admin/invoices/list"
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Invoice</h1>
            <p className="text-zinc-400">Convert an approved quotation to invoice</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* Select Quotation */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Select Quotation</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Quotation <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedQuotation}
                onChange={(e) => setSelectedQuotation(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
              >
                <option value="">Select a quotation...</option>
                {quotations.map((quotation) => (
                  <option key={quotation.id} value={quotation.id}>
                    {quotation.quotation_number} - {quotation.projects?.clients?.name || quotation.clients?.name} - ₹{quotation.total_with_gst.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
              {quotations.length === 0 && (
                <p className="text-sm text-zinc-500 mt-2">
                  No approved quotations available. <Link href="/admin/quotations" className="text-green-600 hover:text-green-500">Create a quotation first</Link>
                </p>
              )}
            </div>

            {/* Quotation Preview */}
            {selectedQuotationData && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Quotation Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Client:</span>
                    <p className="text-white font-medium">
                      {selectedQuotationData.projects?.clients?.name || selectedQuotationData.clients?.name}
                    </p>
                  </div>
                  {selectedQuotationData.projects && (
                    <div>
                      <span className="text-zinc-500">Project:</span>
                      <p className="text-white font-medium">{selectedQuotationData.projects.name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-500">Subtotal:</span>
                    <p className="text-white font-medium">₹{selectedQuotationData.subtotal.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">GST ({selectedQuotationData.gst_rate}%):</span>
                    <p className="text-white font-medium">₹{selectedQuotationData.gst_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-zinc-700">
                    <span className="text-zinc-500">Total with GST:</span>
                    <p className="text-green-400 font-bold text-lg">₹{selectedQuotationData.total_with_gst.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  min={invoiceDate}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="Net 7">Net 7 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 45">Net 45 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Net 90">Net 90 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-blue-400 font-medium mb-2">What happens next?</h3>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Invoice will be created in "Draft" status</li>
              <li>• All quotation items and GST details will be copied</li>
              <li>• You can review and edit before issuing</li>
              <li>• Generate IRN for e-invoice compliance after review</li>
              <li>• The quotation will be marked as "Converted"</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading || !selectedQuotation}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Invoice</span>
                </>
              )}
            </button>
            <Link
              href="/admin/invoices/list"
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AuthGuard>
  )
}
