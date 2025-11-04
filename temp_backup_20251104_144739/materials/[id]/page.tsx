'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Tag, User, Image as ImageIcon, AlertCircle, Box } from 'lucide-react'
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
  supplier_email: string | null
  sku: string | null
  stock_quantity: number | null
  reorder_level: number | null
  image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export default function MaterialDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const materialId = params.id as string

  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)

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
      setMaterial(data)
    } catch (error) {
      console.error('Error fetching material:', error)
      alert('Failed to load material details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (error) throw error
      
      router.push('/admin/materials')
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Failed to delete material.')
    }
  }

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-zinc-600/10 text-zinc-400'
    
    const colors: Record<string, string> = {
      'flooring': 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      'lighting': 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
      'furniture': 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      'fixtures': 'bg-green-600/10 text-green-600 border-green-600/20',
      'paint': 'bg-pink-600/10 text-pink-600 border-pink-600/20',
      'hardware': 'bg-orange-600/10 text-orange-600 border-orange-600/20',
      'fabric': 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20',
      'accessories': 'bg-teal-600/10 text-teal-600 border-teal-600/20',
    }
    
    return colors[category.toLowerCase()] || 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20'
  }

  const isLowStock = material && material.stock_quantity !== null && material.reorder_level !== null && material.stock_quantity <= material.reorder_level

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Material Not Found</h2>
          <Link href="/admin/materials" className="text-yellow-600 hover:text-yellow-500">
            ← Back to Materials
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/materials"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Materials
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{material.name}</h1>
              {material.category && (
                <span className={`px-3 py-1 rounded text-sm border ${getCategoryColor(material.category)}`}>
                  {material.category}
                </span>
              )}
            </div>
            {material.sku && (
              <p className="text-zinc-400">SKU: {material.sku}</p>
            )}
            <p className="text-zinc-500 text-sm mt-1">
              Added {new Date(material.created_at).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/materials/${materialId}/edit`}
              className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Material</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600/10 text-red-600 rounded-lg hover:bg-red-600/20 transition-all border border-red-600/20"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {isLowStock && (
        <div className="mb-6 bg-orange-600/10 border border-orange-600/20 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-orange-600 font-semibold mb-1">Low Stock Alert</h3>
            <p className="text-orange-400 text-sm">
              Current stock ({material.stock_quantity} {material.unit}) is at or below reorder level ({material.reorder_level} {material.unit}). 
              Consider restocking soon.
            </p>
          </div>
        </div>
      )}

      {/* Material Information */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Image */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="aspect-square bg-zinc-800 relative">
              {material.image_url ? (
                <img
                  src={material.image_url}
                  alt={material.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-zinc-700" />
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 space-y-4">
            {material.unit_price && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ₹{material.unit_price.toLocaleString('en-IN')}
                    </div>
                    {material.unit && (
                      <div className="text-sm text-zinc-400">per {material.unit}</div>
                    )}
                  </div>
                </div>
                <p className="text-zinc-400 text-sm">Unit Price</p>
              </div>
            )}

            {material.stock_quantity !== null && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Box className="w-8 h-8 text-blue-600" />
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      material.stock_quantity > (material.reorder_level || 0) 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {material.stock_quantity}
                    </div>
                    {material.unit && (
                      <div className="text-sm text-zinc-400">{material.unit}s</div>
                    )}
                  </div>
                </div>
                <p className="text-zinc-400 text-sm">In Stock</p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-yellow-600" />
              Material Details
            </h2>
            
            {material.description && (
              <div className="mb-6">
                <label className="text-sm text-zinc-500 mb-2 block">Description</label>
                <p className="text-white whitespace-pre-wrap">{material.description}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {material.category && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Category</label>
                  <p className="text-white">{material.category}</p>
                </div>
              )}

              {material.unit && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Unit of Measurement</label>
                  <p className="text-white capitalize">{material.unit}</p>
                </div>
              )}

              {material.reorder_level !== null && (
                <div>
                  <label className="text-sm text-zinc-500 mb-1 block">Reorder Level</label>
                  <p className="text-white">
                    {material.reorder_level} {material.unit}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          {(material.supplier_name || material.supplier_contact || material.supplier_email) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-yellow-600" />
                Supplier Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {material.supplier_name && (
                  <div>
                    <label className="text-sm text-zinc-500 mb-1 block">Supplier Name</label>
                    <p className="text-white">{material.supplier_name}</p>
                  </div>
                )}

                {material.supplier_contact && (
                  <div>
                    <label className="text-sm text-zinc-500 mb-1 block">Contact Number</label>
                    <a 
                      href={`tel:${material.supplier_contact}`}
                      className="text-white hover:text-yellow-600 transition-colors"
                    >
                      {material.supplier_contact}
                    </a>
                  </div>
                )}

                {material.supplier_email && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-zinc-500 mb-1 block">Email</label>
                    <a 
                      href={`mailto:${material.supplier_email}`}
                      className="text-white hover:text-yellow-600 transition-colors"
                    >
                      {material.supplier_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {material.notes && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Additional Notes</h2>
              <p className="text-zinc-300 whitespace-pre-wrap">{material.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
