/**
 * PASADA CRM - Database Types
 * 
 * Auto-generated types from Supabase schema
 * Regenerate with: npx supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          contact_name: string
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          zip_code: string | null
          type: 'residential' | 'commercial' | 'retail' | 'hospitality' | 'other' | null
          status: 'active' | 'inactive' | 'archived'
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          contact_name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          zip_code?: string | null
          type?: 'residential' | 'commercial' | 'retail' | 'hospitality' | 'other' | null
          status?: 'active' | 'inactive' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          zip_code?: string | null
          type?: 'residential' | 'commercial' | 'retail' | 'hospitality' | 'other' | null
          status?: 'active' | 'inactive' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          site_location: string | null
          type: 'kitchen' | 'bedroom' | 'living_room' | 'office' | 'full_home' | 'commercial' | 'other' | null
          area_sqft: number | null
          status: 'planning' | 'design' | 'quotation' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          budget: number | null
          actual_cost: number | null
          start_date: string | null
          end_date: string | null
          completion_date: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          site_location?: string | null
          type?: 'kitchen' | 'bedroom' | 'living_room' | 'office' | 'full_home' | 'commercial' | 'other' | null
          area_sqft?: number | null
          status?: 'planning' | 'design' | 'quotation' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          budget?: number | null
          actual_cost?: number | null
          start_date?: string | null
          end_date?: string | null
          completion_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          site_location?: string | null
          type?: 'kitchen' | 'bedroom' | 'living_room' | 'office' | 'full_home' | 'commercial' | 'other' | null
          area_sqft?: number | null
          status?: 'planning' | 'design' | 'quotation' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          budget?: number | null
          actual_cost?: number | null
          start_date?: string | null
          end_date?: string | null
          completion_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      quotations: {
        Row: {
          id: string
          quotation_number: string
          project_id: string
          title: string
          description: string | null
          subtotal: number
          tax_percent: number
          tax_amount: number
          discount_percent: number
          discount_amount: number
          total_amount: number
          status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'revised' | 'expired'
          version: number
          valid_until: string | null
          notes: string | null
          terms_and_conditions: string | null
          payment_terms: string | null
          pdf_url: string | null
          sent_at: string | null
          viewed_at: string | null
          approved_at: string | null
          rejected_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          quotation_number?: string
          project_id: string
          title: string
          description?: string | null
          subtotal?: number
          tax_percent?: number
          tax_amount?: number
          discount_percent?: number
          discount_amount?: number
          total_amount?: number
          status?: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'revised' | 'expired'
          version?: number
          valid_until?: string | null
          notes?: string | null
          terms_and_conditions?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          viewed_at?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          quotation_number?: string
          project_id?: string
          title?: string
          description?: string | null
          subtotal?: number
          tax_percent?: number
          tax_amount?: number
          discount_percent?: number
          discount_amount?: number
          total_amount?: number
          status?: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'revised' | 'expired'
          version?: number
          valid_until?: string | null
          notes?: string | null
          terms_and_conditions?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          viewed_at?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      quote_items: {
        Row: {
          id: string
          quotation_id: string
          item_number: number
          category: string | null
          description: string
          specifications: string | null
          quantity: number
          unit: string
          unit_price: number
          tax_percent: number
          discount_percent: number
          subtotal: number
          discount_amount: number
          tax_amount: number
          total: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quotation_id: string
          item_number: number
          category?: string | null
          description: string
          specifications?: string | null
          quantity?: number
          unit?: string
          unit_price: number
          tax_percent?: number
          discount_percent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quotation_id?: string
          item_number?: number
          category?: string | null
          description?: string
          specifications?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
          tax_percent?: number
          discount_percent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          sku: string | null
          name: string
          description: string | null
          category: string
          subcategory: string | null
          unit: string
          unit_price: number
          cost_price: number | null
          tax_percent: number
          stock_quantity: number
          min_stock_level: number
          supplier_name: string | null
          supplier_contact: string | null
          lead_time_days: number | null
          image_url: string | null
          specifications: Json | null
          status: 'active' | 'inactive' | 'discontinued'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku?: string | null
          name: string
          description?: string | null
          category: string
          subcategory?: string | null
          unit?: string
          unit_price: number
          cost_price?: number | null
          tax_percent?: number
          stock_quantity?: number
          min_stock_level?: number
          supplier_name?: string | null
          supplier_contact?: string | null
          lead_time_days?: number | null
          image_url?: string | null
          specifications?: Json | null
          status?: 'active' | 'inactive' | 'discontinued'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string | null
          name?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          unit?: string
          unit_price?: number
          cost_price?: number | null
          tax_percent?: number
          stock_quantity?: number
          min_stock_level?: number
          supplier_name?: string | null
          supplier_contact?: string | null
          lead_time_days?: number | null
          image_url?: string | null
          specifications?: Json | null
          status?: 'active' | 'inactive' | 'discontinued'
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          zip_code: string | null
          category: string | null
          rating: number | null
          payment_terms: string | null
          notes: string | null
          status: 'active' | 'inactive' | 'blacklisted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          zip_code?: string | null
          category?: string | null
          rating?: number | null
          payment_terms?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'blacklisted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          zip_code?: string | null
          category?: string | null
          rating?: number | null
          payment_terms?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'blacklisted'
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          type: 'quotation' | 'invoice' | 'email' | 'other' | null
          header_logo: string | null
          header_text: string | null
          footer_text: string | null
          terms_and_conditions: string | null
          payment_terms: string | null
          styles: Json | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: 'quotation' | 'invoice' | 'email' | 'other' | null
          header_logo?: string | null
          header_text?: string | null
          footer_text?: string | null
          terms_and_conditions?: string | null
          payment_terms?: string | null
          styles?: Json | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'quotation' | 'invoice' | 'email' | 'other' | null
          header_logo?: string | null
          header_text?: string | null
          footer_text?: string | null
          terms_and_conditions?: string | null
          payment_terms?: string | null
          styles?: Json | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string | null
          project_id: string | null
          title: string
          description: string | null
          booking_type: 'consultation' | 'site_visit' | 'design_review' | 'measurement' | 'installation' | 'other' | null
          scheduled_date: string
          scheduled_time: string
          duration_minutes: number
          location: string | null
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          reminder_sent: boolean
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          project_id?: string | null
          title: string
          description?: string | null
          booking_type?: 'consultation' | 'site_visit' | 'design_review' | 'measurement' | 'installation' | 'other' | null
          scheduled_date: string
          scheduled_time: string
          duration_minutes?: number
          location?: string | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          reminder_sent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          project_id?: string | null
          title?: string
          description?: string | null
          booking_type?: 'consultation' | 'site_visit' | 'design_review' | 'measurement' | 'installation' | 'other' | null
          scheduled_date?: string
          scheduled_time?: string
          duration_minutes?: number
          location?: string | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          reminder_sent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'staff' | 'client'
          phone: string | null
          avatar_url: string | null
          department: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'admin' | 'staff' | 'client'
          phone?: string | null
          avatar_url?: string | null
          department?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'staff' | 'client'
          phone?: string | null
          avatar_url?: string | null
          department?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_client: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_quotation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
