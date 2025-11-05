'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Search, X, FileText, Building, Calendar, DollarSign, Calculator, Info } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { formatIndianCurrency } from '@/lib/gst/calculator'

interface LineItem {
  id: string
  material_id: string | null
  material_name: string
  description: string
  category: string
  hsn_sac_code: string
  quantity: number
  unit: string
  unit_price: number
  taxable_value: number
  tax_rate: number
  gst_amount: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
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
    gstin: string | null
    state_code: string | null
    client_type: 'B2B' | 'B2C'
  }
}

interface HSNSACCode {
  code: string
  description: string
  type: 'HSN' | 'SAC'
  gst_rate: number
  is_active: boolean
}

interface CompanyGST {
  gstin: string
  state_code: string
}

interface Material {
  id: string
  name: string
  category: string | null
  unit: string | null
  unit_price: number | null
}

import AuthGuard from '@/components/AuthGuard'


export default function NewQuotationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  const preselectedProjectId = searchParams.get('project')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [hsnSacCodes, setHsnSacCodes] = useState<HSNSACCode[]>([])
  const [companyGST, setCompanyGST] = useState<CompanyGST | null>(null)
  const [isIntraState, setIsIntraState] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'B2B' | 'B2C'>('B2C')
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)
  const [materialSearch, setMaterialSearch] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    project_id: preselectedProjectId || '',
    discount: '0',
    valid_until: '',
    notes: '',
    terms: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])

  useEffect(() => {
    fetchProjects()
    fetchMaterials()
    fetchCompanyGST()
    fetchHSNSACCodes()
  }, [])

  useEffect(() => {
    if (formData.project_id && companyGST) {
      const selectedProject = projects.find(p => p.id === formData.project_id)
      if (selectedProject?.clients) {
        const client = selectedProject.clients
        if (client.gstin && companyGST.gstin) {
          setInvoiceType('B2B')
          setIsIntraState(client.state_code === companyGST.state_code)
        } else {
          setInvoiceType('B2C')
          setIsIntraState(true)
        }
        recalculateAllLineItems()
      }
    }
  }, [formData.project_id, companyGST, projects])

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
            phone,
            gstin,
            state_code,
            client_type
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchCompanyGST = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('gstin, state_code')
        .single()
      if (error) throw error
      setCompanyGST(data)
    } catch (error) {
      console.error('Error fetching company GST:', error)
    }
  }

  const fetchHSNSACCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('hsn_sac_master')
        .select('code, description, type, gst_rate, is_active')
        .eq('is_active', true)
        .order('code')
      if (error) throw error
      setHsnSacCodes(data || [])
    } catch (error) {
      console.error('Error fetching HSN/SAC codes:', error)
    }
  }

  const calculateGSTForItem = (quantity: number, unitPrice: number, taxRate: number) => {
    const taxableValue = quantity * unitPrice
    const gstAmount = (taxableValue * taxRate) / 100
    return {
      taxableValue,
      gstAmount,
      cgstAmount: isIntraState ? gstAmount / 2 : 0,
      sgstAmount: isIntraState ? gstAmount / 2 : 0,
      igstAmount: isIntraState ? 0 : gstAmount,
      total: taxableValue + gstAmount
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

  const addLineItem = (material?: Material) => {
    const quantity = 1
    const unitPrice = material?.unit_price || 0
    const taxRate = 18
    const gstCalc = calculateGSTForItem(quantity, unitPrice, taxRate)
    
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(7),
      material_id: material?.id || null,
      material_name: material?.name || '',
      description: '',
      category: material?.category || 'Labor',
      hsn_sac_code: '',
      quantity,
      unit: material?.unit || 'piece',
      unit_price: unitPrice,
      taxable_value: gstCalc.taxableValue,
      tax_rate: taxRate,
      gst_amount: gstCalc.gstAmount,
      cgst_amount: gstCalc.cgstAmount,
      sgst_amount: gstCalc.sgstAmount,
      igst_amount: gstCalc.igstAmount,
      total: gstCalc.total
    }
    setLineItems([...lineItems, newItem])
    setShowMaterialSelector(false)
    setMaterialSearch('')
  }

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        const gstCalc = calculateGSTForItem(updated.quantity, updated.unit_price, updated.tax_rate)
        updated.taxable_value = gstCalc.taxableValue
        updated.gst_amount = gstCalc.gstAmount
        updated.cgst_amount = gstCalc.cgstAmount
        updated.sgst_amount = gstCalc.sgstAmount
        updated.igst_amount = gstCalc.igstAmount
        updated.total = gstCalc.total
        return updated
      }
      return item
    }))
  }

  const recalculateAllLineItems = () => {
    setLineItems(lineItems.map(item => {
      const gstCalc = calculateGSTForItem(item.quantity, item.unit_price, item.tax_rate)
      return {
        ...item,
        taxable_value: gstCalc.taxableValue,
        gst_amount: gstCalc.gstAmount,
        cgst_amount: gstCalc.cgstAmount,
        sgst_amount: gstCalc.sgstAmount,
        igst_amount: gstCalc.igstAmount,
        total: gstCalc.total
      }
    }))
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const calculateGSTBreakdown = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.taxable_value, 0)
    const totalCGST = lineItems.reduce((sum, item) => sum + item.cgst_amount, 0)
    const totalSGST = lineItems.reduce((sum, item) => sum + item.sgst_amount, 0)
    const totalIGST = lineItems.reduce((sum, item) => sum + item.igst_amount, 0)
    const totalGST = totalCGST + totalSGST + totalIGST
    const discount = parseFloat(formData.discount) || 0
    const grandTotal = subtotal - discount + totalGST
    
    return {
      subtotal,
      discount,
      taxableAmount: subtotal - discount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalGST,
      grandTotal
    }
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

      const gstBreakdown = calculateGSTBreakdown()

      // Create quotation with GST fields
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert([{
          title: formData.title,
          project_id: formData.project_id,
          subtotal: gstBreakdown.subtotal,
          total_amount: gstBreakdown.subtotal,
          gst_rate: 18,
          gst_amount: gstBreakdown.totalGST,
          cgst_amount: gstBreakdown.totalCGST,
          sgst_amount: gstBreakdown.totalSGST,
          igst_amount: gstBreakdown.totalIGST,
          total_with_gst: gstBreakdown.grandTotal,
          discount: parseFloat(formData.discount) || null,
          buyer_gstin: selectedProject?.clients.gstin,
          seller_gstin: companyGST?.gstin,
          place_of_supply: selectedProject?.clients.state_code,
          invoice_type: invoiceType,
          status: 'draft',
          version: 1,
          valid_until: formData.valid_until || null,
          notes: formData.notes || null,
          terms: formData.terms || null,
          created_by: user.id
        }])
        .select()
        .single()

      if (quotationError) throw quotationError

      // Create line items with GST fields
      const itemsToInsert = lineItems.map(item => ({
        quotation_id: quotation.id,
        material_id: item.material_id,
        category: item.category,
        description: item.material_name + (item.description ? ' - ' + item.description : ''),
        hsn_sac_code: item.hsn_sac_code || null,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        taxable_value: item.taxable_value,
        tax_rate: item.tax_rate,
        gst_amount: item.gst_amount,
        cgst_amount: item.cgst_amount,
        sgst_amount: item.sgst_amount,
        igst_amount: item.igst_amount,
        total: item.total
      }))

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      alert('Quotation created successfully!')
      router.push('/admin/quotations')
    } catch (error) {
      console.error('Error creating quotation:', error)
      alert('Failed to create quotation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectedProject = projects.find(p => p.id === formData.project_id)
  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
    m.category?.toLowerCase().includes(materialSearch.toLowerCase())
  )
  const gstBreakdown = calculateGSTBreakdown()

  return (
    <AuthGuard requiredRole="admin">
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/quotations"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotations
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">New Quotation</h1>
          <p className="text-zinc-400">Create a professional quotation for your project</p>
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

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/quotations"
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
              <span>{saving ? 'Creating...' : 'Create Quotation'}</span>
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
    </AuthGuard>
  )
}

