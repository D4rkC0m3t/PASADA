'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Building2, CreditCard, FileText, Settings as SettingsIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { validateGSTIN, validatePAN } from '@/lib/gst/validation'
import { GST_STATE_CODES } from '@/lib/gst/state-codes'
import AuthGuard from '@/components/AuthGuard'

interface CompanySettings {
  id?: string
  company_name: string
  legal_name: string
  gstin: string
  pan: string
  cin: string
  constitution_type: string
  state_code: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  email: string
  phone: string
  website: string
  bank_name: string
  bank_account_number: string
  bank_account_holder: string
  bank_ifsc: string
  bank_branch: string
  logo_url: string
  signature_url: string
  gst_enabled: boolean
  default_gst_rate: number
  einvoice_enabled: boolean
}

export default function CompanySettingsPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState<CompanySettings>({
    company_name: '',
    legal_name: '',
    gstin: '',
    pan: '',
    cin: '',
    constitution_type: '',
    state_code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    email: '',
    phone: '',
    website: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
    bank_ifsc: '',
    bank_branch: '',
    logo_url: '',
    signature_url: '',
    gst_enabled: true,
    default_gst_rate: 18,
    einvoice_enabled: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCompanySettings()
  }, [])

  const fetchCompanySettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setFormData(data)
      }
    } catch (error) {
      console.error('Error fetching company settings:', error)
      setMessage({ type: 'error', text: 'Failed to load company settings' })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.company_name) newErrors.company_name = 'Company name is required'
    if (!formData.gstin) newErrors.gstin = 'GSTIN is required'
    if (!formData.state_code) newErrors.state_code = 'State code is required'
    if (!formData.email) newErrors.email = 'Email is required'

    // GSTIN validation
    if (formData.gstin) {
      const gstinValidation = validateGSTIN(formData.gstin)
      if (!gstinValidation.isValid) {
        newErrors.gstin = gstinValidation.error || 'Invalid GSTIN'
      }
    }

    // PAN validation
    if (formData.pan) {
      const panValidation = validatePAN(formData.pan)
      if (!panValidation.isValid) {
        newErrors.pan = panValidation.error || 'Invalid PAN'
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // IFSC validation (11 characters)
    if (formData.bank_ifsc && formData.bank_ifsc.length !== 11) {
      newErrors.bank_ifsc = 'IFSC code must be 11 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors below' })
      return
    }

    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const dataToSave = {
        ...formData,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      }

      if (formData.id) {
        // Update existing
        const { error } = await supabase
          .from('company_settings')
          .update(dataToSave)
          .eq('id', formData.id)

        if (error) throw error
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('company_settings')
          .insert([{ ...dataToSave, created_by: user.id }])
          .select()
          .single()

        if (error) throw error
        if (data) setFormData(data)
      }

      setMessage({ type: 'success', text: 'Company settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving company settings:', error)
      setMessage({ type: 'error', text: 'Failed to save company settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/admin/dashboard"
              className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Company Settings</h1>
              <p className="text-zinc-400">Manage your company information and GST details</p>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-emerald-900/30 border border-emerald-700 text-emerald-400' 
                : 'bg-red-900/30 border border-red-700 text-red-400'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="px-8 py-8 max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Company Information */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-yellow-600" />
                Company Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Company Name (Trade Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-zinc-800 border ${errors.company_name ? 'border-red-500' : 'border-zinc-700'} rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors`}
                    placeholder="PASADA"
                  />
                  {errors.company_name && <p className="mt-1 text-sm text-red-500">{errors.company_name}</p>}
                </div>

                {/* Legal Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    name="legal_name"
                    value={formData.legal_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="SAJEEDA BEGUM"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    GSTIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    maxLength={15}
                    className={`w-full px-4 py-3 bg-zinc-800 border ${errors.gstin ? 'border-red-500' : 'border-zinc-700'} rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors uppercase`}
                    placeholder="29CGRPB3179A1ZD"
                  />
                  {errors.gstin && <p className="mt-1 text-sm text-red-500">{errors.gstin}</p>}
                </div>

                {/* PAN */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    PAN
                  </label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full px-4 py-3 bg-zinc-800 border ${errors.pan ? 'border-red-500' : 'border-zinc-700'} rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors uppercase`}
                    placeholder="CGRPB3179A"
                  />
                  {errors.pan && <p className="mt-1 text-sm text-red-500">{errors.pan}</p>}
                </div>

                {/* CIN */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    CIN (Corporate Identification Number)
                  </label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    maxLength={21}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors uppercase"
                    placeholder="U74102KA2025PTC123456"
                  />
                </div>

                {/* Constitution Type */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Constitution Type
                  </label>
                  <select
                    name="constitution_type"
                    value={formData.constitution_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                  >
                    <option value="">Select Type</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="LLP">LLP</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-yellow-600" />
                Address
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Street Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors resize-none"
                    placeholder="Floor No., Building No., Street"
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
                    placeholder="Bengaluru"
                  />
                </div>

                {/* State Code */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state_code"
                    value={formData.state_code}
                    onChange={(e) => {
                      handleChange(e)
                      // Auto-fill state name
                      const stateName = GST_STATE_CODES[e.target.value as keyof typeof GST_STATE_CODES]
                      if (stateName) {
                        setFormData(prev => ({ ...prev, state: stateName }))
                      }
                    }}
                    className={`w-full px-4 py-3 bg-zinc-800 border ${errors.state_code ? 'border-red-500' : 'border-zinc-700'} rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors`}
                  >
                    <option value="">Select State</option>
                    {Object.entries(GST_STATE_CODES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                  {errors.state_code && <p className="mt-1 text-sm text-red-500">{errors.state_code}</p>}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="560077"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="India"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-zinc-800 border ${errors.email ? 'border-red-500' : 'border-zinc-700'} rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors`}
                    placeholder="hello@pasada.in"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="+91-98765-43210"
                  />
                </div>

                {/* Website */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="https://pasada.in"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-yellow-600" />
                Bank Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="HDFC Bank Ltd"
                  />
                </div>

                {/* Account Holder */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="bank_account_holder"
                    value={formData.bank_account_holder}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="PASADA INTERIOR DESIGN"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="50200012345678"
                  />
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="bank_ifsc"
                    value={formData.bank_ifsc}
                    onChange={handleChange}
                    maxLength={11}
                    className={`w-full px-4 py-3 bg-zinc-800 border ${errors.bank_ifsc ? 'border-red-500' : 'border-zinc-700'} rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors uppercase`}
                    placeholder="HDFC0000155"
                  />
                  {errors.bank_ifsc && <p className="mt-1 text-sm text-red-500">{errors.bank_ifsc}</p>}
                </div>

                {/* Branch */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Branch
                  </label>
                  <input
                    type="text"
                    name="bank_branch"
                    value={formData.bank_branch}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="Indiranagar, Bengaluru"
                  />
                </div>
              </div>
            </div>

            {/* GST Settings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-yellow-600" />
                GST Settings
              </h2>

              <div className="space-y-6">
                {/* GST Enabled */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="gst_enabled"
                    checked={formData.gst_enabled}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-yellow-600 focus:ring-yellow-600 focus:ring-offset-zinc-900"
                  />
                  <label className="text-sm font-medium text-zinc-300">
                    Enable GST Calculations
                  </label>
                </div>

                {/* Default GST Rate */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Default GST Rate (%)
                  </label>
                  <select
                    name="default_gst_rate"
                    value={formData.default_gst_rate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                  >
                    <option value="0">0%</option>
                    <option value="0.25">0.25%</option>
                    <option value="3">3%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                {/* E-Invoice Enabled */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="einvoice_enabled"
                    checked={formData.einvoice_enabled}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-yellow-600 focus:ring-yellow-600 focus:ring-offset-zinc-900"
                  />
                  <label className="text-sm font-medium text-zinc-300">
                    Enable E-Invoice Generation
                  </label>
                </div>

                {formData.einvoice_enabled && (
                  <div className="ml-8 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      <strong>Note:</strong> E-invoice requires API setup. Please configure API credentials in the database or contact support.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/admin/dashboard"
                className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="glass-button flex items-center space-x-2 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
