/**
 * Form Validation & Data Sanitization
 * Provides type-safe validators for all CRM forms
 */

import { z } from 'zod'

/**
 * Client validation schema
 */
export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
})

export type ClientInput = z.infer<typeof clientSchema>

/**
 * Project validation schema
 */
export const projectSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  name: z.string().min(3, 'Project name must be at least 3 characters').max(200),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  budget: z.number().positive('Budget must be positive').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
})

export type ProjectInput = z.infer<typeof projectSchema>

/**
 * Material validation schema
 */
export const materialSchema = z.object({
  name: z.string().min(2, 'Material name must be at least 2 characters').max(100),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  supplier: z.string().optional(),
  sku: z.string().optional()
})

export type MaterialInput = z.infer<typeof materialSchema>

/**
 * Quotation validation schema
 */
export const quotationSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  client_id: z.string().uuid('Invalid client ID'),
  items: z.array(z.object({
    material_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    discount: z.number().min(0).max(100).optional()
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  valid_until: z.string().optional()
})

export type QuotationInput = z.infer<typeof quotationSchema>

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type SignupInput = z.infer<typeof signupSchema>

/**
 * Validate data against schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { _general: 'Validation failed' } }
  }
}

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Audit trail helper
 */
export function createAuditLog(action: string, userId: string, details: Record<string, any>) {
  return {
    action,
    user_id: userId,
    details,
    timestamp: new Date().toISOString(),
    ip_address: 'TODO', // Get from request
    user_agent: 'TODO'  // Get from request
  }
}
