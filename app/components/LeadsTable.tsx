"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Calendar, Download, Search } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service_type: string | null;
  project_type: string | null;
  budget_range: string | null;
  message: string | null;
  status: string;
  priority: string;
  submitted_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  qualified: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  converted: 'bg-green-500/10 text-green-400 border-green-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
};

export const LeadsTable = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    try {
      const supabase = createBrowserClient();
      
      let query = supabase
        .from('leads')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const filteredLeads = leads.filter(lead =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const csvHeaders = ['Name', 'Email', 'Phone', 'Service', 'Project Type', 'Budget', 'Status', 'Priority', 'Submitted'];
    const csvRows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.service_type || '',
      lead.project_type || '',
      lead.budget_range || '',
      lead.status,
      lead.priority,
      format(new Date(lead.submitted_at), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pasada-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchQuery))
  );

  if (loading) {
    return (
      <div className="bg-pasada-950 rounded-2xl p-6 border border-pasada-800 flex items-center justify-center h-64">
        <div className="text-pasada-300">Loading leads...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
      className="glassmorphism-card p-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#fff8f1] tracking-wide">Lead Management</h3>
          <p className="text-sm text-[#b3b3b3] mt-1">{filteredLeads.length} leads found</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-2 bg-pasada-900 border border-pasada-700 rounded-lg text-sm text-[#fff8f1] placeholder-pasada-400 focus:outline-none focus:border-gold-500/50"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-pasada-900 border border-pasada-700 rounded-lg text-sm text-[#fff8f1] focus:outline-none focus:border-gold-500/50"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          {/* Export */}
          <motion.button
            onClick={handleExportCSV}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button px-4 py-2 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-pasada-800">
              <th className="text-left py-3 px-4 text-xs font-semibold text-pasada-300 uppercase">Lead</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-pasada-300 uppercase">Contact</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-pasada-300 uppercase">Service</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-pasada-300 uppercase">Budget</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-pasada-300 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-pasada-300 uppercase">Priority</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-pasada-300 uppercase">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <motion.tr 
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "rgba(212, 165, 116, 0.05)" }}
                className="border-b border-pasada-800 transition-colors cursor-pointer"
              >
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-[#fff8f1]">{lead.name}</div>
                    {lead.message && (
                      <div className="text-xs text-pasada-300 mt-1 line-clamp-1">{lead.message}</div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-pasada-200">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-pasada-200">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="text-sm text-pasada-200">{lead.service_type || '-'}</div>
                    {lead.project_type && (
                      <div className="text-xs text-pasada-400 mt-1">{lead.project_type}</div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-pasada-200">{lead.budget_range || '-'}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${statusColors[lead.status] || statusColors.new}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${priorityColors[lead.priority] || priorityColors.medium}`}>
                    {lead.priority}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-sm text-pasada-300">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(lead.submitted_at), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-pasada-400 mt-1">
                    {format(new Date(lead.submitted_at), 'HH:mm')}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-pasada-300">
            No leads found matching your criteria
          </div>
        )}
      </div>
    </motion.div>
  );
};
