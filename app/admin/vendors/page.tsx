'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Users, Star, Phone, Mail } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Vendor {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  category: string | null
  rating: number | null
  payment_terms: string | null
  status: 'active' | 'inactive' | 'blacklisted'
  created_at: string
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name')

      if (error) throw error
      setVendors(data || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchVendors()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      alert('Failed to delete vendor')
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-600/10 text-green-600 border-green-600/20',
      inactive: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
      blacklisted: 'bg-red-600/10 text-red-600 border-red-600/20',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-zinc-600/10 text-zinc-400'
    
    const colors: Record<string, string> = {
      'flooring': 'bg-blue-600/10 text-blue-600',
      'lighting': 'bg-yellow-600/10 text-yellow-600',
      'furniture': 'bg-purple-600/10 text-purple-600',
      'hardware': 'bg-orange-600/10 text-orange-600',
      'paint': 'bg-pink-600/10 text-pink-600',
      'fabric': 'bg-indigo-600/10 text-indigo-600',
    }
    
    return colors[category.toLowerCase()] || 'bg-zinc-600/10 text-zinc-400'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Vendors & Suppliers</h1>
          <p className="text-zinc-400">Manage your vendor relationships</p>
        </div>
        <Link
          href="/admin/vendors/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vendor</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search vendors by name, contact, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors min-w-[200px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
          <p className="text-zinc-400 ml-4">Loading vendors...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVendors.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-yellow-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No vendors found</h3>
          <p className="text-zinc-400 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first vendor'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link
              href="/admin/vendors/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Vendor</span>
            </Link>
          )}
        </div>
      )}

      {/* Vendors Grid */}
      {!loading && filteredVendors.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-yellow-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{vendor.name}</h3>
                  {vendor.contact_name && (
                    <p className="text-sm text-zinc-400">{vendor.contact_name}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded text-xs border ${getStatusColor(vendor.status)}`}>
                  {vendor.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {vendor.email && (
                  <div className="flex items-center text-sm text-zinc-400">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${vendor.email}`} className="hover:text-yellow-600">
                      {vendor.email}
                    </a>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center text-sm text-zinc-400">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href={`tel:${vendor.phone}`} className="hover:text-yellow-600">
                      {vendor.phone}
                    </a>
                  </div>
                )}
                {vendor.city && vendor.state && (
                  <div className="text-sm text-zinc-500">
                    {vendor.city}, {vendor.state}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                {vendor.category && (
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(vendor.category)}`}>
                    {vendor.category}
                  </span>
                )}
                {vendor.rating && (
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-600 mr-1" />
                    <span className="text-white font-medium">{vendor.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <Link
                  href={`/admin/vendors/${vendor.id}`}
                  className="text-sm text-yellow-600 hover:text-yellow-500 transition-colors"
                >
                  View Details
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/vendors/${vendor.id}/edit`}
                    className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-yellow-600 transition-all"
                    title="Edit Vendor"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-red-900/20 hover:text-red-600 transition-all"
                    title="Delete Vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && filteredVendors.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{filteredVendors.length}</div>
            <div className="text-sm text-zinc-400">Total Vendors</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {vendors.filter(v => v.status === 'active').length}
            </div>
            <div className="text-sm text-zinc-400">Active</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {vendors.filter(v => v.rating && v.rating >= 4).length}
            </div>
            <div className="text-sm text-zinc-400">Top Rated</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Array.from(new Set(vendors.map(v => v.category).filter(Boolean))).length}
            </div>
            <div className="text-sm text-zinc-400">Categories</div>
          </div>
        </div>
      )}
    </div>
  )
}
