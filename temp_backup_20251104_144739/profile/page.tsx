'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Home, FolderOpen, FileText, Calendar, MessageSquare, LogOut, ArrowLeft,
  User, Mail, Phone, MapPin, Building, Lock, Save, Edit, X, CheckCircle,
  Camera, AlertCircle
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface ClientProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  company_name: string | null
  notes: string | null
  created_at: string
}

interface UserProfile {
  full_name: string
  role: string
  avatar_url: string | null
}

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    company_name: '',
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get client profile
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', user.email)
        .single()

      if (clientError) throw clientError

      setProfile(clientData)
      setFormData({
        full_name: clientData.full_name || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        city: clientData.city || '',
        state: clientData.state || '',
        postal_code: clientData.postal_code || '',
        company_name: clientData.company_name || '',
      })

      // Get user profile (for avatar)
      const { data: userProfileData } = await supabase
        .from('user_profiles')
        .select('full_name, role, avatar_url')
        .eq('email', user.email)
        .single()

      if (userProfileData) {
        setUserProfile(userProfileData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      showMessage('error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          company_name: formData.company_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      showMessage('success', 'Profile updated successfully')
      setEditMode(false)
      fetchProfile() // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error)
      showMessage('error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showMessage('error', 'New passwords do not match')
      return
    }

    if (passwordData.new.length < 6) {
      showMessage('error', 'Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })

      if (error) throw error

      showMessage('success', 'Password changed successfully')
      setShowPasswordModal(false)
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      console.error('Error changing password:', error)
      showMessage('error', error.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        company_name: profile.company_name || '',
      })
    }
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 p-6 z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-white">PASADA</span>
        </div>

        <nav className="space-y-2">
          <Link href="/client/dashboard" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/client/projects" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <FolderOpen className="w-5 h-5" />
            <span>My Projects</span>
          </Link>
          <Link href="/client/quotations" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <FileText className="w-5 h-5" />
            <span>Quotations</span>
          </Link>
          <Link href="/client/bookings" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <Calendar className="w-5 h-5" />
            <span>Bookings</span>
          </Link>
          <Link href="/client/messages" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Link href="/client/profile" className="flex items-center space-x-3 px-4 py-3 bg-yellow-600/10 text-yellow-600 rounded-lg">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Link href="/login" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/dashboard"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-zinc-400">Manage your account information and settings</p>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-600/10 border-green-600/20 text-green-600'
              : 'bg-red-600/10 border-red-600/20 text-red-600'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Picture & Quick Info */}
          <div className="md:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <button className="absolute bottom-4 right-0 w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white hover:bg-yellow-700 transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{profile?.full_name}</h3>
                <p className="text-zinc-400 text-sm mb-4">{profile?.email}</p>
                <span className="px-3 py-1 bg-blue-600/10 text-blue-600 rounded border border-blue-600/20 text-sm">
                  Client Account
                </span>
              </div>

              <div className="space-y-3 pt-6 border-t border-zinc-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Member Since</span>
                  <span className="text-white font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Account Type</span>
                  <span className="text-white font-medium">Premium</span>
                </div>
              </div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
              >
                <Lock className="w-5 h-5" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="md:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
              
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Email Address (Read-only)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Company Name (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                {/* City, State, Postal Code */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !passwordData.new || !passwordData.confirm}
                  className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
