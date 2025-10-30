'use client'
import { motion } from 'framer-motion'
import { StatCard } from '../../components/StatCard'
import { RevenueChart } from '../../components/RevenueChart'
import { ProjectStatusChart } from '../../components/ProjectStatusChart'
import { CalendarTimeline } from '../../components/CalendarTimeline'
import { Sidebar } from '../../components/Sidebar'
import AuthGuard from '@/components/AuthGuard'

export default function ClientDashboardPage() {
  return (
    <AuthGuard requiredRole="client">
      <div className="flex h-screen bg-[#0a0a0a]">
        <Sidebar />
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-y-auto p-8"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
              <p className="text-gray-400">Here's your interior design dashboard overview.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard type="clients" value={24} trend="+12%" label="Total Clients" delay={0.2} />
              <StatCard type="quotations" value={18} trend="+8%" label="Active Quotations" delay={0.3} />
              <StatCard type="revenue" value={12.5} trend="+15%" label="Revenue (Lakhs)" delay={0.4} />
              <StatCard type="meetings" value={7} trend="+2" label="Upcoming Meetings" delay={0.5} />
            </div>

            {/* Charts Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid lg:grid-cols-2 gap-6 mb-8"
            >
              <RevenueChart />
              <ProjectStatusChart />
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-8"
            >
              <CalendarTimeline />
            </motion.div>
          </div>
        </motion.main>
      </div>
    </AuthGuard>
  )
}
