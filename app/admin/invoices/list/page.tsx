'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, Download, DollarSign, AlertCircle, CheckCircle, Clock, Edit } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  project_id: string | null
  client_id: string
  subtotal: number
  total_with_gst: number
  paid_amount: number
  outstanding_amount: number
  status: 'draft' | 'issued' | 'partially_paid' | 'fully_paid' | 'overdue' | 'cancelled'
  e_invoice_status: 'pending' | 'generated' | 'cancelled' | 'failed'
  irn: string | null
  projects?: {
    name: string
    clients: {
      name: string
    }
  } | null
  clients?: {
    name: string
  }
}

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'issued' | 'partially_paid' | 'fully_paid' | 'overdue'>('all')
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoices')
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
        .order('invoice_date', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const clientName = invoice.projects?.clients?.name || invoice.clients?.name || ''
    const projectName = invoice.projects?.name || ''
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus
    return matchesSearch && matchesFilter
  })

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

  const getEInvoiceStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-zinc-600/10 text-zinc-400',
      generated: 'bg-green-600/10 text-green-600',
      cancelled: 'bg-red-600/10 text-red-400',
      failed: 'bg-orange-600/10 text-orange-400',
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
            <p className="text-zinc-400">Manage GST-compliant invoices with e-invoice support</p>
          </div>
          <Link
            href="/admin/invoices/new"
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/30"
          >
            <Plus className="w-5 h-5" />
            <span>New Invoice</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-green-600 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="fully_paid">Fully Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="text-zinc-400 mt-4">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <DollarSign className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">No invoices found</p>
            <Link
              href="/admin/invoices/new"
              className="inline-flex items-center space-x-2 text-green-600 hover:text-green-500"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first invoice</span>
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Invoice</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-300">Client/Project</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Amount</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-300">Outstanding</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">E-Invoice</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{invoice.invoice_number}</div>
                          <div className="text-sm text-zinc-500">
                            {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {invoice.projects ? (
                          <>
                            <div className="text-white">{invoice.projects.clients.name}</div>
                            <div className="text-zinc-500">{invoice.projects.name}</div>
                          </>
                        ) : (
                          <div className="text-white">{invoice.clients.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-medium">
                        ₹{invoice.total_with_gst.toLocaleString('en-IN')}
                      </div>
                      {invoice.paid_amount > 0 && (
                        <div className="text-xs text-zinc-500">
                          Paid: ₹{invoice.paid_amount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-medium ${invoice.outstanding_amount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        ₹{invoice.outstanding_amount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span>{invoice.status.replace('_', ' ').charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEInvoiceStatusColor(invoice.e_invoice_status)}`}>
                          {invoice.irn ? 'IRN Generated' : invoice.e_invoice_status.charAt(0).toUpperCase() + invoice.e_invoice_status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {invoice.status === 'draft' && !invoice.irn && (
                          <Link
                            href={`/admin/invoices/${invoice.id}/edit`}
                            className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
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

