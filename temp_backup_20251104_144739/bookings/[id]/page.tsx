'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Calendar, Clock, MapPin, User, FileText, CheckCircle, XCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Booking {
  id: string
  title: string
  description: string | null
  booking_type: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  location: string | null
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  reminder_sent: boolean
  notes: string | null
  created_at: string
  clients: {
    id: string
    name: string
    contact_name: string
    email: string | null
    phone: string | null
    address: string | null
  } | null
  projects: {
    id: string
    name: string
    type: string | null
  } | null
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  const supabase = createBrowserClient()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          clients (
            id,
            name,
            contact_name,
            email,
            phone,
            address
          ),
          projects (
            id,
            name,
            type
          )
        `)
        .eq('id', bookingId)
        .single()

      if (error) throw error
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
      alert('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      alert('Status updated successfully')
      fetchBookingDetails()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      alert('Booking deleted successfully')
      router.push('/admin/bookings')
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
      setDeleting(false)
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
          <p className="text-zinc-400">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
          <Link href="/admin/bookings" className="text-yellow-600 hover:text-yellow-500">
            Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{booking.title}</h1>
                <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(booking.status)}`}>
                  {booking.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-zinc-400 capitalize">{booking.booking_type.replace('_', ' ')}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/bookings/${bookingId}/edit`}
                className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
            Schedule
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-zinc-500 text-sm mb-1">Date</div>
              <div className="text-white font-medium">{formatDate(booking.scheduled_date)}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-sm mb-1">Time</div>
              <div className="text-white font-medium">{formatTime(booking.scheduled_time)}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-sm mb-1">Duration</div>
              <div className="text-white font-medium">{booking.duration_minutes} minutes</div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        {booking.clients && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Client Information
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-zinc-500 text-sm mb-1">Company Name</div>
                <div className="text-white font-medium">{booking.clients.name}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-sm mb-1">Contact Person</div>
                <div className="text-white">{booking.clients.contact_name}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {booking.clients.email && (
                  <div>
                    <div className="text-zinc-500 text-sm mb-1">Email</div>
                    <a href={`mailto:${booking.clients.email}`} className="text-yellow-600 hover:text-yellow-500">
                      {booking.clients.email}
                    </a>
                  </div>
                )}
                {booking.clients.phone && (
                  <div>
                    <div className="text-zinc-500 text-sm mb-1">Phone</div>
                    <a href={`tel:${booking.clients.phone}`} className="text-yellow-600 hover:text-yellow-500">
                      {booking.clients.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Project Information */}
        {booking.projects && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Project
            </h3>
            <div>
              <div className="text-zinc-500 text-sm mb-1">Project Name</div>
              <Link 
                href={`/admin/projects/${booking.projects.id}`}
                className="text-yellow-600 hover:text-yellow-500 font-medium"
              >
                {booking.projects.name}
              </Link>
            </div>
            {booking.projects.type && (
              <div className="mt-2">
                <div className="text-zinc-500 text-sm mb-1">Type</div>
                <div className="text-white capitalize">{booking.projects.type.replace('_', ' ')}</div>
              </div>
            )}
          </div>
        )}

        {/* Location */}
        {booking.location && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Location
            </h3>
            <p className="text-white">{booking.location}</p>
          </div>
        )}

        {/* Description & Notes */}
        {(booking.description || booking.notes) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            {booking.description && (
              <div className="mb-4">
                <div className="text-zinc-500 text-sm mb-1">Description</div>
                <p className="text-zinc-400">{booking.description}</p>
              </div>
            )}
            {booking.notes && (
              <div>
                <div className="text-zinc-500 text-sm mb-1">Internal Notes</div>
                <p className="text-zinc-400">{booking.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {booking.status === 'scheduled' && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={updating}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Booking</span>
                </button>
              )}
              {(booking.status === 'scheduled' || booking.status === 'confirmed') && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={updating}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Booking</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('no_show')}
                    disabled={updating}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Mark as No Show</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
