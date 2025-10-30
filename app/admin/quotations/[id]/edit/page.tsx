'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Search, X, FileText, Building, Calendar, DollarSign } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface LineItem {
  id: string
  material_id: string | null
  material_name: string
  description: string
  category: string
  quantity: number
  unit: string
  unit_price: number
  tax_percent: number
  total: number
}

interface Project {
  id: string
  name: string
  clients: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
}

interface Material {
  id: string
  name: string
  category: string | null
  unit: string | null
  unit_price: number | null
}

export default function EditQuotationPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)
  const [materialSearch, setMaterialSearch] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    tax_percent: '18',
    discount: '0',
    valid_until: '',
    notes: '',
    terms_and_conditions: '',
    payment_terms: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])

  useEffect(() => {
    fetchProjects()
    fetchMaterials()
    if (quotationId) {
      fetchQuotationData()
    }
  }, [quotationId])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          clients (
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, category, unit, unit_price')
        .order('name')

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
    }
  }

  const fetchQuotationData = async () => {
    setLoading(true)
    try {
      // Fetch quotation
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotationId)
        .single()

      if (quotationError) throw quotationError

      // Set form data
      setFormData({
        title: quotationData.title || '',
        project_id: quotationData.project_id || '',
        tax_percent: quotationData.tax_percent?.toString() || '18',
        discount: quotationData.discount_amount?.toString() || '0',
        valid_until: quotationData.valid_until || '',
        notes: quotationData.notes || '',
        terms_and_conditions: quotationData.terms_and_conditions || '',
        payment_terms: quotationData.payment_terms || ''
      })

      // Fetch quote items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quotation_id', quotationId)
        .order('item_number', { ascending: true })

      if (itemsError) throw itemsError

      // Convert to line items format
      const convertedItems: LineItem[] = (itemsData || []).map((item) => ({
        id: item.id,
        material_id: null, // We don't track material_id in quote_items
        material_name: item.description?.split(' - ')[0] || '',
        description: item.description?.split(' - ').slice(1).join(' - ') || '',
        category: item.category || 'Labor',
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        tax_percent: item.tax_percent,
        total: item.total
      }))

      setLineItems(convertedItems)
    } catch (error) {
      console.error('Error fetching quotation:', error)
      alert('Failed to load quotation data')
    } finally {
      setLoading(false)
    }
  }

  const addLineItem = (material?: Material) => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(7),
      material_id: material?.id || null,
      material_name: material?.name || '',
      description: '',
      category: material?.category || 'Labor',
      quantity: 1,
      unit: material?.unit || 'piece',
      unit_price: material?.unit_price || 0,
      tax_percent: parseFloat(formData.tax_percent) || 0,
      total: material?.unit_price || 0
    }
    setLineItems([...lineItems, newItem])
    setShowMaterialSelector(false)
    setMaterialSearch('')
  }

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // Recalculate total
        updated.total = updated.quantity * updated.unit_price
        return updated
      }
      return item
    }))
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discount = parseFloat(formData.discount) || 0
    const afterDiscount = subtotal - discount
    return (parseFloat(formData.tax_percent) / 100) * afterDiscount
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = parseFloat(formData.discount) || 0
    const tax = calculateTax()
    return subtotal - discount + tax
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.project_id || lineItems.length === 0) {
      alert('Please fill in all required fields and add at least one line item')
      return
    }

    try {
      setSaving(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Calculate totals
      const subtotal = calculateSubtotal()
      const discount = parseFloat(formData.discount) || 0
      const taxPercent = parseFloat(formData.tax_percent)
      const taxAmount = calculateTax()
      const total = calculateTotal()

      // Update quotation
      const { error: quotationError } = await supabase
        .from('quotations')
        .update({
          title: formData.title,
          project_id: formData.project_id,
          subtotal: subtotal,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          discount_percent: discount > 0 ? (discount / subtotal * 100) : 0,
          discount_amount: discount,
          total_amount: total,
          valid_until: formData.valid_until || null,
          notes: formData.notes || null,
          terms_and_conditions: formData.terms_and_conditions || null,
          payment_terms: formData.payment_terms || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quotationId)

      if (quotationError) throw quotationError

      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quotation_id', quotationId)

      if (deleteError) throw deleteError

      // Create new line items
      const itemsToInsert = lineItems.map((item, index) => ({
        quotation_id: quotationId,
        item_number: index + 1,
        category: item.category,
        description: item.material_name + (item.description ? ' - ' + item.description : ''),
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        tax_percent: item.tax_percent,
        discount_percent: 0
      }))

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      alert('Quotation updated successfully!')
      router.push(`/admin/quotations/${quotationId}`)
    } catch (error) {
      console.error('Error updating quotation:', error)
      alert('Failed to update quotation. Please try again.')
    } finally {
      setSaving(false)
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

  const selectedProject = projects.find(p => p.id === formData.project_id)

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
    m.category?.toLowerCase().includes(materialSearch.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/quotations/${quotationId}`}
            className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotation
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Edit Quotation</h1>
          <p className="text-zinc-400">Update quotation details and line items</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project & Basic Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-yellow-600" />
              Project & Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Select Project *</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  required
                >
                  <option value="">Choose a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.clients.name}
                    </option>
                  ))}
                </select>
                {selectedProject && (
                  <div className="mt-2 p-3 bg-zinc-800 rounded text-sm text-zinc-400">
                    Client: {selectedProject.clients.name} | 
                    Email: {selectedProject.clients.email || 'N/A'} | 
                    Phone: {selectedProject.clients.phone || 'N/A'}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Quotation Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600"
                  placeholder="Modern Kitchen Renovation Quote"
                  required
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-yellow-600" />
                Line Items ({lineItems.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialSelector(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  From Materials
                </button>
                <button
                  type="button"
                  onClick={() => addLineItem()}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-all text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Custom Item
                </button>
              </div>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-700 rounded-lg">
                <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400">No items added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="text-left px-3 py-2 text-sm font-medium text-zinc-300">Item</th>
                      <th className="text-center px-3 py-2 text-sm font-medium text-zinc-300">Qty</th>
                      <th className="text-right px-3 py-2 text-sm font-medium text-zinc-300">Price</th>
                      <th className="text-right px-3 py-2 text-sm font-medium text-zinc-300">Total</th>
                      <th className="text-center px-3 py-2 text-sm font-medium text-zinc-300"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            value={item.material_name}
                            onChange={(e) => updateLineItem(item.id, 'material_name', e.target.value)}
                            className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                            placeholder="Item name"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 mt-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 text-xs"
                            placeholder="Description (optional)"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm text-center"
                            min="0.01"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm text-right"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-3 text-right text-white font-medium">
                          ₹{item.total.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Calculations */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
              Pricing & Calculations
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tax Percent (%)</label>
                  <input
                    type="number"
                    value={formData.tax_percent}
                    onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-zinc-300">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Discount:</span>
                  <span className="font-medium text-red-400">-₹{parseFloat(formData.discount || '0').toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Tax ({formData.tax_percent}%):</span>
                  <span className="font-medium">₹{calculateTax().toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 mt-2"></div>
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-yellow-600">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600"
                  placeholder="Internal notes about this quotation..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Terms & Conditions</label>
                <textarea
                  value={formData.terms_and_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600"
                  placeholder="Terms and conditions for this quotation..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Terms</label>
                <textarea
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600"
                  placeholder="Payment terms and schedule..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/admin/quotations/${quotationId}`}
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Updating...' : 'Update Quotation'}</span>
            </button>
          </div>
        </form>

        {/* Material Selector Modal */}
        {showMaterialSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Select Material</h3>
                <button
                  onClick={() => setShowMaterialSelector(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <div className="p-6 border-b border-zinc-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                  <input
                    type="text"
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600"
                    placeholder="Search materials..."
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredMaterials.map((material) => (
                    <div
                      key={material.id}
                      onClick={() => addLineItem(material)}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-yellow-600 transition-all"
                    >
                      <h4 className="font-semibold text-white mb-1">{material.name}</h4>
                      {material.category && (
                        <p className="text-xs text-zinc-500 mb-2">{material.category}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">{material.unit || 'piece'}</span>
                        <span className="text-white font-medium">
                          ₹{material.unit_price?.toLocaleString('en-IN') || '0'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
