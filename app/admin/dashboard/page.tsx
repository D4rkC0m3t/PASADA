'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  Folder, 
  FileText, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import '@/app/styles/dashboard-theme.css';

// Admin stat card
const AdminStatCard = ({ icon: Icon, title, value, change, color }: { 
  icon: any; 
  title: string; 
  value: string; 
  change: string; 
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="glass-stat-card p-6"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="stat-label text-sm mb-1">{title}</p>
        <h3 className="stat-value text-3xl font-bold mb-2">{value}</h3>
        <p className={`text-${color}-400 text-xs flex items-center gap-1`}>
          <TrendingUp className="w-3 h-3" />
          {change}
        </p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/10`}>
        <Icon className={`text-${color}-400 w-6 h-6`} />
      </div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Admin</h2>
              <p className="text-gray-400">Here's what's happening with your business today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AdminStatCard
                icon={Users}
                title="Total Clients"
                value="156"
                change="+12% this month"
                color="blue"
              />
              <AdminStatCard
                icon={Folder}
                title="Active Projects"
                value="23"
                change="+5 new projects"
                color="green"
              />
              <AdminStatCard
                icon={FileText}
                title="Pending Quotes"
                value="8"
                change="2 sent today"
                color="yellow"
              />
              <AdminStatCard
                icon={DollarSign}
                title="Monthly Revenue"
                value="₹12.5L"
                change="+18% vs last month"
                color="purple"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glassmorphic-card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-400" />
                  Recent Projects
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Kitchen Renovation - Sharma Residence', status: 'In Progress', color: 'blue' },
                    { name: 'Living Room Design - Patel Villa', status: 'Planning', color: 'yellow' },
                    { name: 'Office Interior - Tech Startup', status: 'Completed', color: 'green' },
                  ].map((project, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-white text-sm font-medium">{project.name}</p>
                        <p className={`text-${project.color}-400 text-xs mt-1`}>{project.status}</p>
                      </div>
                      <CheckCircle className={`w-5 h-5 text-${project.color}-400`} />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pending Quotations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glassmorphic-card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold-400" />
                  Pending Quotations
                </h3>
                <div className="space-y-3">
                  {[
                    { client: 'Mr. Rajesh Kumar', amount: '₹4.2L', date: '2 hours ago' },
                    { client: 'Ms. Priya Singh', amount: '₹2.8L', date: '1 day ago' },
                    { client: 'ABC Enterprises', amount: '₹9.5L', date: '3 days ago' },
                  ].map((quote, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-white text-sm font-medium">{quote.client}</p>
                        <p className="text-gray-400 text-xs mt-1">{quote.date}</p>
                      </div>
                      <p className="text-gold-400 font-semibold">{quote.amount}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 glassmorphic-card p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/admin/clients/new"
                  className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  <Users className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-white font-medium">Add New Client</p>
                </Link>
                <Link
                  href="/admin/projects/new"
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                >
                  <Folder className="w-6 h-6 text-green-400 mb-2" />
                  <p className="text-white font-medium">Create Project</p>
                </Link>
                <Link
                  href="/admin/quotations/new"
                  className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                >
                  <FileText className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="text-white font-medium">Generate Quote</p>
                </Link>
              </div>
            </motion.div>
          </motion.div>
    </div>
  );
}

