'use client'

import { MotionWrapper } from '@/app/components/MotionWrapper'
import { VisitorAnalytics } from '@/app/components/VisitorAnalytics'
import { LeadsTable } from '@/app/components/LeadsTable'

import AuthGuard from '@/components/AuthGuard'


export default function AnalyticsPage() {
  return (
    <AuthGuard requiredRole="admin">
    <div className="p-8 space-y-8">
      {/* Header */}
      <MotionWrapper delay={0}>
        <div>
          <h1 className="text-3xl font-bold text-[#fff8f1] mb-2">Analytics & Leads</h1>
          <p className="text-pasada-300">
            Track visitor behavior and manage your lead pipeline
          </p>
        </div>
      </MotionWrapper>

      {/* Visitor Analytics */}
      <VisitorAnalytics days={30} />

      {/* Leads Table */}
      <LeadsTable />
    </div>
    </AuthGuard>
  )
}
