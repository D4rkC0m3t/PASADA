'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Search, X } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'

interface LineItem {
  item_number: number
  category: string
  description: string
  specifications: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  notes: string
}

interface Project {
  id: string
  name: string
  clients: {
    id: string
    name: string
    email: string
    phone: string
  }
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

export default function NewEstimationPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    client_id: '',
    estimation_type: 'rough' as 'rough' | 'detailed' | 'fixed',
    margin_percent: 20,
    validity_days: 7,
    discount: '0',
    notes: '',
    internal_notes: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      item_number: 1,
      category: '',
      description: '',
      specifications: '',
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      total: 0,
      notes: ''
    }
  ])

  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .order('name', { ascending: true })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleProjectChange = (projectId: string) => {
    setFormData({ ...formData, project_id: projectId, client_id: '' })
    const project = projects.find(p => p.id === projectId)
    setSelectedProject(project || null)
  }

  const calculateLineItemTotal = (item: LineItem) => {
    return item.quantity * item.unit_price
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    // Recalculate total
    updatedItems[index].total = calculateLineItemTotal(updatedItems[index])
    
    setLineItems(updatedItems)
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        item_number: lineItems.length + 1,
        category: '',
        description: '',
        specifications: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        total: 0,
        notes: ''
      }
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      alert('At least one line item is required')
      return
    }
    const updatedItems = lineItems.filter((_, i) => i !== index)
    // Renumber items
    updatedItems.forEach((item, i) => {
      item.item_number = i + 1
    })
    setLineItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
    const discount = parseFloat(formData.discount) || 0
    const total = subtotal - discount
    
    return { subtotal, discount, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || lineItems.length === 0) {
      alert('Please fill in title and add at least one line item')
      return
    }

    if (!formData.project_id && !formData.client_id) {
      alert('Please select either a project or a client')
      return
    }

    try {
      setSaving(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const totals = calculateTotals()

      // Create estimation
      const { data: estimation, error: estimationError } = await supabase
        .from('estimations')
        .insert([{
          title: formData.title,
          description: formData.description || null,
          project_id: formData.project_id || null,
          client_id: formData.client_id || null,
          estimation_type: formData.estimation_type,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
          margin_percent: formData.margin_percent,
          validity_days: formData.validity_days,
          notes: formData.notes || null,
          internal_notes: formData.internal_notes || null,
          status: 'draft',
          created_by: user.id
        }])
        .select()
        .single()

      if (estimationError) throw estimationError

      // Create line items
      const itemsToInsert = lineItems.map(item => ({
        estimation_id: estimation.id,
        item_number: item.item_number,
        category: item.category || null,
        description: item.description,
        specifications: item.specifications || null,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.total,
        notes: item.notes || null
      }))

      const { error: itemsError } = await supabase
        .from('estimation_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      alert('Estimation created successfully!')
      router.push('/admin/estimations')
    } catch (error) {
      console.error('Error creating estimation:', error)
      alert('Failed to create estimation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const totals = calculateTotals()

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/estimations"
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">New Estimation</h1>
              <p className="text-zinc-400">Quick cost calculation for internal use</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Estimation'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="e.g., Kitchen Renovation - Initial Estimate"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Brief description of the estimation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Project (Optional)
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-600 transition-colors"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.clients.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Client (If no project)
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  disabled={!!formData.project_id}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Estimation Type
                </label>
                <select
                  value={formData.estimation_type}
                  onChange={(e) => setFormData({ ...formData, estimation_type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-600 transition-colors"
                >
                  <option value="rough">Rough (±20%)</option>
                  <option value="detailed">Detailed (±10%)</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Validity (Days)
                </label>
                <input
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 7 })}
                  min="1"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-zinc-400">Item #{item.item_number}</span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-600"
                        placeholder="Item description"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-600"
                        placeholder="e.g., Furniture"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Unit
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-600"
                      >
                        <option value="pcs">Pieces</option>
                        <option value="sqft">Sq. Ft.</option>
                        <option value="sqm">Sq. M.</option>
                        <option value="rft">Running Ft.</option>
                        <option value="set">Set</option>
                        <option value="lot">Lot</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-sm font-medium">
                        ₹{item.total.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Subtotal:</span>
                <span className="text-white font-medium text-lg">
                  ₹{totals.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-zinc-400">Discount:</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-40 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-right focus:outline-none focus:border-blue-600"
                  placeholder="0.00"
                />
              </div>

              <div className="pt-4 border-t border-zinc-700 flex justify-between items-center">
                <span className="text-white font-semibold text-lg">Total:</span>
                <span className="text-blue-400 font-bold text-2xl">
                  ₹{totals.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Client Notes (Visible to client)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Notes for the client..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Internal Notes (Private)
                </label>
                <textarea
                  value={formData.internal_notes}
                  onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Internal notes (not visible to client)..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthGuard>
  )
}
