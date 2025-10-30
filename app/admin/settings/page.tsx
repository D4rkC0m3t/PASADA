'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Building2, Mail, Phone, MapPin, Globe, FileText, Bell, Lock, Palette, Database } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'company' | 'profile' | 'notifications' | 'appearance' | 'system'>('company')
  
  const [companySettings, setCompanySettings] = useState({
    companyName: 'PASADA Interior Design',
    businessType: 'Interior Design & Furniture',
    email: 'pasada.groups@gmail.com',
    phone: '+40 (123) 456-7890',
    address: 'Bucharest, Romania',
    website: 'https://pasada.in',
    taxId: 'RO12345678',
    registrationNumber: 'J40/1234/2024'
  })

  const [profileSettings, setProfileSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    language: 'en',
    timezone: 'Europe/Bucharest'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    quotationUpdates: true,
    newBookings: true,
    clientMessages: true,
    projectUpdates: true,
    systemAlerts: true
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    accentColor: 'yellow',
    compactMode: false,
    showAnimations: true
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfileSettings({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: user.email || '',
          phone: profile.phone || '',
          role: profile.role || '',
          language: 'en',
          timezone: 'Europe/Bucharest'
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSaveMessage('')
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'company' as const, label: 'Company', icon: Building2 },
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'system' as const, label: 'System', icon: Database }
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-zinc-400">Manage your application settings and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
        {saveMessage && (
          <div className={`mt-4 p-4 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-600/10 text-red-600' : 'bg-green-600/10 text-green-600'}`}>
            {saveMessage}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-zinc-800">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {/* Company Settings */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Building2 className="w-6 h-6 mr-3 text-yellow-600" />
                Company Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Business Type</label>
                  <input
                    type="text"
                    value={companySettings.businessType}
                    onChange={(e) => setCompanySettings({ ...companySettings, businessType: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tax ID</label>
                  <input
                    type="text"
                    value={companySettings.taxId}
                    onChange={(e) => setCompanySettings({ ...companySettings, taxId: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Registration Number</label>
                  <input
                    type="text"
                    value={companySettings.registrationNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, registrationNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-yellow-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileSettings.email}
                    disabled
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Role</label>
                  <input
                    type="text"
                    value={profileSettings.role}
                    disabled
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Language</label>
                  <select
                    value={profileSettings.language}
                    onChange={(e) => setProfileSettings({ ...profileSettings, language: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  >
                    <option value="en">English</option>
                    <option value="ro">Romanian</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Timezone</label>
                  <select
                    value={profileSettings.timezone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
                  >
                    <option value="Europe/Bucharest">Europe/Bucharest (GMT+2)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">America/New York (GMT-5)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-3 text-yellow-600" />
                Security
              </h2>
              <button className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all">
                Change Password
              </button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Bell className="w-6 h-6 mr-3 text-yellow-600" />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                  { key: 'quotationUpdates', label: 'Quotation Updates', description: 'Get notified when quotations are approved or rejected' },
                  { key: 'newBookings', label: 'New Bookings', description: 'Alert me when new bookings are created' },
                  { key: 'clientMessages', label: 'Client Messages', description: 'Notify about new client messages' },
                  { key: 'projectUpdates', label: 'Project Updates', description: 'Stay updated on project status changes' },
                  { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications and updates' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{item.label}</div>
                      <div className="text-sm text-zinc-400">{item.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Palette className="w-6 h-6 mr-3 text-yellow-600" />
                Appearance Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['dark', 'light', 'auto'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme })}
                        className={`p-4 rounded-lg border-2 transition-all capitalize ${
                          appearanceSettings.theme === theme
                            ? 'border-yellow-600 bg-yellow-600/10'
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="text-white font-medium">{theme}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">Accent Color</label>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: 'yellow', color: 'bg-yellow-600' },
                      { name: 'blue', color: 'bg-blue-600' },
                      { name: 'green', color: 'bg-green-600' },
                      { name: 'purple', color: 'bg-purple-600' }
                    ].map(accent => (
                      <button
                        key={accent.name}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, accentColor: accent.name })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          appearanceSettings.accentColor === accent.name
                            ? 'border-yellow-600'
                            : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <div className={`w-full h-8 ${accent.color} rounded`}></div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div>
                    <div className="font-medium text-white">Compact Mode</div>
                    <div className="text-sm text-zinc-400">Reduce spacing and padding</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearanceSettings.compactMode}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div>
                    <div className="font-medium text-white">Show Animations</div>
                    <div className="text-sm text-zinc-400">Enable page transitions and effects</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearanceSettings.showAnimations}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, showAnimations: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Database className="w-6 h-6 mr-3 text-yellow-600" />
                System Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-zinc-800 rounded-lg">
                  <span className="text-zinc-400">Application Version</span>
                  <span className="text-white font-medium">v1.0.0</span>
                </div>
                <div className="flex justify-between p-4 bg-zinc-800 rounded-lg">
                  <span className="text-zinc-400">Database Status</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex justify-between p-4 bg-zinc-800 rounded-lg">
                  <span className="text-zinc-400">Storage Used</span>
                  <span className="text-white font-medium">248 MB / 1 GB</span>
                </div>
                <div className="flex justify-between p-4 bg-zinc-800 rounded-lg">
                  <span className="text-zinc-400">Last Backup</span>
                  <span className="text-white font-medium">2 hours ago</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Danger Zone</h2>
              <div className="space-y-4">
                <button className="w-full px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-all">
                  Clear Cache
                </button>
                <button className="w-full px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-all">
                  Export All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
