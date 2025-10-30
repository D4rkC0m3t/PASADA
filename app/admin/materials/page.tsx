'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Package, DollarSign, Tag } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Material {
  id: string
  name: string
  category: string | null
  description: string | null
  unit: string | null
  unit_price: number | null
  supplier_name: string | null
  supplier_contact: string | null
  sku: string | null
  stock_quantity: number | null
  image_url: string | null
  created_at: string
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchMaterials()
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Failed to delete material')
    }
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean)))

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-zinc-600/10 text-zinc-400'
    
    const colors: Record<string, string> = {
      'flooring': 'bg-blue-600/10 text-blue-600',
      'lighting': 'bg-yellow-600/10 text-yellow-600',
      'furniture': 'bg-purple-600/10 text-purple-600',
      'fixtures': 'bg-green-600/10 text-green-600',
      'paint': 'bg-pink-600/10 text-pink-600',
      'hardware': 'bg-orange-600/10 text-orange-600',
      'fabric': 'bg-indigo-600/10 text-indigo-600',
      'accessories': 'bg-teal-600/10 text-teal-600',
    }
    
    return colors[category.toLowerCase()] || 'bg-zinc-600/10 text-zinc-400'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Materials Catalog</h1>
          <p className="text-zinc-400">Manage your materials and products inventory</p>
        </div>
        <Link
          href="/admin/materials/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
        >
          <Plus className="w-5 h-5" />
          <span>Add Material</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search materials by name, SKU, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors min-w-[200px]"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
          <p className="text-zinc-400 ml-4">Loading materials...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMaterials.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-yellow-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No materials found</h3>
          <p className="text-zinc-400 mb-6">
            {searchTerm || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first material'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <Link
              href="/admin/materials/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Material</span>
            </Link>
          )}
        </div>
      )}

      {/* Materials Grid */}
      {!loading && filteredMaterials.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-yellow-600/50 transition-all group"
            >
              {/* Material Image */}
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                {material.image_url ? (
                  <img
                    src={material.image_url}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-zinc-700" />
                  </div>
                )}
                {material.category && (
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded text-xs ${getCategoryColor(material.category)}`}>
                    {material.category}
                  </span>
                )}
              </div>

              {/* Material Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-yellow-600 transition-colors">
                    {material.name}
                  </h3>
                  {material.sku && (
                    <p className="text-sm text-zinc-500">SKU: {material.sku}</p>
                  )}
                  {material.description && (
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                </div>

                {/* Pricing and Unit */}
                <div className="space-y-2 mb-4">
                  {material.unit_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Price:</span>
                      <span className="text-lg font-bold text-white flex items-center">
                        <DollarSign className="w-4 h-4" />
                        {material.unit_price.toLocaleString('en-IN')}
                        {material.unit && <span className="text-sm text-zinc-500 ml-1">/ {material.unit}</span>}
                      </span>
                    </div>
                  )}
                  {material.supplier_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Supplier:</span>
                      <span className="text-sm text-white">{material.supplier_name}</span>
                    </div>
                  )}
                  {material.stock_quantity !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Stock:</span>
                      <span className={`text-sm font-medium ${
                        material.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {material.stock_quantity} {material.unit || 'units'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <Link
                    href={`/admin/materials/${material.id}`}
                    className="text-sm text-yellow-600 hover:text-yellow-500 transition-colors"
                  >
                    View Details
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/materials/${material.id}/edit`}
                      className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-yellow-600 transition-all"
                      title="Edit Material"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-red-900/20 hover:text-red-600 transition-all"
                      title="Delete Material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && filteredMaterials.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{filteredMaterials.length}</div>
            <div className="text-sm text-zinc-400">Total Materials</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{categories.length}</div>
            <div className="text-sm text-zinc-400">Categories</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredMaterials.filter(m => m.unit_price).length}
            </div>
            <div className="text-sm text-zinc-400">With Pricing</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredMaterials.filter(m => m.stock_quantity && m.stock_quantity > 0).length}
            </div>
            <div className="text-sm text-zinc-400">In Stock</div>
          </div>
        </div>
      )}
    </div>
  )
}
