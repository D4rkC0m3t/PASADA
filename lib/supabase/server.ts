/**
 * PASADA CRM - Supabase Server Configuration (SERVER-SIDE ONLY)
 * 
 * This file provides Supabase clients for server components, server actions, and admin operations.
 * For client-side, use @/lib/supabase/client
 */

import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './database.types';

// ================================================
// ENVIRONMENT VALIDATION
// ================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ================================================
// SERVER CLIENT (Server Components)
// ================================================

/**
 * Use this in server components (default in app directory)
 * Requires cookies for authentication
 */
export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// ================================================
// SERVER ACTION CLIENT (Server Actions & Route Handlers)
// ================================================

/**
 * Use this in server actions and API route handlers
 * Handles cookie-based authentication for mutations
 */
export const createActionClient = () => {
  const cookieStore = cookies();
  return createServerActionClient<Database>({ cookies: () => cookieStore });
};

// ================================================
// ADMIN CLIENT (Privileged Operations)
// ================================================

/**
 * Use this ONLY for admin operations that bypass RLS
 * WARNING: This client has full database access
 * Only use in secure server-side contexts
 */
export const createAdminClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'Service role key not found. Admin operations require SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// ================================================
// STORAGE HELPERS (SERVER-SIDE)
// ================================================

export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
) => {
  const supabase = createServerClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
};

// ================================================
// USER HELPERS (SERVER-SIDE)
// ================================================

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const supabase = createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
};

/**
 * Get user profile (including role)
 */
export const getUserProfile = async (userId?: string) => {
  const supabase = createServerClient();
  const uid = userId || (await getCurrentUser())?.id;

  if (!uid) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }

  return data;
};

/**
 * Check if user has specific role
 */
export const hasRole = async (role: 'admin' | 'staff' | 'client') => {
  const profile = await getUserProfile();
  return profile?.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = async () => {
  return await hasRole('admin');
};

/**
 * Check if user is staff (admin or staff role)
 */
export const isStaff = async () => {
  const profile = await getUserProfile();
  return profile?.role === 'admin' || profile?.role === 'staff';
};

// ================================================
// TYPE EXPORTS
// ================================================

export type { Database } from './database.types';
