'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Star, FileText, TrendingUp } from 'lucide-react'
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
  country: string | null
  zip_code: string | null
  category: string | null
  rating: number | null
  payment_terms: string | null
  notes: string | null
  status: 'active' | 'inactive' | 'blacklisted'
  created_at: string
  updated_at: string | null
}

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const vendorId = params.id as string

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vendorId) {
      fetchVendorData()
    }
  }, [vendorId])

  const fetchVendorData = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single()

      if (error) throw error
      setVendor(data)
    } catch (error) {
      console.error('Error fetching vendor:', error)
      alert('Failed to load vendor details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId)

      if (error) throw error
      
      router.push('/admin/vendors')
    } catch (error) {
      console.error('Error deleting vendor:', error)
      alert('Failed to delete vendor.')
    }
  }

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Vendor Not Found</h2>
          <Link href="/admin/vendors" className="text-yellow-600 hover:text-yellow-500">
            ← Back to Vendors
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
          href="/admin/vendors"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vendors
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{vendor.name}</h1>
              <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(vendor.status)}`}>
                {vendor.status.toUpperCase()}
              </span>
              {vendor.category && (
                <span className={`px-3 py-1 rounded text-sm ${getCategoryColor(vendor.category)}`}>
                  {vendor.category}
                </span>
              )}
            </div>
            <p className="text-zinc-400">
              Added {new Date(vendor.created_at).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/vendors/${vendorId}/edit`}
              className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Vendor</span>
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

      {/* Vendor Information */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Contact Information */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-yellow-600" />
            Contact Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {vendor.contact_name && (
              <div>
                <label className="text-sm text-zinc-500 mb-1 block">Contact Person</label>
                <p className="text-white font-medium">{vendor.contact_name}</p>
              </div>
            )}
            
            {vendor.email && (
              <div>
                <label className="text-sm text-zinc-500 mb-1 block">Email</label>
                <a 
                  href={`mailto:${vendor.email}`}
                  className="text-white hover:text-yellow-600 transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {vendor.email}
                </a>
              </div>
            )}
            
            {vendor.phone && (
              <div>
                <label className="text-sm text-zinc-500 mb-1 block">Phone</label>
                <a 
                  href={`tel:${vendor.phone}`}
                  className="text-white hover:text-yellow-600 transition-colors flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {vendor.phone}
                </a>
              </div>
            )}
            
            {(vendor.address || vendor.city) && (
              <div className="md:col-span-2">
                <label className="text-sm text-zinc-500 mb-1 block">Address</label>
                <div className="text-white flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    {vendor.address && <p>{vendor.address}</p>}
                    {(vendor.city || vendor.state || vendor.zip_code) && (
                      <p>
                        {[vendor.city, vendor.state, vendor.zip_code].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {vendor.country && <p>{vendor.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {vendor.notes && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <label className="text-sm text-zinc-500 mb-2 block">Notes</label>
              <p className="text-zinc-300 whitespace-pre-wrap">{vendor.notes}</p>
            </div>
          )}
        </div>

        {/* Quick Details */}
        <div className="space-y-6">
          {vendor.rating !== null && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-600" />
                <span className="text-4xl font-bold text-white">{vendor.rating.toFixed(1)}</span>
              </div>
              <p className="text-zinc-400">Vendor Rating</p>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= vendor.rating!
                        ? 'text-yellow-600 fill-yellow-600'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {vendor.payment_terms && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-yellow-600" />
                Payment Terms
              </h3>
              <p className="text-zinc-300">{vendor.payment_terms}</p>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-yellow-600" />
              Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className={`font-medium ${
                  vendor.status === 'active' ? 'text-green-600' :
                  vendor.status === 'inactive' ? 'text-zinc-400' :
                  'text-red-600'
                }`}>
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </span>
              </div>
              {vendor.category && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Category:</span>
                  <span className="text-white">{vendor.category}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Created:</span>
                <span className="text-white">
                  {new Date(vendor.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              {vendor.updated_at && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Last Updated:</span>
                  <span className="text-white">
                    {new Date(vendor.updated_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
