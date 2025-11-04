'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import AuthGuard from '@/components/AuthGuard'

interface ClientLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export const ClientLayout = ({ children, title, subtitle }: ClientLayoutProps) => {
  return (
    <AuthGuard requiredRole="client">
      <div className="flex h-screen bg-[#050d14]">
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
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              {subtitle && <p className="text-blue-300">{subtitle}</p>}
            </motion.div>
            
            {children}
          </div>
        </motion.main>
      </div>
    </AuthGuard>
  )
}
