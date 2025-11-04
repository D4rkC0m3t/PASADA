'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Package, DollarSign, Tag, User, Image as ImageIcon } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function EditMaterialPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const materialId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    unit: 'piece',
    unit_price: '',
    supplier_name: '',
    supplier_contact: '',
    supplier_email: '',
    sku: '',
    stock_quantity: '',
    reorder_level: '',
    image_url: '',
    notes: ''
  })

  useEffect(() => {
    if (materialId) {
      fetchMaterial()
    }
  }, [materialId])

  const fetchMaterial = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', materialId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name: data.name || '',
          category: data.category || '',
          description: data.description || '',
          unit: data.unit || 'piece',
          unit_price: data.unit_price?.toString() || '',
          supplier_name: data.supplier_name || '',
          supplier_contact: data.supplier_contact || '',
          supplier_email: data.supplier_email || '',
          sku: data.sku || '',
          stock_quantity: data.stock_quantity?.toString() || '',
          reorder_level: data.reorder_level?.toString() || '',
          image_url: data.image_url || '',
          notes: data.notes || ''
        })
      }
    } catch (error) {
      console.error('Error fetching material:', error)
      alert('Failed to load material details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      alert('Please enter material name')
      return
    }

    try {
      setSaving(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('materials')
        .update({
          name: formData.name,
          category: formData.category || null,
          description: formData.description || null,
          unit: formData.unit || null,
          unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
          supplier_name: formData.supplier_name || null,
          supplier_contact: formData.supplier_contact || null,
          supplier_email: formData.supplier_email || null,
          sku: formData.sku || null,
          stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
          reorder_level: formData.reorder_level ? parseInt(formData.reorder_level) : null,
          image_url: formData.image_url || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', materialId)

      if (error) throw error

      router.push(`/admin/materials/${materialId}`)
    } catch (error) {
      console.error('Error updating material:', error)
      alert('Failed to update material. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/materials/${materialId}`}
          className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Material Details
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Material</h1>
        <p className="text-zinc-400">Update material information</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-yellow-600" />
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Material Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="Solid Wood Flooring Oak"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
              >
                <option value="">Select category</option>
                <option value="Flooring">Flooring</option>
                <option value="Lighting">Lighting</option>
                <option value="Furniture">Furniture</option>
                <option value="Fixtures">Fixtures</option>
                <option value="Paint">Paint</option>
                <option value="Hardware">Hardware</option>
                <option value="Fabric">Fabric</option>
                <option value="Accessories">Accessories</option>
                <option value="Tiles">Tiles</option>
                <option value="Countertops">Countertops</option>
                <option value="Cabinetry">Cabinetry</option>
                <option value="Windows & Doors">Windows & Doors</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                SKU / Product Code
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="OAK-FLR-001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                rows={3}
                placeholder="Detailed description of the material, specifications, color, finish, etc."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
            Pricing & Inventory
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Unit Price (₹)
              </label>
              <input
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="2500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Unit of Measurement
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
              >
                <option value="piece">Piece</option>
                <option value="sqft">Square Feet</option>
                <option value="sqm">Square Meter</option>
                <option value="meter">Meter</option>
                <option value="liter">Liter</option>
                <option value="kg">Kilogram</option>
                <option value="box">Box</option>
                <option value="roll">Roll</option>
                <option value="sheet">Sheet</option>
                <option value="set">Set</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="100"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="20"
                min="0"
              />
              <p className="text-xs text-zinc-500 mt-1">Alert when stock falls below this level</p>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-yellow-600" />
            Supplier Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Supplier Name
              </label>
              <input
                type="text"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="ABC Suppliers Pvt Ltd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Supplier Contact
              </label>
              <input
                type="tel"
                value={formData.supplier_contact}
                onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Supplier Email
              </label>
              <input
                type="email"
                value={formData.supplier_email}
                onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="supplier@example.com"
              />
            </div>
          </div>
        </div>

        {/* Image & Additional Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-yellow-600" />
            Image & Additional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-zinc-500 mt-1">Direct URL to product image</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                rows={4}
                placeholder="Any additional information, installation notes, maintenance requirements, etc."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href={`/admin/materials/${materialId}`}
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
