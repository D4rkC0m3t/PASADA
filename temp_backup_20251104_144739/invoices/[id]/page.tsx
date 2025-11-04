'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, DollarSign, CheckCircle, AlertCircle, Clock, FileText, QrCode, Plus, Edit } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  payment_terms: string
  subtotal: number
  gst_rate: number
  gst_amount: number
  cgst_amount: number | null
  sgst_amount: number | null
  igst_amount: number | null
  total_with_gst: number
  discount: number
  paid_amount: number
  outstanding_amount: number
  status: string
  e_invoice_status: string
  irn: string | null
  ack_no: string | null
  ack_date: string | null
  qr_code_image: string | null
  invoice_type: string
  buyer_gstin: string | null
  seller_gstin: string
  place_of_supply: string
  notes: string | null
  internal_notes: string | null
  projects?: {
    name: string
    clients: {
      name: string
      email: string
      phone: string
      gstin: string | null
      address: string
      city: string
      state: string
      pincode: string
    }
  } | null
  clients?: {
    name: string
    email: string
    phone: string
    gstin: string | null
    address: string
    city: string
    state: string
    pincode: string
  }
  invoice_items: Array<{
    id: string
    item_number: number
    category: string | null
    description: string
    hsn_sac_code: string
    quantity: number
    unit: string
    unit_price: number
    taxable_value: number
    tax_rate: number
    gst_amount: number
    cgst_amount: number | null
    sgst_amount: number | null
    igst_amount: number | null
    total: number
  }>
  payments: Array<{
    id: string
    payment_date: string
    amount: number
    payment_method: string
    transaction_id: string | null
    reference_number: string | null
    notes: string | null
    status: string
  }>
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

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
      alert('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
      issued: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      partially_paid: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
      fully_paid: 'bg-green-600/10 text-green-600 border-green-600/20',
      overdue: 'bg-red-600/10 text-red-600 border-red-600/20',
      cancelled: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully_paid':
        return <CheckCircle className="w-4 h-4" />
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />
      case 'partially_paid':
        return <DollarSign className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
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

  const client = invoice.projects?.clients || invoice.clients

  if (!client) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Client information not found</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/invoices/list"
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{invoice.invoice_number}</h1>
              <p className="text-zinc-400">Invoice Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
              {getStatusIcon(invoice.status)}
              <span>{invoice.status.replace('_', ' ').charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}</span>
            </span>
            {invoice.status === 'draft' && !invoice.irn && (
              <Link
                href={`/admin/invoices/${params.id}/edit`}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Invoice</span>
              </Link>
            )}
            <button
              onClick={() => window.open(`/api/invoices/${params.id}/pdf`, '_blank')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-900/30"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* E-Invoice Status */}
            {invoice.irn && (
              <div className="bg-green-900/20 border border-green-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-green-400 mb-2">E-Invoice Generated</h2>
                    <p className="text-zinc-300 text-sm">This invoice has a valid IRN from GST portal</p>
                  </div>
                  {invoice.qr_code_image && (
                    <QrCode className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">IRN:</span>
                    <p className="text-white font-mono text-xs break-all">{invoice.irn}</p>
                  </div>
                  {invoice.ack_no && (
                    <div>
                      <span className="text-zinc-400">Ack No:</span>
                      <p className="text-white font-medium">{invoice.ack_no}</p>
                    </div>
                  )}
                  {invoice.ack_date && (
                    <div>
                      <span className="text-zinc-400">Ack Date:</span>
                      <p className="text-white font-medium">
                        {new Date(invoice.ack_date).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
                {invoice.qr_code_image && (
                  <div className="mt-4 pt-4 border-t border-green-800">
                    <img 
                      src={invoice.qr_code_image} 
                      alt="E-Invoice QR Code" 
                      className="w-32 h-32 bg-white p-2 rounded"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Line Items */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Line Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-700">
                    <tr className="text-left text-sm text-zinc-400">
                      <th className="pb-3">#</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">HSN/SAC</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-right">Rate</th>
                      <th className="pb-3 text-right">Taxable</th>
                      <th className="pb-3 text-right">GST</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {invoice.invoice_items.map((item) => (
                      <tr key={item.id} className="text-sm">
                        <td className="py-3 text-zinc-500">{item.item_number}</td>
                        <td className="py-3">
                          <div className="text-white font-medium">{item.description}</div>
                          {item.category && (
                            <div className="text-xs text-zinc-500">{item.category}</div>
                          )}
                        </td>
                        <td className="py-3 text-zinc-300">{item.hsn_sac_code}</td>
                        <td className="py-3 text-right text-zinc-300">{item.quantity} {item.unit}</td>
                        <td className="py-3 text-right text-zinc-300">₹{item.unit_price.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right text-white">₹{item.taxable_value.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right text-yellow-400">
                          {item.tax_rate}%<br/>
                          <span className="text-xs">₹{item.gst_amount.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="py-3 text-right text-white font-medium">₹{item.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Payment History</h2>
                {invoice.outstanding_amount > 0 && (
                  <Link
                    href={`/admin/invoices/${params.id}/payments/new`}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Payment</span>
                  </Link>
                )}
              </div>
              
              {invoice.payments.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No payments recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-white font-medium">₹{payment.amount.toLocaleString('en-IN')}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              payment.status === 'completed' ? 'bg-green-600/20 text-green-400' : 'bg-zinc-600/20 text-zinc-400'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                          <div className="text-sm text-zinc-400">
                            {new Date(payment.payment_date).toLocaleDateString('en-IN')} • {payment.payment_method}
                          </div>
                          {payment.transaction_id && (
                            <div className="text-xs text-zinc-500 mt-1">
                              Txn: {payment.transaction_id}
                            </div>
                          )}
                          {payment.notes && (
                            <div className="text-sm text-zinc-400 mt-2">{payment.notes}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {(invoice.notes || invoice.internal_notes) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
                {invoice.notes && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Client Notes:</h3>
                    <p className="text-zinc-300">{invoice.notes}</p>
                  </div>
                )}
                {invoice.internal_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Internal Notes:</h3>
                    <p className="text-zinc-300">{invoice.internal_notes}</p>
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
                  <span className="text-white font-medium">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {invoice.cgst_amount && invoice.sgst_amount ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">CGST:</span>
                      <span className="text-white">₹{invoice.cgst_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">SGST:</span>
                      <span className="text-white">₹{invoice.sgst_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">IGST:</span>
                    <span className="text-white">₹{invoice.igst_amount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Discount:</span>
                    <span className="text-white font-medium">-₹{invoice.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-zinc-700 flex justify-between items-center">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-green-400 font-bold text-xl">₹{invoice.total_with_gst.toLocaleString('en-IN')}</span>
                </div>
                {invoice.paid_amount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Paid:</span>
                      <span className="text-green-400">-₹{invoice.paid_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-700 flex justify-between items-center">
                      <span className="text-white font-semibold">Outstanding:</span>
                      <span className="text-yellow-400 font-bold text-xl">₹{invoice.outstanding_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-400">Invoice Date:</span>
                  <p className="text-white font-medium">{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Due Date:</span>
                  <p className="text-white font-medium">{new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Payment Terms:</span>
                  <p className="text-white font-medium">{invoice.payment_terms}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Type:</span>
                  <p className="text-white font-medium">{invoice.invoice_type}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Place of Supply:</span>
                  <p className="text-white font-medium">{invoice.place_of_supply}</p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-400">Name:</span>
                  <p className="text-white font-medium">{client.name}</p>
                </div>
                {client.gstin && (
                  <div>
                    <span className="text-zinc-400">GSTIN:</span>
                    <p className="text-white font-mono">{client.gstin}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <span className="text-zinc-400">Email:</span>
                    <p className="text-white">{client.email}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <span className="text-zinc-400">Phone:</span>
                    <p className="text-white">{client.phone}</p>
                  </div>
                )}
                {client.address && (
                  <div>
                    <span className="text-zinc-400">Address:</span>
                    <p className="text-white">
                      {client.address}<br />
                      {client.city}, {client.state} {client.pincode}
                    </p>
                  </div>
                )}
                {invoice.projects && (
                  <div>
                    <span className="text-zinc-400">Project:</span>
                    <p className="text-white font-medium">{invoice.projects.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* E-Invoice Actions */}
            {!invoice.irn && invoice.status !== 'draft' && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-blue-400 mb-4">E-Invoice</h2>
                <p className="text-zinc-300 text-sm mb-4">
                  Generate IRN for GST e-invoice compliance
                </p>
                <Link
                  href={`/admin/invoices/${params.id}/generate-irn`}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate IRN</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
