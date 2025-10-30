'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, MapPin } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  type: 'residential' | 'commercial'
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'residential' | 'commercial'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 20
  const supabase = createBrowserClient()
  
  useEffect(() => {
    fetchClients()
  }, [currentPage, searchTerm, filterType])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      
      // Build query with filters
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
      
      // Apply search filter (server-side)
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }
      
      // Apply type filter
      if (filterType !== 'all') {
        query = query.eq('type', filterType)
      }
      
      // Apply pagination and sorting
      const { data, error, count } = await query
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page on search
  }
  
  const handleFilterChange = (value: 'all' | 'residential' | 'commercial') => {
    setFilterType(value)
    setCurrentPage(1) // Reset to first page on filter
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-zinc-400">Manage your client database</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg shadow-yellow-900/30"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600 transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value as any)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-600 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-6 text-sm text-zinc-400">
          Showing {clients.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE + 1) : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} clients
        </div>
      )}

      {/* Client Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-zinc-400 text-lg">Loading clients...</div>
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-yellow-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No clients found</h3>
          <p className="text-zinc-400 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first client'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <Link
              href="/admin/clients/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Client</span>
            </Link>
          )}
        </div>
      ) : (
        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
              <div 
                key={client.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-yellow-600/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      client.type === 'residential'
                        ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20'
                        : 'bg-purple-600/10 text-purple-600 border border-purple-600/20'
                    }`}>
                      {client.type}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-yellow-600 hover:text-white transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/clients/${client.id}/edit`}
                      className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {client.contact_name && (
                    <div className="flex items-center text-zinc-400 text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {client.contact_name}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center text-zinc-400 text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      {client.email}
                    </div>
                  )}
                  {client.city && (
                    <div className="flex items-center text-zinc-400 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {client.city}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? 'bg-yellow-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}
    </div>
  )
}
