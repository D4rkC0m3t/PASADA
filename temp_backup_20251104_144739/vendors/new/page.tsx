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
    contact_name: '',
    category: '',
    service_description: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    
    // Communication
    telephone: '',
    mobile: '',
    phone: '',
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
    rating: '',
    
    // Documents
    documents_notes: '',
    notes: '',
    
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
          {/* Request Information */}
          <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#fff8f1] mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gold-400" />
              Request Information
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Request Type *
                </label>
                <select
                  value={formData.request_type}
                  onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] focus:outline-none focus:border-gold-500 transition-colors"
                >
                  <option value="creation">Creation</option>
                  <option value="modification">Modification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Title *
                </label>
                <select
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] focus:outline-none focus:border-gold-500 transition-colors"
                >
                  <option value="mr">Mr</option>
                  <option value="ms">Ms</option>
                  <option value="mrs">Mrs</option>
                  <option value="company">Company</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Vendor Type *
                </label>
                <select
                  value={formData.vendor_type}
                  onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] focus:outline-none focus:border-gold-500 transition-colors"
                >
                  <option value="domestic">Domestic</option>
                  <option value="foreign">Foreign</option>
                </select>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#fff8f1] mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gold-400" />
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Name of the Vendor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="ABC Suppliers Ltd."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Vendor Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] focus:outline-none focus:border-gold-500 transition-colors"
                >
                  <option value="">Select category</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="consumables">Consumables</option>
                  <option value="capital_items">Capital Items</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Type of Service/Goods Receipt
                </label>
                <textarea
                  value={formData.service_description}
                  onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                  rows={2}
                  placeholder="Brief description of nature of supply by vendor"
                />
              </div>
            </div>
          </div>

          {/* Address & Communication */}
          <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#fff8f1] mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gold-400" />
              Address & Communication
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-pasada-300 mb-2">
                Address of the party
                <span className="text-xs text-pasada-400 ml-2">(with postal code & state)</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                rows={3}
                placeholder="123 Business Park, Industrial Area, City, State - 400001"
              />
            </div>

            <div className="border-t border-pasada-700 pt-6">
              <h3 className="text-lg font-semibold text-[#fff8f1] mb-4">Communication</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telephone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="+91 22 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Fax
                  </label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="+91 22 1234 5679"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-mail of Vendor
                    <span className="text-xs text-pasada-400 ml-2">(can be more than one)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="vendor@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-mail of TSRL SPOC
                  </label>
                  <input
                    type="email"
                    value={formData.email_tsrl_spoc}
                    onChange={(e) => setFormData({ ...formData, email_tsrl_spoc: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="spoc@tsrl.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#fff8f1] mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gold-400" />
              Tax Information (if any)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  PAN
                </label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors uppercase"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  GSTIN
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors uppercase"
                  placeholder="22ABCDE1234F1Z5"
                  maxLength={15}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  MSME No.
                  <span className="text-xs text-pasada-400 ml-2">(If Any)(Mention NA if not applicable)</span>
                </label>
                <input
                  type="text"
                  value={formData.msme_no}
                  onChange={(e) => setFormData({ ...formData, msme_no: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="UDYAM-XX-00-0000000 or NA"
                />
              </div>
            </div>
          </div>

          {/* Bank Details - Conditional based on vendor_type */}
          {formData.vendor_type === 'domestic' && (
            <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#fff8f1] mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-gold-400" />
                Bank Details of Indian Vendor
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Name of the beneficiary
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Beneficiary Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name_indian}
                    onChange={(e) => setFormData({ ...formData, bank_name_indian: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="State Bank of India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Bank branch name
                  </label>
                  <input
                    type="text"
                    value={formData.bank_branch_indian}
                    onChange={(e) => setFormData({ ...formData, bank_branch_indian: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Mumbai Main Branch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Beneficiary A/C No.
                  </label>
                  <input
                    type="text"
                    value={formData.beneficiary_ac_no_indian}
                    onChange={(e) => setFormData({ ...formData, beneficiary_ac_no_indian: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Bank IFSC code
                  </label>
                  <input
                    type="text"
                    value={formData.bank_ifsc_indian}
                    onChange={(e) => setFormData({ ...formData, bank_ifsc_indian: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors uppercase"
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.vendor_type === 'foreign' && (
            <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#fff8f1] mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-gold-400" />
                Bank Details of Foreign Vendor
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Name of the beneficiary
                  </label>
                  <input
                    type="text"
                    value={formData.beneficiary_name_foreign}
                    onChange={(e) => setFormData({ ...formData, beneficiary_name_foreign: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Beneficiary Name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Address of beneficiary
                  </label>
                  <textarea
                    value={formData.beneficiary_address_foreign}
                    onChange={(e) => setFormData({ ...formData, beneficiary_address_foreign: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    rows={2}
                    placeholder="Beneficiary Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Beneficiary A/C No.
                  </label>
                  <input
                    type="text"
                    value={formData.beneficiary_ac_no_foreign}
                    onChange={(e) => setFormData({ ...formData, beneficiary_ac_no_foreign: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Account Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Bank Name & Branch
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name_branch_foreign}
                    onChange={(e) => setFormData({ ...formData, bank_name_branch_foreign: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Bank Name & Branch"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Bank Address
                  </label>
                  <textarea
                    value={formData.bank_address_foreign}
                    onChange={(e) => setFormData({ ...formData, bank_address_foreign: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    rows={2}
                    placeholder="Bank Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    ABA Routing
                  </label>
                  <input
                    type="text"
                    value={formData.aba_routing}
                    onChange={(e) => setFormData({ ...formData, aba_routing: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="ABA Routing Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Sort Code
                  </label>
                  <input
                    type="text"
                    value={formData.sort_code}
                    onChange={(e) => setFormData({ ...formData, sort_code: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Sort Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    IBAN No
                  </label>
                  <input
                    type="text"
                    value={formData.iban_no}
                    onChange={(e) => setFormData({ ...formData, iban_no: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors uppercase"
                    placeholder="IBAN Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Swift Code
                  </label>
                  <input
                    type="text"
                    value={formData.swift_code}
                    onChange={(e) => setFormData({ ...formData, swift_code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors uppercase"
                    placeholder="SWIFT Code"
                    maxLength={11}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-pasada-300 mb-2">
                    Beneficiary E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.beneficiary_email_foreign}
                    onChange={(e) => setFormData({ ...formData, beneficiary_email_foreign: e.target.value })}
                    className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="beneficiary@example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#fff8f1] mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-gold-400" />
              Payment Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] focus:outline-none focus:border-gold-500 transition-colors"
                >
                  <option value="">Select payment method</option>
                  <option value="cheque">Cheque</option>
                  <option value="neft">NEFT</option>
                  <option value="rtgs">RTGS</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="dd">DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Payment Terms
                </label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] focus:outline-none focus:border-gold-500 transition-colors"
                >
                  <option value="">Select payment terms</option>
                  <option value="Z010">Z010 - 30 days from invoice date</option>
                  <option value="Z012">Z012 - 45 days from invoice date</option>
                  <option value="Z014">Z014 - 100% Advance</option>
                  <option value="custom">Custom Terms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-pasada-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] focus:outline-none focus:border-gold-500 transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-pasada-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-pasada-900 border border-pasada-700 rounded-lg text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500 transition-colors"
                rows={4}
                placeholder="Any special notes about this vendor..."
              />
            </div>
          </div>

          {/* Mandatory Documents Information */}
          <div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#fff8f1] mb-4">Mandatory Documents Required</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-pasada-300">
              <li>Cancelled Cheque (With Name of Party on Cheque) / Bank Certificate</li>
              <li>Copy of PAN / Form 60 if no PAN</li>
              <li>GST Certificate / Provisional GST Certificate / Declaration of No GST Registration</li>
              <li>Copy of Valid MSME Certificate (if any)</li>
              <li>Incorporation certificate in case of a company</li>
              <li>Tax Exemption / Lower tax deduction certificate if any</li>
            </ul>
          </div>

          {/* Other Clarifications */}
          <div className="bg-yellow-950/20 border border-yellow-800/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#fff8f1] mb-4">Other Clarifications</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-pasada-300">
              <li>In case Vendor has provided service from more than one state, separate registration will be required for every state</li>
              <li>In case of modification of existing Company only on account but not restricted to Merger, etc will require New Incorporation Certificate and court order</li>
              <li>Any Update for the Vendor Master will require the necessary documents as mentioned above</li>
              <li>Change in name of the Company only on account but not restricted to Merger, etc will require New Incorporation Certificate and court order</li>
              <li>No Update request will be accepted from vendor directly, it should be routed through TSRL SPOC</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/vendors"
              className="px-6 py-3 bg-pasada-800 text-[#fff8f1] rounded-lg hover:bg-pasada-700 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="glass-button flex items-center space-x-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
