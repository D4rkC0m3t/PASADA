'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, FileText, TrendingUp, Calendar, Plus } from 'lucide-react'
import { MotionWrapper } from '@/app/components/MotionWrapper'
import PremiumStatCard from '@/components/dashboard/PremiumStatCard'
import { RevenueChart } from '@/app/components/RevenueChart'
import { ProjectStatusChart } from '@/app/components/ProjectStatusChart'
import { CalendarTimeline } from '@/app/components/CalendarTimeline'
import { LeadsTable } from '@/app/components/LeadsTable'
import { VisitorAnalytics } from '@/app/components/VisitorAnalytics'
import { VendorManagement } from '@/app/components/VendorManagement'
import AuthGuard from '@/components/AuthGuard'
import { createBrowserClient } from '@/lib/supabase/client'
import '@/app/styles/dashboard-theme.css'

interface DashboardStats {
  totalClients: number
  activeClients: number
  totalQuotations: number
  totalRevenue: number
  upcomingMeetings: number
  clientTrend: string
  quotationTrend: string
  revenueTrend: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalQuotations: 0,
    totalRevenue: 0,
    upcomingMeetings: 0,
    clientTrend: 'Loading...',
    quotationTrend: 'Loading...',
    revenueTrend: 'Loading...'
  })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Fetch clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, is_active, created_at')
      
      if (clientsError) throw clientsError

      // Fetch quotations
      const { data: quotations, error: quotationsError } = await supabase
        .from('quotations')
        .select('id, total_amount, status, created_at')
      
      if (quotationsError) throw quotationsError

      // Fetch bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, scheduled_date, status')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .eq('status', 'scheduled')
      
      if (bookingsError) throw bookingsError

      // Calculate stats
      const totalClients = clients?.length || 0
      const activeClients = clients?.filter(c => c.is_active).length || 0
      const totalQuotations = quotations?.length || 0
      const totalRevenue = quotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0
      const upcomingMeetings = bookings?.length || 0

      // Calculate trends (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const recentClients = clients?.filter(c => new Date(c.created_at) > thirtyDaysAgo).length || 0
      const previousClients = clients?.filter(c => {
        const date = new Date(c.created_at)
        return date > sixtyDaysAgo && date <= thirtyDaysAgo
      }).length || 0

      const recentQuotations = quotations?.filter(q => new Date(q.created_at) > thirtyDaysAgo).length || 0
      const previousQuotations = quotations?.filter(q => {
        const date = new Date(q.created_at)
        return date > sixtyDaysAgo && date <= thirtyDaysAgo
      }).length || 0

      const recentRevenue = quotations?.filter(q => new Date(q.created_at) > thirtyDaysAgo)
        .reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0
      const previousRevenue = quotations?.filter(q => {
        const date = new Date(q.created_at)
        return date > sixtyDaysAgo && date <= thirtyDaysAgo
      }).reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0

      const clientTrend = previousClients > 0 
        ? `${Math.round(((recentClients - previousClients) / previousClients) * 100)}% from last month`
        : recentClients > 0 ? `${recentClients} new this month` : 'No change'

      const quotationTrend = previousQuotations > 0
        ? `${Math.round(((recentQuotations - previousQuotations) / previousQuotations) * 100)}% from last month`
        : recentQuotations > 0 ? `${recentQuotations} new this month` : 'No change'

      const revenueTrend = previousRevenue > 0
        ? `${Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)}% from last month`
        : recentRevenue > 0 ? 'Growing' : 'No change'

      setStats({
        totalClients,
        activeClients,
        totalQuotations,
        totalRevenue: totalRevenue / 100000, // Convert to lakhs
        upcomingMeetings,
        clientTrend,
        quotationTrend,
        revenueTrend
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen p-8 dashboard-dark noise-texture" style={{
        background: 'linear-gradient(135deg, var(--dashboard-bg-start) 0%, var(--dashboard-bg-mid) 50%, var(--dashboard-bg-end) 100%)'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="hero-number text-5xl font-bold mb-3 tracking-tight" style={{
            background: 'linear-gradient(135deg, #fff8f1 0%, rgba(255, 248, 241, 0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Admin Dashboard</h1>
          <p className="body-text text-lg">Welcome back! Here's what's happening with your business.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl"></div>
            ))
          ) : (
            <>
              <PremiumStatCard
                icon={Users}
                value={stats.activeClients}
                label="Active Clients"
                trend={{
                  value: 12,
                  direction: 'up'
                }}
                status="Live"
                iconColor="#4ade80"
                delay={0}
              />
              
              <PremiumStatCard
                icon={FileText}
                value={stats.totalQuotations}
                label="Quotations"
                trend={{
                  value: 8,
                  direction: 'up'
                }}
                iconColor="#3b82f6"
                delay={0.1}
              />
              
              <PremiumStatCard
                icon={TrendingUp}
                value={`₹${stats.totalRevenue.toFixed(1)}L`}
                label="Total Revenue"
                trend={{
                  value: 15,
                  direction: 'up'
                }}
                iconColor="#d4a574"
                delay={0.2}
              />
              
              <PremiumStatCard
                icon={Calendar}
                value={stats.upcomingMeetings}
                label="Meetings"
                status="Upcoming"
                iconColor="#fbbf24"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart />
          <ProjectStatusChart />
        </div>

        {/* Calendar Timeline */}
        <div className="mb-8">
          <MotionWrapper delay={0.6}>
            <CalendarTimeline />
          </MotionWrapper>
        </div>

        {/* Analytics & Leads Section */}
        <div className="mb-8">
          <MotionWrapper delay={0.7}>
            <div className="mb-4">
              <h2 className="card-title text-2xl font-bold tracking-tight">Analytics & Leads</h2>
              <p className="body-text text-sm mt-1">Track website performance and manage incoming leads</p>
            </div>
          </MotionWrapper>
          
          {/* Visitor Analytics */}
          <div className="mb-6">
            <VisitorAnalytics days={30} />
          </div>

          {/* Leads Table */}
          <div>
            <LeadsTable />
          </div>
        </div>

        {/* Vendor Management Section */}
        <div className="mb-8">
          <VendorManagement />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 glass-card p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/clients/new">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary p-6 text-center cursor-pointer relative overflow-hidden group"
              >
                <div className="flex items-center justify-center gap-3">
                  <Users className="w-6 h-6" />
                  <div className="font-semibold text-lg">Add New Client</div>
                </div>
              </motion.div>
            </Link>
            <Link href="/admin/projects/new">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary p-6 text-center cursor-pointer relative overflow-hidden group"
              >
                <div className="flex items-center justify-center gap-3">
                  <Plus className="w-6 h-6" />
                  <div className="font-semibold text-lg">Create Project</div>
                </div>
              </motion.div>
            </Link>
            <Link href="/admin/quotations/new">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary p-6 text-center cursor-pointer relative overflow-hidden group ambient-glow"
              >
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6" />
                  <div className="font-semibold text-lg">Build Quotation</div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </AuthGuard>
  )
}
