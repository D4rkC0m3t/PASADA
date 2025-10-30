/**
 * PASADA CRM - Supabase Client Configuration (CLIENT-SIDE ONLY)
 * 
 * This file provides Supabase client for browser/client components only.
 * For server-side clients, use @/lib/supabase/server
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

// ================================================
// ENVIRONMENT VALIDATION
// ================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ================================================
// BROWSER CLIENT (Client Components)
// ================================================

/**
 * Use this in client components (components with 'use client' directive)
 * Automatically handles authentication state
 */
export const createBrowserClient = () => {
  return createClientComponentClient<Database>();
};

// ================================================
// STORAGE HELPERS (CLIENT-SIDE)
// ================================================

export const getPublicUrl = (bucket: string, path: string) => {
  if (!supabaseUrl) return '';
  
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  }
) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  return data;
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (bucket: string, path: string) => {
  const supabase = createBrowserClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }

  return true;
};

// ================================================
// REALTIME HELPERS
// ================================================

/**
 * Subscribe to table changes
 */
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const supabase = createBrowserClient();

  let channel = supabase.channel(`public:${table}`);

  if (filter) {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      callback
    );
  } else {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
      },
      callback
    );
  }

  return channel.subscribe();
};

/**
 * Unsubscribe from realtime channel
 */
export const unsubscribe = async (channel: any) => {
  await channel.unsubscribe();
};

// ================================================
// ERROR HANDLING
// ================================================

export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);

  // Common error messages
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'User already registered': 'This email is already registered',
    'Email not confirmed': 'Please confirm your email address',
    'Invalid token': 'Your session has expired. Please login again.',
  };

  return errorMessages[error.message] || error.message || 'An error occurred';
};

// ================================================
// TYPE EXPORTS
// ================================================

export type { Database } from './database.types';
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
