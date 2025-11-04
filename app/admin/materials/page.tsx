'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Package, DollarSign, Tag, Filter, X, SlidersHorizontal, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Material {
  id: string
  name: string
  category: string | null
  description: string | null
  unit: string | null
  unit_price: number | null
  tax_percent: number | null
  supplier_name: string | null
  supplier_contact: string | null
  sku: string | null
  stock_quantity: number | null
  min_stock_level: number | null
  status: string | null
  image_url: string | null
  created_at: string
}

import AuthGuard from '@/components/AuthGuard'


export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterStock, setFilterStock] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
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
    // Search filter
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus
    
    // Stock filter
    let matchesStock = true
    if (filterStock === 'in_stock') {
      matchesStock = (material.stock_quantity || 0) > 0
    } else if (filterStock === 'out_of_stock') {
      matchesStock = (material.stock_quantity || 0) === 0
    } else if (filterStock === 'low_stock') {
      matchesStock = (material.stock_quantity || 0) > 0 && 
                     (material.stock_quantity || 0) <= (material.min_stock_level || 0)
    }
    
    // Price range filter
    let matchesPrice = true
    if (priceRange.min && material.unit_price) {
      matchesPrice = matchesPrice && material.unit_price >= parseFloat(priceRange.min)
    }
    if (priceRange.max && material.unit_price) {
      matchesPrice = matchesPrice && material.unit_price <= parseFloat(priceRange.max)
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesPrice
  }).sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'price':
        aValue = a.unit_price || 0
        bValue = b.unit_price || 0
        break
      case 'stock':
        aValue = a.stock_quantity || 0
        bValue = b.stock_quantity || 0
        break
      case 'category':
        aValue = a.category?.toLowerCase() || ''
        bValue = b.category?.toLowerCase() || ''
        break
      default:
        aValue = a.created_at
        bValue = b.created_at
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-zinc-600/10 text-zinc-400'
    
    const colors: Record<string, string> = {
      'furniture': 'bg-purple-600/10 text-purple-600',
      'lighting': 'bg-yellow-600/10 text-yellow-600',
      'flooring': 'bg-blue-600/10 text-blue-600',
      'wall finishes': 'bg-pink-600/10 text-pink-600',
      'kitchen': 'bg-green-600/10 text-green-600',
      'bathroom': 'bg-cyan-600/10 text-cyan-600',
      'hardware': 'bg-orange-600/10 text-orange-600',
      'fabrics': 'bg-indigo-600/10 text-indigo-600',
      'decor': 'bg-teal-600/10 text-teal-600',
    }
    
    return colors[category.toLowerCase()] || 'bg-zinc-600/10 text-zinc-400'
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterCategory('all')
    setFilterStatus('all')
    setFilterStock('all')
    setPriceRange({ min: '', max: '' })
    setSortBy('created_at')
    setSortOrder('desc')
  }

  const activeFiltersCount = [
    filterCategory !== 'all',
    filterStatus !== 'all',
    filterStock !== 'all',
    priceRange.min !== '',
    priceRange.max !== '',
  ].filter(Boolean).length

  return (
    <AuthGuard requiredRole="admin">
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

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-yellow-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-yellow-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-yellow-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-yellow-600 hover:text-yellow-500 flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Stock Level</label>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                  >
                    <option value="created_at">Date Added</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-yellow-600 hover:border-yellow-600 transition-all"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Price Range (₹)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                />
                <span className="text-zinc-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-400">Active filters:</span>
            {filterCategory !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-600/10 text-yellow-600 rounded-full text-sm">
                <span>Category: {filterCategory}</span>
                <button onClick={() => setFilterCategory('all')} className="hover:text-yellow-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-600/10 text-yellow-600 rounded-full text-sm">
                <span>Status: {filterStatus}</span>
                <button onClick={() => setFilterStatus('all')} className="hover:text-yellow-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterStock !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-600/10 text-yellow-600 rounded-full text-sm">
                <span>Stock: {filterStock.replace('_', ' ')}</span>
                <button onClick={() => setFilterStock('all')} className="hover:text-yellow-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-600/10 text-yellow-600 rounded-full text-sm">
                <span>Price: ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}</span>
                <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:text-yellow-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
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
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          material.stock_quantity === 0 
                            ? 'text-red-600' 
                            : material.stock_quantity <= (material.min_stock_level || 0)
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {material.stock_quantity} {material.unit || 'units'}
                        </span>
                        {material.stock_quantity > 0 && material.stock_quantity <= (material.min_stock_level || 0) && (
                          <AlertCircle className="w-4 h-4 text-yellow-600" title="Low stock" />
                        )}
                      </div>
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
    </AuthGuard>
  )
}
