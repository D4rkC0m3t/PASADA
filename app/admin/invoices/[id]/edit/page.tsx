'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

interface InvoiceItem {
  id?: string
  item_number: number
  category: string
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
}

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Form fields
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [placeOfSupply, setPlaceOfSupply] = useState('')
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [discount, setDiscount] = useState(0)
  const [items, setItems] = useState<InvoiceItem[]>([])

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch invoice')
      
      const data = await response.json()
      
      // Check if invoice can be edited
      if (data.status !== 'draft') {
        setError('Only draft invoices can be edited')
        setLoading(false)
        return
      }
      
      if (data.irn) {
        setError('Invoices with IRN cannot be edited')
        setLoading(false)
        return
      }
      
      setInvoice(data)
      setInvoiceDate(data.invoice_date.split('T')[0])
      setDueDate(data.due_date.split('T')[0])
      setPaymentTerms(data.payment_terms)
      setPlaceOfSupply(data.place_of_supply)
      setNotes(data.notes || '')
      setInternalNotes(data.internal_notes || '')
      setDiscount(data.discount)
      setItems(data.invoice_items)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      setError('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const calculateItemTotals = (item: InvoiceItem) => {
    const taxableValue = item.quantity * item.unit_price
    const gstAmount = (taxableValue * item.tax_rate) / 100
    
    // Determine if CGST/SGST or IGST based on place of supply
    const isIntraState = placeOfSupply === invoice?.place_of_supply
    
    return {
      taxable_value: taxableValue,
      gst_amount: gstAmount,
      cgst_amount: isIntraState ? gstAmount / 2 : null,
      sgst_amount: isIntraState ? gstAmount / 2 : null,
      igst_amount: isIntraState ? null : gstAmount,
      total: taxableValue + gstAmount
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate totals
    const calculated = calculateItemTotals(newItems[index])
    newItems[index] = { ...newItems[index], ...calculated }
    
    setItems(newItems)
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      item_number: items.length + 1,
      category: '',
      description: '',
      hsn_sac_code: '',
      quantity: 1,
      unit: 'nos',
      unit_price: 0,
      taxable_value: 0,
      tax_rate: 18,
      gst_amount: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: null,
      total: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    // Renumber items
    newItems.forEach((item, i) => {
      item.item_number = i + 1
    })
    setItems(newItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.taxable_value, 0)
    const gstAmount = items.reduce((sum, item) => sum + item.gst_amount, 0)
    const cgstAmount = items.reduce((sum, item) => sum + (item.cgst_amount || 0), 0)
    const sgstAmount = items.reduce((sum, item) => sum + (item.sgst_amount || 0), 0)
    const igstAmount = items.reduce((sum, item) => sum + (item.igst_amount || 0), 0)
    
    return {
      subtotal,
      gst_amount: gstAmount,
      cgst_amount: cgstAmount > 0 ? cgstAmount : null,
      sgst_amount: sgstAmount > 0 ? sgstAmount : null,
      igst_amount: igstAmount > 0 ? igstAmount : null,
      total_with_gst: subtotal + gstAmount - discount
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      // Validation
      if (!invoiceDate || !dueDate || !paymentTerms) {
        throw new Error('Please fill in all required fields')
      }

      if (items.length === 0) {
        throw new Error('Please add at least one item')
      }

      const totals = calculateTotals()

      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_date: invoiceDate,
          due_date: dueDate,
          payment_terms: paymentTerms,
          place_of_supply: placeOfSupply,
          notes,
          internal_notes: internalNotes,
          discount,
          items,
          ...totals
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update invoice')
      }

      alert('Invoice updated successfully!')
      router.push(`/admin/invoices/${params.id}`)
    } catch (error) {
      console.error('Error updating invoice:', error)
      setError(error instanceof Error ? error.message : 'Failed to update invoice')
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

  if (error && !invoice) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Cannot Edit Invoice</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Link
              href={`/admin/invoices/${params.id}`}
              className="inline-flex items-center space-x-2 text-green-600 hover:text-green-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invoice</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const totals = calculateTotals()
  const client = invoice?.projects?.clients || invoice?.clients

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/admin/invoices/${params.id}`}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Edit Invoice</h1>
              <p className="text-zinc-400">{invoice?.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Payment Terms *
                  </label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g., Net 30"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Place of Supply *
                  </label>
                  <input
                    type="text"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    placeholder="e.g., Maharashtra"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Line Items</h2>
                <button
                  onClick={addItem}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-zinc-400">Item #{item.item_number}</span>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-zinc-400 mb-1">Description *</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Category</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">HSN/SAC Code *</label>
                        <input
                          type="text"
                          value={item.hsn_sac_code}
                          onChange={(e) => updateItem(index, 'hsn_sac_code', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Quantity *</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Unit *</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Unit Price *</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">GST Rate (%) *</label>
                        <select
                          value={item.tax_rate}
                          onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-700 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-zinc-400">Taxable:</span>
                        <p className="text-white font-medium">₹{item.taxable_value.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400">GST:</span>
                        <p className="text-yellow-400 font-medium">₹{item.gst_amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400">Total:</span>
                        <p className="text-green-400 font-bold">₹{item.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 text-zinc-500">
                    No items added yet. Click "Add Item" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Client Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Notes visible to client..."
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes (not visible to client)..."
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Subtotal:</span>
                  <span className="text-white font-medium">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {totals.cgst_amount && totals.sgst_amount ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">CGST:</span>
                      <span className="text-white">₹{totals.cgst_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">SGST:</span>
                      <span className="text-white">₹{totals.sgst_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">IGST:</span>
                    <span className="text-white">₹{totals.igst_amount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Discount:</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div className="pt-3 border-t border-zinc-700 flex justify-between items-center">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-green-400 font-bold text-xl">₹{totals.total_with_gst.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Client Info */}
            {client && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Client</h2>
                <div className="space-y-2 text-sm">
                  <p className="text-white font-medium">{client.name}</p>
                  {client.gstin && (
                    <p className="text-zinc-400">GSTIN: {client.gstin}</p>
                  )}
                  {client.email && (
                    <p className="text-zinc-400">{client.email}</p>
                  )}
                  {client.phone && (
                    <p className="text-zinc-400">{client.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
