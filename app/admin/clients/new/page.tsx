'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Building } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'residential' as 'residential' | 'commercial',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      alert('Please enter client name')
      return
    }

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: formData.name,
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          pincode: formData.pincode || null,
          type: formData.type,
          notes: formData.notes || null
        }])
        .select()

      if (error) throw error

      alert('Client added successfully!')
      router.push('/admin/clients')
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Failed to add client')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            href="/admin/clients"
            className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Client</h1>
            <p className="text-zinc-400">Fill in the client details below</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-yellow-600" />
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="ABC Company Pvt Ltd"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              {/* Client Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Client Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-yellow-600" />
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
              Address
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="123 Main Street, Apartment 4B"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="Mumbai"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="Maharashtra"
                />
              </div>

              {/* Pincode */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-yellow-600" />
              Additional Notes
            </h2>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors resize-none"
                placeholder="Any additional information about the client..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/clients"
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-8 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
