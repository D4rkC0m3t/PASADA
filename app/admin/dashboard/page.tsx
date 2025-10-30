'use client'

import Link from 'next/link'
import { MotionWrapper } from '@/app/components/MotionWrapper'
import { StatCard } from '@/app/components/StatCard'
import { RevenueChart } from '@/app/components/RevenueChart'
import { ProjectStatusChart } from '@/app/components/ProjectStatusChart'
import { CalendarTimeline } from '@/app/components/CalendarTimeline'

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
        {/* Header */}
        <MotionWrapper delay={0}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#fff8f1] mb-2">Admin Dashboard</h1>
            <p className="text-pasada-300">Welcome back! Here's what's happening with your business.</p>
          </div>
        </MotionWrapper>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            type="clients"
            value={24}
            trend="+12% from last month"
            label="Active Clients"
            delay={0.1}
          />
          
          <StatCard 
            type="quotations"
            value={42}
            trend="+8% from last month"
            label="Quotations Sent"
            delay={0.2}
          />
          
          <StatCard 
            type="revenue"
            value={12.4}
            trend="+15% from last month"
            label="Total Revenue"
            delay={0.3}
          />
          
          <StatCard 
            type="meetings"
            value={8}
            trend="This week"
            label="Upcoming Meetings"
            delay={0.4}
          />
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

        {/* Coming Soon Banner */}
        <MotionWrapper delay={0.7}>
          <div className="mt-8 bg-gradient-to-r from-gold-500/10 to-gold-600/10 border border-gold-500/20 rounded-xl p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-gold-400 mb-2">🚧 Full Dashboard Coming Soon</h3>
            <p className="text-pasada-300">
              We're building the complete admin interface with all CRM features.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <a 
                href="/pasada.design/en/homepage.html" 
                className="px-6 py-2 bg-pasada-900 border border-pasada-700 text-[#fff8f1] rounded-lg hover:bg-pasada-800 transition-all font-medium"
              >
                Back to Website
              </a>
              <Link 
                href="/admin/quotations" 
                className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-pasada-950 font-semibold rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg shadow-gold-900/50"
              >
                Build Quotation
              </Link>
            </div>
          </div>
        </MotionWrapper>
    </div>
  )
}
