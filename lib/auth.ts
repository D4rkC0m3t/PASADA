/**
 * Authentication & Session Management
 * Handles session validation, user authentication, and route protection
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Session types
export interface Session {
  user: {
    id: string
    email: string
    role: 'admin' | 'client'
    name?: string
  }
  expiresAt: number
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('pasada_session')
    
    if (!sessionCookie?.value) {
      return null
    }

    // Parse and validate session
    const session: Session = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      return null
    }

    return session
  } catch (error) {
    console.error('[AUTH] Session retrieval error:', error)
    return null
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(allowedRoles?: Array<'admin' | 'client'>): Promise<Session> {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect('/') // Redirect to home if unauthorized role
  }

  return session
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin(): Promise<Session> {
  return requireAuth(['admin'])
}

/**
 * Require client role - redirect if not client
 */
export async function requireClient(): Promise<Session> {
  return requireAuth(['client'])
}

/**
 * Create session cookie
 */
export async function createSession(user: Session['user'], expiresInHours: number = 24): Promise<void> {
  const session: Session = {
    user,
    expiresAt: Date.now() + (expiresInHours * 60 * 60 * 1000)
  }

  const cookieStore = await cookies()
  cookieStore.set('pasada_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresInHours * 60 * 60,
    path: '/'
  })
}

/**
 * Destroy session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('pasada_session')
}

/**
 * Check if user has permission for specific action
 */
export function hasPermission(session: Session | null, permission: string): boolean {
  if (!session) return false
  
  // Admin has all permissions
  if (session.user.role === 'admin') return true
  
  // Define client permissions
  const clientPermissions = [
    'view_own_projects',
    'view_own_quotations',
    'comment_on_projects',
    'approve_quotations'
  ]
  
  return session.user.role === 'client' && clientPermissions.includes(permission)
}

/**
 * Audit log helper
 */
export function logAction(action: string, details: Record<string, any>): void {
  const timestamp = new Date().toISOString()
  console.log(`[AUDIT ${timestamp}] ${action}`, {
    ...details,
    timestamp
  })
  
  // TODO: Store in database for compliance
  // await db.auditLogs.create({ action, details, timestamp })
}
