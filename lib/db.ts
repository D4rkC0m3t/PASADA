/**
 * Database Client Configuration
 * Centralized Supabase client for all database operations
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[DB] Supabase credentials not found. Database features will be disabled.')
}

/**
 * Supabase client instance
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Database query helpers
 */
export const db = {
  // Clients
  clients: {
    async getAll() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    async create(client: any) {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async archive(id: string) {
      return this.update(id, { archived: true })
    }
  },

  // Projects
  projects: {
    async getAll() {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    async create(project: any) {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async archive(id: string) {
      return this.update(id, { archived: true })
    }
  },

  // Materials
  materials: {
    async getAll() {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    async create(material: any) {
      const { data, error } = await supabase
        .from('materials')
        .insert(material)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async archive(id: string) {
      return this.update(id, { archived: true })
    }
  },

  // Quotations
  quotations: {
    async getAll() {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, projects(*), clients(*)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, projects(*), clients(*), items:quotation_items(*)')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    async create(quotation: any) {
      const { data, error } = await supabase
        .from('quotations')
        .insert(quotation)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}

/**
 * Type-safe database types (extend as needed)
 */
export type Client = {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  client_id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  budget?: number
  start_date?: string
  end_date?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export type Material = {
  id: string
  name: string
  description?: string
  category: string
  price: number
  unit: string
  supplier?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export type Quotation = {
  id: string
  project_id: string
  client_id: string
  total_amount: number
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  valid_until?: string
  created_at: string
  updated_at: string
}
