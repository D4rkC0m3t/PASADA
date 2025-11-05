'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Star, FileText } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

import AuthGuard from '@/components/AuthGuard'


export default function NewVendorPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    // Basic Information
    request_type: 'creation',
    title: '',
    vendor_type: 'domestic',
    name: '',
    category: '',
    service_description: '',
    
    // Address
    address: '',
    
    // Communication
    telephone: '',
    mobile: '',
    fax: '',
    email: '',
    email_tsrl_spoc: '',
    
    // Tax Information
    pan: '',
    gstin: '',
    msme_no: '',
    
    // Bank Details - Indian Vendor
    bank_name_indian: '',
    bank_branch_indian: '',
    beneficiary_ac_no_indian: '',
    bank_ifsc_indian: '',
    
    // Bank Details - Foreign Vendor
    beneficiary_name_foreign: '',
    beneficiary_address_foreign: '',
    beneficiary_ac_no_foreign: '',
    bank_name_branch_foreign: '',
    bank_address_foreign: '',
    aba_routing: '',
    sort_code: '',
    iban_no: '',
    swift_code: '',
    beneficiary_email_foreign: '',
    
    // Payment Details
    payment_method: '',
    payment_terms: '',
    
    // Documents
    documents_notes: '',
    
    status: 'active' as 'active' | 'inactive' | 'pending'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      alert('Please enter vendor name')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('vendors')
        .insert([{
          name: formData.name,
          email: formData.email || null,
          phone: formData.telephone || formData.mobile || null,
          address: formData.address || null,
          category: formData.category || null,
          payment_terms: formData.payment_terms || null,
          status: formData.status,
          // Store additional fields in a JSONB column if available
          metadata: {
            request_type: formData.request_type,
            title: formData.title,
            vendor_type: formData.vendor_type,
            service_description: formData.service_description,
            telephone: formData.telephone,
            mobile: formData.mobile,
            fax: formData.fax,
            email_tsrl_spoc: formData.email_tsrl_spoc,
            pan: formData.pan,
            gstin: formData.gstin,
            msme_no: formData.msme_no,
            bank_details_indian: {
              bank_name: formData.bank_name_indian,
              bank_branch: formData.bank_branch_indian,
              beneficiary_ac_no: formData.beneficiary_ac_no_indian,
              bank_ifsc: formData.bank_ifsc_indian
            },
            bank_details_foreign: {
              beneficiary_name: formData.beneficiary_name_foreign,
              beneficiary_address: formData.beneficiary_address_foreign,
              beneficiary_ac_no: formData.beneficiary_ac_no_foreign,
              bank_name_branch: formData.bank_name_branch_foreign,
              bank_address: formData.bank_address_foreign,
              aba_routing: formData.aba_routing,
              sort_code: formData.sort_code,
              iban_no: formData.iban_no,
              swift_code: formData.swift_code,
              beneficiary_email: formData.beneficiary_email_foreign
            },
            payment_method: formData.payment_method,
            documents_notes: formData.documents_notes
          }
        }])

      if (error) throw error

      router.push('/admin/vendors')
    } catch (error) {
      console.error('Error creating vendor:', error)
      alert('Failed to create vendor. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard requiredRole="admin">
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/vendors"
            className="inline-flex items-center text-pasada-300 hover:text-[#fff8f1] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Link>
          <h1 className="text-3xl font-bold text-[#fff8f1] mb-2">Add New Vendor</h1>
          <p className="text-pasada-300">Add a new vendor or supplier to your directory</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-yellow-600" />
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Vendor/Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="ABC Suppliers Ltd."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                  <option value="Hardware">Hardware</option>
                  <option value="Paint">Paint</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Fixtures">Fixtures</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-yellow-600" />
              Contact Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="vendor@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
              Address Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="123 Business Park, Industrial Area"
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-yellow-600" />
              Additional Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="4.5"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="e.g., Net 30, 50% advance, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                rows={4}
                placeholder="Any special notes about this vendor..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/vendors"
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
              <span>{saving ? 'Creating...' : 'Create Vendor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </AuthGuard>
  )
}

