/**
 * GST Validation Utilities
 * Validates GSTIN, PAN, HSN/SAC codes
 */

import { GST_STATE_CODES } from './state-codes'

/**
 * Validate GSTIN format
 * Format: 2 digits (state) + 10 chars (PAN) + 1 char (entity) + 1 char (Z) + 1 check digit
 * Example: 29CGRPB3179A1ZD
 */
export function validateGSTIN(gstin: string): {
  isValid: boolean
  error?: string
  stateCode?: string
  pan?: string
} {
  if (!gstin) {
    return { isValid: false, error: 'GSTIN is required' }
  }
  
  // Remove spaces and convert to uppercase
  const cleanGSTIN = gstin.trim().toUpperCase()
  
  // Check length
  if (cleanGSTIN.length !== 15) {
    return { isValid: false, error: 'GSTIN must be 15 characters' }
  }
  
  // Check format: 2 digits + 10 alphanumeric + 1 alpha + Z + 1 alphanumeric
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  
  if (!gstinRegex.test(cleanGSTIN)) {
    return { isValid: false, error: 'Invalid GSTIN format' }
  }
  
  // Extract and validate state code
  const stateCode = cleanGSTIN.substring(0, 2)
  if (!GST_STATE_CODES[stateCode as keyof typeof GST_STATE_CODES]) {
    return { isValid: false, error: 'Invalid state code in GSTIN' }
  }
  
  // Extract PAN
  const pan = cleanGSTIN.substring(2, 12)
  
  // Validate PAN format within GSTIN
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panRegex.test(pan)) {
    return { isValid: false, error: 'Invalid PAN in GSTIN' }
  }
  
  return {
    isValid: true,
    stateCode,
    pan
  }
}

/**
 * Extract state code from GSTIN
 */
export function extractStateCode(gstin: string): string | null {
  if (!gstin || gstin.length < 2) return null
  return gstin.substring(0, 2)
}

/**
 * Extract PAN from GSTIN
 */
export function extractPAN(gstin: string): string | null {
  if (!gstin || gstin.length < 12) return null
  return gstin.substring(2, 12)
}

/**
 * Get state name from GSTIN
 */
export function getStateFromGSTIN(gstin: string): string | null {
  const stateCode = extractStateCode(gstin)
  if (!stateCode) return null
  return GST_STATE_CODES[stateCode as keyof typeof GST_STATE_CODES] || null
}

/**
 * Validate PAN format
 * Format: 5 letters + 4 digits + 1 letter
 * Example: CGRPB3179A
 */
export function validatePAN(pan: string): {
  isValid: boolean
  error?: string
} {
  if (!pan) {
    return { isValid: false, error: 'PAN is required' }
  }
  
  const cleanPAN = pan.trim().toUpperCase()
  
  if (cleanPAN.length !== 10) {
    return { isValid: false, error: 'PAN must be 10 characters' }
  }
  
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  
  if (!panRegex.test(cleanPAN)) {
    return { isValid: false, error: 'Invalid PAN format' }
  }
  
  return { isValid: true }
}

/**
 * Validate HSN code format
 * HSN codes are 4, 6, or 8 digits
 */
export function validateHSNCode(code: string): {
  isValid: boolean
  error?: string
} {
  if (!code) {
    return { isValid: false, error: 'HSN code is required' }
  }
  
  const cleanCode = code.trim()
  
  // HSN codes are numeric and can be 4, 6, or 8 digits
  const hsnRegex = /^[0-9]{4}([0-9]{2})?([0-9]{2})?$/
  
  if (!hsnRegex.test(cleanCode)) {
    return { isValid: false, error: 'Invalid HSN code format (must be 4, 6, or 8 digits)' }
  }
  
  return { isValid: true }
}

/**
 * Validate SAC code format
 * SAC codes are 6 digits
 */
export function validateSACCode(code: string): {
  isValid: boolean
  error?: string
} {
  if (!code) {
    return { isValid: false, error: 'SAC code is required' }
  }
  
  const cleanCode = code.trim()
  
  // SAC codes are 6 digits
  const sacRegex = /^[0-9]{6}$/
  
  if (!sacRegex.test(cleanCode)) {
    return { isValid: false, error: 'Invalid SAC code format (must be 6 digits)' }
  }
  
  return { isValid: true }
}

/**
 * Validate HSN or SAC code (auto-detect)
 */
export function validateHSNOrSAC(code: string): {
  isValid: boolean
  type?: 'HSN' | 'SAC'
  error?: string
} {
  if (!code) {
    return { isValid: false, error: 'HSN/SAC code is required' }
  }
  
  const cleanCode = code.trim()
  
  // Try SAC first (6 digits)
  if (/^[0-9]{6}$/.test(cleanCode)) {
    return { isValid: true, type: 'SAC' }
  }
  
  // Try HSN (4, 6, or 8 digits)
  if (/^[0-9]{4}([0-9]{2})?([0-9]{2})?$/.test(cleanCode)) {
    return { isValid: true, type: 'HSN' }
  }
  
  return { isValid: false, error: 'Invalid HSN/SAC code format' }
}

/**
 * Validate GST rate
 * Valid rates: 0, 0.25, 3, 5, 12, 18, 28
 */
export function validateGSTRate(rate: number): {
  isValid: boolean
  error?: string
} {
  const validRates = [0, 0.25, 3, 5, 12, 18, 28]
  
  if (!validRates.includes(rate)) {
    return {
      isValid: false,
      error: `Invalid GST rate. Valid rates are: ${validRates.join(', ')}%`
    }
  }
  
  return { isValid: true }
}

/**
 * Validate state code
 */
export function validateStateCode(stateCode: string): {
  isValid: boolean
  stateName?: string
  error?: string
} {
  if (!stateCode) {
    return { isValid: false, error: 'State code is required' }
  }
  
  const cleanCode = stateCode.trim()
  
  if (cleanCode.length !== 2) {
    return { isValid: false, error: 'State code must be 2 digits' }
  }
  
  const stateName = GST_STATE_CODES[cleanCode as keyof typeof GST_STATE_CODES]
  
  if (!stateName) {
    return { isValid: false, error: 'Invalid state code' }
  }
  
  return { isValid: true, stateName }
}

/**
 * Validate invoice number format
 * Recommended format: PREFIX/YYYY-YY/SEQUENTIAL
 * Example: INV/2025-26/001
 */
export function validateInvoiceNumber(invoiceNumber: string): {
  isValid: boolean
  error?: string
} {
  if (!invoiceNumber) {
    return { isValid: false, error: 'Invoice number is required' }
  }
  
  const cleanNumber = invoiceNumber.trim()
  
  if (cleanNumber.length < 3) {
    return { isValid: false, error: 'Invoice number too short' }
  }
  
  // Check for special characters that might cause issues
  const invalidChars = /[<>:"\\|?*]/
  if (invalidChars.test(cleanNumber)) {
    return { isValid: false, error: 'Invoice number contains invalid characters' }
  }
  
  return { isValid: true }
}

/**
 * Validate IRN (Invoice Reference Number) format
 * IRN is 64 characters alphanumeric
 */
export function validateIRN(irn: string): {
  isValid: boolean
  error?: string
} {
  if (!irn) {
    return { isValid: false, error: 'IRN is required' }
  }
  
  const cleanIRN = irn.trim()
  
  if (cleanIRN.length !== 64) {
    return { isValid: false, error: 'IRN must be 64 characters' }
  }
  
  const irnRegex = /^[A-Za-z0-9]{64}$/
  
  if (!irnRegex.test(cleanIRN)) {
    return { isValid: false, error: 'Invalid IRN format' }
  }
  
  return { isValid: true }
}

/**
 * Check if GSTIN belongs to a specific state
 */
export function isGSTINFromState(gstin: string, stateCode: string): boolean {
  const gstinStateCode = extractStateCode(gstin)
  return gstinStateCode === stateCode
}

/**
 * Format GSTIN for display (with spaces for readability)
 * Example: 29CGRPB3179A1ZD → 29 CGRPB3179A 1Z D
 */
export function formatGSTINForDisplay(gstin: string): string {
  if (!gstin || gstin.length !== 15) return gstin
  
  return `${gstin.substring(0, 2)} ${gstin.substring(2, 12)} ${gstin.substring(12, 14)} ${gstin.substring(14)}`
}

/**
 * Mask GSTIN for privacy (show only last 4 characters)
 * Example: 29CGRPB3179A1ZD → ***********A1ZD
 */
export function maskGSTIN(gstin: string): string {
  if (!gstin || gstin.length !== 15) return gstin
  
  return '*'.repeat(11) + gstin.substring(11)
}
