/**
 * Security Utilities & Configurations
 * Centralized security helpers for PASADA CRM
 */

import { headers } from 'next/headers'

/**
 * Security headers configuration for next.config.js
 */
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' cdn.prod.website-files.com fonts.googleapis.com",
      "img-src 'self' data: blob: https: cdn.prod.website-files.com",
      "font-src 'self' data: fonts.gstatic.com cdn.prod.website-files.com",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
]

/**
 * Get client IP address from request headers
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  
  // Try various headers that might contain the real IP
  const ip = 
    headersList.get('x-real-ip') ||
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('cf-connecting-ip') || // Cloudflare
    headersList.get('x-vercel-forwarded-for') || // Vercel
    'unknown'
  
  return ip
}

/**
 * Get client user agent
 */
export async function getClientUserAgent(): Promise<string> {
  const headersList = await headers()
  return headersList.get('user-agent') || 'unknown'
}

/**
 * Validate session against IP and User Agent (anti-hijacking)
 */
export function validateSessionFingerprint(
  sessionIp: string,
  sessionUserAgent: string,
  currentIp: string,
  currentUserAgent: string
): boolean {
  // Allow some flexibility for IP changes (mobile networks)
  // But require exact User-Agent match
  const ipMatch = sessionIp === currentIp
  const uaMatch = sessionUserAgent === currentUserAgent
  
  // If IP changed but UA matches, allow (user on VPN or mobile)
  // If both changed, likely session hijacking
  if (!ipMatch && !uaMatch) {
    console.warn('[SECURITY] Possible session hijacking detected', {
      sessionIp,
      currentIp,
      sessionUserAgent: sessionUserAgent.substring(0, 50),
      currentUserAgent: currentUserAgent.substring(0, 50)
    })
    return false
  }
  
  return true
}

/**
 * Rate limiting types
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Simple in-memory rate limiter (use Redis in production)
 */
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  
  async check(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const record = this.requests.get(identifier)
    
    // Clean up old records
    if (record && now > record.resetTime) {
      this.requests.delete(identifier)
    }
    
    const current = this.requests.get(identifier)
    
    if (!current) {
      // First request
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs
      }
    }
    
    if (current.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit,
        remaining: 0,
        reset: current.resetTime
      }
    }
    
    // Increment count
    current.count++
    
    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetTime
    }
  }
}

// Singleton instance
export const rateLimiter = new InMemoryRateLimiter()

/**
 * Rate limit presets
 */
export const RATE_LIMITS = {
  // Authentication
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 signups per hour
  
  // API endpoints
  API_READ: { limit: 100, windowMs: 60 * 1000 }, // 100 reads per minute
  API_WRITE: { limit: 30, windowMs: 60 * 1000 }, // 30 writes per minute
  
  // Forms
  CONTACT_FORM: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 submissions per hour
  QUOTATION: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 quotations per hour
}

/**
 * Encrypt sensitive data (use for PII)
 */
export async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment variables')
  }
  
  // In production, use proper AES-256-GCM encryption
  // This is a placeholder - implement with crypto module
  const encrypted = Buffer.from(dataBuffer).toString('base64')
  return encrypted
}

/**
 * Decrypt sensitive data
 */
export async function decryptData(encryptedData: string): Promise<string> {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment variables')
  }
  
  // In production, use proper AES-256-GCM decryption
  // This is a placeholder - implement with crypto module
  const decrypted = Buffer.from(encryptedData, 'base64').toString('utf-8')
  return decrypted
}

/**
 * Verify webhook signature (for payment webhooks)
 * TODO: Implement actual HMAC-SHA256 verification when payment gateway is integrated
 */
export function verifyWebhookSignature(
  _payload: string,
  _signature: string,
  _secret: string
): boolean {
  // Implement HMAC-SHA256 verification
  // Example for Stripe:
  // const crypto = require('crypto')
  // const hmac = crypto.createHmac('sha256', secret)
  // const digest = hmac.update(payload).digest('hex')
  // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
  
  console.warn('[SECURITY] Webhook signature verification not implemented - placeholder')
  return false
}

/**
 * Detect suspicious activity patterns
 */
export interface SuspiciousActivityCheck {
  isSuspicious: boolean
  reasons: string[]
}

export function detectSuspiciousActivity(params: {
  userId?: string
  ip: string
  action: string
  metadata?: Record<string, any>
}): SuspiciousActivityCheck {
  const reasons: string[] = []
  
  // Check for multiple failed logins
  // Check for unusual payment amounts
  // Check for location changes
  // Check for rapid API calls
  
  // Placeholder logic
  if (params.action === 'login_failed') {
    // TODO: Check failed login count in last hour
  }
  
  if (params.action === 'payment') {
    // TODO: Check for unusual amounts or patterns
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  }
}

/**
 * Sanitize file upload
 */
export function validateFileUpload(file: File): {
  valid: boolean
  error?: string
} {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  // Additional checks: filename sanitization, virus scanning, etc.
  
  return { valid: true }
}
