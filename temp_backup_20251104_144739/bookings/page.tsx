'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Calendar, Eye, Edit, Trash2, Clock, MapPin, User } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Booking {
  id: string
  title: string
  description: string | null
  booking_type: 'consultation' | 'site_visit' | 'design_review' | 'measurement' | 'installation' | 'other'
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  location: string | null
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  reminder_sent: boolean
  created_at: string
  clients: {
    id: string
    name: string
    phone: string | null
  } | null
  projects: {
    id: string
    name: string
  } | null
}

import AuthGuard from '@/components/AuthGuard'


export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [filterType, setFilterType] = useState<'all' | string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          clients (
            id,
            name,
            phone
          ),
          projects (
            id,
            name
          )
        `)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    setDeleting(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBookings(bookings.filter(b => b.id !== id))
      alert('Booking deleted successfully')
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    } finally {
      setDeleting(null)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.projects?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesType = filterType === 'all' || booking.booking_type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      confirmed: 'bg-green-600/10 text-green-600 border-green-600/20',
      completed: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
      cancelled: 'bg-red-600/10 text-red-600 border-red-600/20',
      no_show: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    }
    return colors[status as keyof typeof colors] || colors.scheduled
  }

  const getTypeColor = (type: string) => {
    const colors = {
      consultation: 'bg-purple-600/10 text-purple-600',
      site_visit: 'bg-blue-600/10 text-blue-600',
      design_review: 'bg-cyan-600/10 text-cyan-600',
      measurement: 'bg-yellow-600/10 text-yellow-600',
      installation: 'bg-green-600/10 text-green-600',
      other: 'bg-zinc-600/10 text-zinc-400',
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const isUpcoming = (date: string, time: string) => {
    const bookingDateTime = new Date(`${date}T${time}`)
    return bookingDateTime > new Date()
  }

  return (
    <AuthGuard requiredRole="admin">
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bookings & Appointments</h1>
          <p className="text-zinc-400">Manage consultations, site visits, and appointments</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
        >
          <Plus className="w-5 h-5" />
          <span>New Booking</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="consultation">Consultation</option>
          <option value="site_visit">Site Visit</option>
          <option value="design_review">Design Review</option>
          <option value="measurement">Measurement</option>
          <option value="installation">Installation</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
          <p className="text-zinc-400 mt-4">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg mb-4">No bookings found</p>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-500"
          >
            <Plus className="w-4 h-4" />
            <span>Create your first booking</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-zinc-900 border rounded-xl p-6 hover:border-zinc-700 transition-all ${
                isUpcoming(booking.scheduled_date, booking.scheduled_time) && booking.status !== 'cancelled'
                  ? 'border-yellow-600/30 bg-yellow-600/5'
                  : 'border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{booking.title}</h3>
                    <span className={`px-3 py-1 rounded text-xs border ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(booking.booking_type)}`}>
                      {booking.booking_type.replace('_', ' ')}
                    </span>
                  </div>

                  {booking.description && (
                    <p className="text-zinc-400 text-sm mb-3">{booking.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking.scheduled_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(booking.scheduled_time)} ({booking.duration_minutes} min)</span>
                    </div>
                    {booking.clients && (
                      <div className="flex items-center space-x-2 text-zinc-400">
                        <User className="w-4 h-4" />
                        <span>{booking.clients.name}</span>
                      </div>
                    )}
                    {booking.location && (
                      <div className="flex items-center space-x-2 text-zinc-400">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.location}</span>
                      </div>
                    )}
                  </div>

                  {booking.projects && (
                    <div className="mt-2 text-sm text-zinc-500">
                      Project: <span className="text-zinc-400">{booking.projects.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/bookings/${booking.id}/edit`}
                    className="p-2 text-zinc-400 hover:text-yellow-600 hover:bg-yellow-600/10 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(booking.id)}
                    disabled={deleting === booking.id}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-600/10 rounded-lg transition-all disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === booking.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && bookings.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{bookings.length}</div>
            <div className="text-sm text-zinc-400">Total Bookings</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'scheduled').length}
            </div>
            <div className="text-sm text-zinc-400">Scheduled</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-sm text-zinc-400">Confirmed</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-sm text-zinc-400">Completed</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => 
                isUpcoming(b.scheduled_date, b.scheduled_time) && 
                (b.status === 'scheduled' || b.status === 'confirmed')
              ).length}
            </div>
            <div className="text-sm text-zinc-400">Upcoming</div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  )
}
