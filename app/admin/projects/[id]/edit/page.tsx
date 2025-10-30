'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, MapPin, DollarSign, Building, Ruler, Calendar } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  client_id: string
  site_location: string | null
  type: string
  area_sqft: number | null
  status: string
  budget: number | null
  timeline_days: number | null
  start_date: string | null
  notes: string | null
}

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserClient()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    site_location: '',
    type: 'residential' as 'residential' | 'commercial' | 'retail' | 'hospitality' | 'other',
    area_sqft: '',
    status: 'inquiry' as 'inquiry' | 'proposal' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled',
    budget: '',
    timeline_days: '',
    start_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchClients()
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchProject = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name: data.name || '',
          client_id: data.client_id || '',
          site_location: data.site_location || '',
          type: data.type || 'residential',
          area_sqft: data.area_sqft?.toString() || '',
          status: data.status || 'inquiry',
          budget: data.budget?.toString() || '',
          timeline_days: data.timeline_days?.toString() || '',
          start_date: data.start_date || '',
          notes: data.notes || ''
        })
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      alert('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.client_id) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          client_id: formData.client_id,
          site_location: formData.site_location || null,
          type: formData.type,
          area_sqft: formData.area_sqft ? parseFloat(formData.area_sqft) : null,
          status: formData.status,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          timeline_days: formData.timeline_days ? parseInt(formData.timeline_days) : null,
          start_date: formData.start_date || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', projectId)

      if (error) throw error

      router.push(`/admin/projects/${projectId}`)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/projects/${projectId}`}
          className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project Details
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Project</h1>
        <p className="text-zinc-400">Update project information</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-yellow-600" />
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="Modern Living Room Redesign"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Client *
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Project Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                required
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="retail">Retail</option>
                <option value="hospitality">Hospitality</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
                required
              >
                <option value="inquiry">Inquiry</option>
                <option value="proposal">Proposal</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Size */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
            Location & Size
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Site Location
              </label>
              <input
                type="text"
                value={formData.site_location}
                onChange={(e) => setFormData({ ...formData, site_location: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="123 Main Street, Mumbai, Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Ruler className="w-4 h-4 inline mr-1" />
                Area (sq.ft)
              </label>
              <input
                type="number"
                value={formData.area_sqft}
                onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="1500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Budget (₹)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="500000"
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
            Timeline
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Timeline (days)
              </label>
              <input
                type="number"
                value={formData.timeline_days}
                onChange={(e) => setFormData({ ...formData, timeline_days: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
                placeholder="90"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
            rows={4}
            placeholder="Any special requirements, preferences, or important details..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href={`/admin/projects/${projectId}`}
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
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
