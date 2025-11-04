'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Clock, MapPin, Plus, Check, X, Video, Phone, Building, Calendar,
  MessageSquare, FileText
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { ClientLayout } from '@/app/components/ClientLayout'

interface Booking {
  id: string
  title: string
  booking_type: 'consultation' | 'site_visit' | 'design_review' | 'material_selection' | 'final_walkthrough' | 'other'
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  location: string | null
  meeting_link: string | null
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  created_at: string
  projects: {
    id: string
    name: string
  } | null
}

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [showNewBookingModal, setShowNewBookingModal] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get client by email
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .single()

      if (clientError) {
        console.error('Client not found:', clientError)
        setBookings([])
        return
      }

      // Fetch bookings
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          projects (
            id,
            name
          )
        `)
        .eq('client_id', clientData.id)
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error

      alert('Booking cancelled successfully')
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    }
  }

  const getBookingTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      consultation: MessageSquare,
      site_visit: MapPin,
      design_review: FileText,
      material_selection: Building,
      final_walkthrough: Check,
      other: Calendar,
    }
    return icons[type] || Calendar
  }

  const getBookingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      consultation: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      site_visit: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      design_review: 'bg-green-600/10 text-green-600 border-green-600/20',
      material_selection: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
      final_walkthrough: 'bg-cyan-600/10 text-cyan-600 border-cyan-600/20',
      other: 'bg-gray-600/10 text-gray-600 border-gray-600/20',
    }
    return colors[type] || colors.other
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
      confirmed: 'bg-green-600/10 text-green-600 border-green-600/20',
      completed: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      cancelled: 'bg-red-600/10 text-red-600 border-red-600/20',
      no_show: 'bg-gray-600/10 text-gray-600 border-gray-600/20',
    }
    return colors[status] || colors.scheduled
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

  const isUpcoming = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`)
    return bookingDateTime > new Date() && booking.status !== 'completed' && booking.status !== 'cancelled'
  }

  const isPast = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`)
    return bookingDateTime <= new Date() || booking.status === 'completed'
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'upcoming') return isUpcoming(booking)
    if (filter === 'past') return isPast(booking)
    return true
  })

  const upcomingCount = bookings.filter(isUpcoming).length
  const pastCount = bookings.filter(isPast).length

  return (
    <ClientLayout 
      title="My Bookings" 
      subtitle="Schedule and manage your appointments"
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/client/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div></div>
        <button
          onClick={() => setShowNewBookingModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Booking</span>
        </button>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0c1e2e] border border-blue-500/10 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{bookings.length}</span>
            </div>
            <div className="text-sm text-blue-300">Total Bookings</div>
          </div>

          <div className="bg-[#0c1e2e] border border-blue-500/10 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-green-400">{upcomingCount}</span>
            </div>
            <div className="text-sm text-blue-300">Upcoming</div>
          </div>

          <div className="bg-[#0c1e2e] border border-blue-500/10 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-400">{pastCount}</span>
            </div>
            <div className="text-sm text-blue-300">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex space-x-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-[#081624] text-zinc-400 border-blue-500/20 hover:border-blue-500/30'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-[#081624] text-zinc-400 border-blue-500/20 hover:border-blue-500/30'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'past'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-[#081624] text-zinc-400 border-blue-500/20 hover:border-blue-500/30'
            }`}
          >
            Past ({pastCount})
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mb-4"></div>
            <p className="text-zinc-400">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-[#0c1e2e] border border-blue-500/10 rounded-xl">
            <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
            <p className="text-zinc-400 mb-6">
              {filter === 'upcoming' 
                ? "You don't have any upcoming bookings." 
                : filter === 'past'
                ? "You don't have any past bookings."
                : "You haven't scheduled any bookings yet."}
            </p>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Schedule New Booking</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const TypeIcon = getBookingTypeIcon(booking.booking_type)
              const isBookingUpcoming = isUpcoming(booking)
              
              return (
                <div 
                  key={booking.id} 
                  className={`bg-[#0c1e2e] border rounded-xl p-6 transition-all ${
                    isBookingUpcoming 
                      ? 'border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg' 
                      : 'border-blue-500/10 hover:border-blue-500/20 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getBookingTypeColor(booking.booking_type)}`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{booking.title}</h3>
                            <span className={`px-3 py-1 rounded text-xs border ${getStatusColor(booking.status)}`}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded text-xs border ${getBookingTypeColor(booking.booking_type)}`}>
                              {booking.booking_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {booking.projects && (
                            <div className="text-sm text-zinc-400 mb-1">
                              Project: {booking.projects.name}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <Calendar className="w-5 h-5 text-zinc-500 mt-0.5" />
                          <div>
                            <div className="text-sm text-zinc-500">Date</div>
                            <div className="text-white font-medium">{formatDate(booking.scheduled_date)}</div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-zinc-500 mt-0.5" />
                          <div>
                            <div className="text-sm text-zinc-500">Time</div>
                            <div className="text-white font-medium">
                              {formatTime(booking.scheduled_time)} ({booking.duration_minutes} min)
                            </div>
                          </div>
                        </div>

                        {booking.location ? (
                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-zinc-500 mt-0.5" />
                            <div>
                              <div className="text-sm text-zinc-500">Location</div>
                              <div className="text-white font-medium">{booking.location}</div>
                            </div>
                          </div>
                        ) : booking.meeting_link ? (
                          <div className="flex items-start space-x-3">
                            <Video className="w-5 h-5 text-zinc-500 mt-0.5" />
                            <div>
                              <div className="text-sm text-zinc-500">Meeting</div>
                              <a 
                                href={booking.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 font-medium underline"
                              >
                                Join Online
                              </a>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="bg-[#081624] rounded-lg p-4">
                          <div className="text-sm text-zinc-400 mb-1">Notes</div>
                          <div className="text-white text-sm">{booking.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {isBookingUpcoming && booking.status !== 'cancelled' && (
                      <div className="ml-6 flex flex-col space-y-2">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* New Booking Modal Placeholder */}
        {showNewBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0c1e2e] border border-blue-500/20 rounded-xl p-8 max-w-2xl w-full shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Request New Booking</h2>
                <button
                  onClick={() => setShowNewBookingModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Booking Request Form</h3>
                <p className="text-zinc-400 mb-6">
                  Booking request functionality will be available soon.
                  <br />
                  Please contact us directly to schedule an appointment.
                </p>
                <div className="space-y-3">
                  <a 
                    href="mailto:contact@pasada.in" 
                    className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Email Us
                  </a>
                  <a 
                    href="tel:+919876543210" 
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Us</span>
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-blue-500/20">
                <button
                  onClick={() => setShowNewBookingModal(false)}
                  className="w-full px-6 py-3 bg-[#081624] text-white rounded-lg hover:bg-[#0a1a2a] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </ClientLayout>
  )
}
