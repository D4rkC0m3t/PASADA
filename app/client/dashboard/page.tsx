'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthGuard from '@/components/AuthGuard'
import { FileText, Clock, CheckCircle, AlertCircle, Folder } from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import '@/app/styles/dashboard-theme.css'

// Client-specific components
const ClientStatCard = ({ icon: Icon, title, value, status, color }: { icon: any, title: string, value: string, status: string, color: string }) => (
  <div className="glass-stat-card p-6 hover:translate-y-[-2px]">
    <div className="flex justify-between items-start">
      <div>
        <p className="stat-label text-sm mb-1">{title}</p>
        <h3 className="stat-value text-2xl font-bold">{value}</h3>
        <p className={`text-${color}-400 text-xs mt-2`}>{status}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/10`}>
        <Icon className={`text-${color}-400 w-6 h-6`} />
      </div>
    </div>
  </div>
)

// Project card for client view
const ProjectCard = ({ title, status, progress, date }: { title: string, status: string, progress: number, date: string }) => (
  <div className="glassmorphic-card p-6 transition-all">
    <h3 className="heading-style-h6 font-semibold mb-2">{title}</h3>
    <div className="flex justify-between items-center mb-3">
      <span className={`px-2 py-1 rounded text-xs ${status === 'In Progress' ? 'bg-gold-500/20 text-gold-300' : status === 'Pending Approval' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
        {status}
      </span>
      <span className="text-pasada-300 text-xs">{date}</span>
    </div>
    <div className="w-full bg-pasada-900 rounded-full h-2 mb-1">
      <div className="bg-gold-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
    <div className="flex justify-between text-xs text-pasada-300">
      <span>Progress</span>
      <span>{progress}%</span>
    </div>
  </div>
)

// Quotation card for client view
const QuotationCard = ({ id, title, amount, status }: { id: string, title: string, amount: string, status: string }) => (
  <div className="glassmorphic-card p-6 transition-all">
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-xs text-pasada-300 mb-1">Quotation #{id}</p>
        <h3 className="font-semibold text-[#fff8f1]">{title}</h3>
      </div>
      <div className={`p-2 rounded ${status === 'Pending' ? 'bg-yellow-500/20' : status === 'Approved' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        {status === 'Pending' ? <Clock className="w-4 h-4 text-yellow-400" /> : 
         status === 'Approved' ? <CheckCircle className="w-4 h-4 text-green-400" /> : 
         <AlertCircle className="w-4 h-4 text-red-400" />}
      </div>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-xl font-bold text-[#fff8f1]">{amount}</span>
      <Link href={`/client/quotations/${id}`} className="text-gold-400 text-sm hover:underline hover:text-gold-300">View Details</Link>
    </div>
  </div>
)

interface Project {
  id: string
  name: string
  status: string
  budget: number
  start_date: string
  completion_percentage: number
}

interface Quotation {
  id: string
  quotation_number: string
  title: string
  total_amount: number
  status: string
}

interface Booking {
  id: string
  title: string
  scheduled_date: string
  scheduled_time: string
  booking_type: string
}

export default function ClientDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchClientData()
  }, [])

  const fetchClientData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get client by email
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!client) return

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, status, budget, start_date, completion_percentage')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Fetch quotations
      const { data: quotationsData } = await supabase
        .from('quotations')
        .select('id, quotation_number, title, total_amount, status, project_id')
        .in('project_id', projectsData?.map(p => p.id) || [])
        .order('created_at', { ascending: false })
        .limit(2)

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, title, scheduled_date, scheduled_time, booking_type')
        .eq('client_id', client.id)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .limit(2)

      setProjects(projectsData || [])
      setQuotations(quotationsData || [])
      setBookings(bookingsData || [])
    } catch (error) {
      console.error('Error fetching client data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const pendingQuotations = quotations.filter(q => q.status === 'pending' || q.status === 'sent')

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
                  <div key={i} className="skeleton h-48 rounded-2xl"></div>
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
                <h2 className="heading-style-h4 text-xl font-bold">Your Projects</h2>
                <Link href="/client/projects" className="text-gold-400 text-sm hover:underline hover:text-gold-300">View All</Link>
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
                      title={project.name} 
                      status={formatStatus(project.status)} 
                      progress={project.completion_percentage || 0} 
                      date={`Started: ${new Date(project.start_date).toLocaleDateString()}`} 
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
                <h2 className="heading-style-h4 text-xl font-bold">Recent Quotations</h2>
                <Link href="/client/quotations" className="text-gold-400 text-sm hover:underline hover:text-gold-300">View All</Link>
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
                      id={quotation.quotation_number} 
                      title={quotation.title} 
                      amount={`₹${(quotation.total_amount || 0).toLocaleString('en-IN')}`} 
                      status={formatStatus(quotation.status)} 
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
              <h2 className="heading-style-h4 text-xl font-bold mb-4">Upcoming Meetings</h2>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded-lg"></div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 glass-card hover:bg-pasada-800/50 transition-colors">
                      <div>
                        <h3 className="heading-style-h6 font-medium">{booking.title}</h3>
                        <p className="body-text text-sm">{formatStatus(booking.booking_type)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold-400 font-medium">{new Date(booking.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="body-text text-sm">{booking.scheduled_time}</p>
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
