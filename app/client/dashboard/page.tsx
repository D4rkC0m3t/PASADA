'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthGuard from '@/components/AuthGuard'
import { FileText, Clock, CheckCircle, AlertCircle, Folder, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// Client-specific components
const ClientStatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  description,
  color = 'primary'
}: { 
  icon: any, 
  title: string, 
  value: string, 
  description: string,
  color?: 'primary' | 'success' | 'warning' | 'destructive'
}) => {
  const colorVariants = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    destructive: 'bg-destructive/10 text-destructive'
  }
    </div>
    <div className="flex justify-between items-center">
      <span className="text-xl font-bold text-[#fff8f1]">Γé╣{(quotation.total_amount || 0).toLocaleString('en-IN')}</span>
      <Link href={`/client/quotations/${quotation.id}`} className="text-gold-400 text-sm hover:underline hover:text-gold-300">
        View Details
      </Link>
    </div>
  </div>
)

interface Project {
  id: string
  name: string
  status: string
  budget: number | null
  start_date: string | null
  completion_percentage: number | null
  type: string | null
}

interface Quotation {
  id: string
  quotation_number: string
  title: string
  total_amount: number | null
  status: string
}

interface Booking {
  id: string
  title: string
  scheduled_date: string
  scheduled_time: string | null
  booking_type: string
}

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export default function ClientDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchClientData()
  }, [])

  const fetchClientData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Γ£à SECURE: Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        setError('Please log in to view your dashboard')
        return
      }

      // Γ£à SECURE: Get user profile with client_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('client_id, role')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      
      if (!profile) {
        setError('User profile not found. Please contact support.')
        return
      }

      if (profile.role !== 'client') {
        setError('This dashboard is only accessible to clients.')
        return
      }

      if (!profile.client_id) {
        setError('Your account is not linked to a client record. Please contact support.')
        return
      }

      // Γ£à SECURE: Fetch projects - RLS will ensure only client's projects are returned
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status, budget, start_date, completion_percentage, type')
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false })
        .limit(6)

      if (projectsError) {
        console.error('Projects error:', projectsError)
        throw projectsError
      }

      // Γ£à SECURE: Fetch quotations - RLS will ensure only client's quotations are returned
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select('id, quotation_number, title, total_amount, status')
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false })
        .limit(4)

      if (quotationsError) {
        console.error('Quotations error:', quotationsError)
        throw quotationsError
      }

      // Γ£à SECURE: Fetch bookings - RLS will ensure only client's bookings are returned
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, title, scheduled_date, scheduled_time, booking_type')
        .eq('client_id', profile.client_id)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .limit(3)

      if (bookingsError) {
        console.error('Bookings error:', bookingsError)
        throw bookingsError
      }

      setProjects(projectsData || [])
      setQuotations(quotationsData || [])
      setBookings(bookingsData || [])
    } catch (error: any) {
      console.error('Error fetching client data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning' || p.status === 'design')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const pendingQuotations = quotations.filter(q => q.status === 'sent' || q.status === 'viewed')

  if (error) {
    return (
      <AuthGuard requiredRole="client">
        <div className="min-h-screen p-8 dashboard-dark noise-texture flex items-center justify-center">
          <div className="glassmorphic-card p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Error</h2>
            <p className="text-pasada-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary px-6 py-2"
            >
              Retry
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="client">
      <div className="min-h-screen p-8 dashboard-dark noise-texture" style={{
        background: 'linear-gradient(135deg, var(--dashboard-bg-start) 0%, var(--dashboard-bg-mid) 50%, var(--dashboard-bg-end) 100%)'
      }}>
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="hero-number text-5xl font-bold mb-3 tracking-tight" style={{
                background: 'linear-gradient(135deg, #fff8f1 0%, rgba(255, 248, 241, 0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Client Portal</h1>
              <p className="body-text text-lg">Track your interior design projects and quotations</p>
            </motion.div>

            {/* Client Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-2xl"></div>
                ))
              ) : (
                <>
                  <ClientStatCard 
                    icon={Folder} 
                    title="Active Projects" 
                    value={activeProjects.length.toString()} 
                    status={`${projects.length} total projects`} 
                    color="blue" 
                  />
                  <ClientStatCard 
                    icon={Clock} 
                    title="Upcoming Meetings" 
                    value={bookings.length.toString()} 
                    status={bookings.length > 0 ? `Next: ${new Date(bookings[0].scheduled_date).toLocaleDateString()}` : 'No meetings scheduled'} 
                    color="green" 
                  />
                  <ClientStatCard 
                    icon={FileText} 
                    title="Quotations" 
                    value={quotations.length.toString()} 
                    status={`${pendingQuotations.length} pending approval`} 
                    color="yellow" 
                  />
                  <ClientStatCard 
                    icon={CheckCircle} 
                    title="Completed Projects" 
                    value={completedProjects.length.toString()} 
                    status="View portfolio" 
                    color="purple" 
                  />
                </>
              )}
            </div>

            {/* Projects Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="heading-style-h4 text-2xl font-bold">Your Projects</h2>
                <Link href="/client/projects" className="text-gold-400 text-sm hover:underline hover:text-gold-300">
                  View All
                </Link>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-48 rounded-2xl"></div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <ProjectCard 
                      key={project.id}
                      project={project}
                      onClick={() => window.location.href = `/client/projects/${project.id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="glassmorphic-card p-12 text-center">
                  <Folder className="w-16 h-16 text-gold-400/30 mx-auto mb-4" />
                  <h3 className="heading-style-h6 font-medium mb-2">No Projects Yet</h3>
                  <p className="body-text text-sm">Your projects will appear here once they are created</p>
                </div>
              )}
            </div>

            {/* Recent Quotations */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="heading-style-h4 text-2xl font-bold">Recent Quotations</h2>
                <Link href="/client/quotations" className="text-gold-400 text-sm hover:underline hover:text-gold-300">
                  View All
                </Link>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="skeleton h-32 rounded-2xl"></div>
                  ))}
                </div>
              ) : quotations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quotations.map(quotation => (
                    <QuotationCard 
                      key={quotation.id}
                      quotation={quotation}
                    />
                  ))}
                </div>
              ) : (
                <div className="glassmorphic-card p-12 text-center">
                  <FileText className="w-16 h-16 text-gold-400/30 mx-auto mb-4" />
                  <h3 className="heading-style-h6 font-medium mb-2">No Quotations Yet</h3>
                  <p className="body-text text-sm">Quotations will appear here once they are sent to you</p>
                </div>
              )}
            </div>

            {/* Upcoming Meetings */}
            <div className="glassmorphic-card p-6 mb-8">
              <h2 className="heading-style-h4 text-2xl font-bold mb-4">Upcoming Meetings</h2>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded-lg"></div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 glass-card hover:bg-pasada-800/50 transition-colors rounded-lg">
                      <div>
                        <h3 className="heading-style-h6 font-medium">{booking.title}</h3>
                        <p className="body-text text-sm">{formatStatus(booking.booking_type)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold-400 font-medium">
                          {new Date(booking.scheduled_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="body-text text-sm">{booking.scheduled_time || 'Time TBD'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gold-400/30 mx-auto mb-3" />
                  <p className="body-text text-sm">No upcoming meetings scheduled</p>
                </div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </AuthGuard>
  )
}
