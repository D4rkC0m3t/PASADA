'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, DollarSign } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

export default function NewPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'bank_transfer',
    transaction_id: '',
    reference_number: '',
    bank_name: '',
    cheque_number: '',
    upi_id: '',
    notes: ''
  })

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
      
      // Set default amount to outstanding amount
      setFormData(prev => ({
        ...prev,
        amount: data.outstanding_amount.toString()
      }))
    } catch (error) {
      console.error('Error fetching invoice:', error)
      alert('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (amount > invoice.outstanding_amount) {
      alert(`Payment amount cannot exceed outstanding amount of ₹${invoice.outstanding_amount.toLocaleString('en-IN')}`)
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/invoices/${params.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record payment')
      }

      alert('Payment recorded successfully!')
      router.push(`/admin/invoices/${params.id}`)
    } catch (error) {
      console.error('Error recording payment:', error)
      alert(error instanceof Error ? error.message : 'Failed to record payment')
    } finally {
      setSaving(false)
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
          </div>
        </div>
      </AuthGuard>
    )
  }

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
            <h1 className="text-3xl font-bold text-white mb-2">Record Payment</h1>
            <p className="text-zinc-400">{invoice.invoice_number}</p>
          </div>
        </div>

        <div className="max-w-2xl">
          {/* Invoice Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Invoice Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-zinc-400">Total Amount:</span>
                <p className="text-white font-bold text-lg">₹{invoice.total_with_gst.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-sm text-zinc-400">Paid Amount:</span>
                <p className="text-green-400 font-bold text-lg">₹{invoice.paid_amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="col-span-2 pt-4 border-t border-zinc-700">
                <span className="text-sm text-zinc-400">Outstanding Amount:</span>
                <p className="text-yellow-400 font-bold text-2xl">₹{invoice.outstanding_amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Payment Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="0.01"
                      max={invoice.outstanding_amount}
                      className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Conditional fields based on payment method */}
              {formData.payment_method === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                      placeholder="e.g., TXN123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                      placeholder="e.g., HDFC Bank"
                    />
                  </div>
                </>
              )}

              {formData.payment_method === 'cheque' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      value={formData.cheque_number}
                      onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                      placeholder="e.g., 123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                      placeholder="e.g., HDFC Bank"
                    />
                  </div>
                </>
              )}

              {formData.payment_method === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    UPI ID / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                    placeholder="e.g., user@paytm or UPI123456789"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
                  placeholder="Internal reference number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors resize-none"
                  placeholder="Additional notes about this payment..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-zinc-700">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Record Payment</span>
                  </>
                )}
              </button>
              <Link
                href={`/admin/invoices/${params.id}`}
                className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
