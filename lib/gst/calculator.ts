/**
 * GST Calculator Utilities
 * Handles all GST calculations for PASADA CRM
 */

export interface GSTCalculation {
  subtotal: number
  gstRate: number
  gstAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalWithGST: number
  isIntraState: boolean
}

export interface LineItemGST {
  itemAmount: number
  taxRate: number
  taxableValue: number
  gstAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
}

/**
 * Round amount to 2 decimal places (GST requirement)
 */
export function roundGSTAmount(amount: number): number {
  return Math.round(amount * 100) / 100
}

/**
 * Calculate basic GST amount
 */
export function calculateGST(amount: number, rate: number): number {
  const gstAmount = (amount * rate) / 100
  return roundGSTAmount(gstAmount)
}

/**
 * Determine if transaction is intra-state (same state) or inter-state
 */
export function isIntraStateTransaction(
  sellerStateCode: string,
  buyerStateCode: string
): boolean {
  return sellerStateCode === buyerStateCode
}

/**
 * Calculate CGST and SGST for intra-state transactions
 */
export function calculateIntraStateGST(
  amount: number,
  rate: number
): { cgst: number; sgst: number; total: number } {
  const totalGST = calculateGST(amount, rate)
  const halfGST = totalGST / 2
  
  return {
    cgst: roundGSTAmount(halfGST),
    sgst: roundGSTAmount(halfGST),
    total: roundGSTAmount(totalGST)
  }
}

/**
 * Calculate IGST for inter-state transactions
 */
export function calculateInterStateGST(
  amount: number,
  rate: number
): { igst: number; total: number } {
  const igst = calculateGST(amount, rate)
  
  return {
    igst: roundGSTAmount(igst),
    total: roundGSTAmount(igst)
  }
}

/**
 * Calculate complete GST breakdown for a quotation
 */
export function calculateQuotationGST(
  subtotal: number,
  gstRate: number,
  sellerStateCode: string,
  buyerStateCode: string,
  discount: number = 0
): GSTCalculation {
  // Apply discount first
  const discountedAmount = subtotal - discount
  const isIntraState = isIntraStateTransaction(sellerStateCode, buyerStateCode)
  
  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0
  let gstAmount = 0
  
  if (isIntraState) {
    const intraGST = calculateIntraStateGST(discountedAmount, gstRate)
    cgstAmount = intraGST.cgst
    sgstAmount = intraGST.sgst
    gstAmount = intraGST.total
  } else {
    const interGST = calculateInterStateGST(discountedAmount, gstRate)
    igstAmount = interGST.igst
    gstAmount = interGST.total
  }
  
  const totalWithGST = roundGSTAmount(discountedAmount + gstAmount)
  
  return {
    subtotal: roundGSTAmount(subtotal),
    gstRate,
    gstAmount: roundGSTAmount(gstAmount),
    cgstAmount: roundGSTAmount(cgstAmount),
    sgstAmount: roundGSTAmount(sgstAmount),
    igstAmount: roundGSTAmount(igstAmount),
    totalWithGST,
    isIntraState
  }
}

/**
 * Calculate GST for a single line item
 */
export function calculateLineItemGST(
  quantity: number,
  unitPrice: number,
  taxRate: number,
  sellerStateCode: string,
  buyerStateCode: string,
  discountPercent: number = 0
): LineItemGST {
  // Calculate item amount
  const itemAmount = quantity * unitPrice
  
  // Apply discount
  const discountAmount = (itemAmount * discountPercent) / 100
  const taxableValue = itemAmount - discountAmount
  
  const isIntraState = isIntraStateTransaction(sellerStateCode, buyerStateCode)
  
  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0
  let gstAmount = 0
  
  if (isIntraState) {
    const intraGST = calculateIntraStateGST(taxableValue, taxRate)
    cgstAmount = intraGST.cgst
    sgstAmount = intraGST.sgst
    gstAmount = intraGST.total
  } else {
    const interGST = calculateInterStateGST(taxableValue, taxRate)
    igstAmount = interGST.igst
    gstAmount = interGST.total
  }
  
  return {
    itemAmount: roundGSTAmount(itemAmount),
    taxRate,
    taxableValue: roundGSTAmount(taxableValue),
    gstAmount: roundGSTAmount(gstAmount),
    cgstAmount: roundGSTAmount(cgstAmount),
    sgstAmount: roundGSTAmount(sgstAmount),
    igstAmount: roundGSTAmount(igstAmount)
  }
}

/**
 * Calculate reverse GST (extract GST from inclusive amount)
 */
export function calculateReverseGST(
  inclusiveAmount: number,
  gstRate: number
): { baseAmount: number; gstAmount: number } {
  const baseAmount = inclusiveAmount / (1 + gstRate / 100)
  const gstAmount = inclusiveAmount - baseAmount
  
  return {
    baseAmount: roundGSTAmount(baseAmount),
    gstAmount: roundGSTAmount(gstAmount)
  }
}

/**
 * Convert amount to words (for invoices)
 */
export function amountToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  
  if (amount === 0) return 'Zero Rupees Only'
  
  const [rupees, paisePart] = amount.toFixed(2).split('.')
  const rupeesNum = parseInt(rupees)
  const paiseNum = parseInt(paisePart)
  
  function convertToWords(num: number): string {
    if (num === 0) return ''
    if (num < 10) return ones[num]
    if (num < 20) return teens[num - 10]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '')
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertToWords(num % 100) : '')
    if (num < 100000) return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertToWords(num % 1000) : '')
    if (num < 10000000) return convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convertToWords(num % 100000) : '')
    return convertToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convertToWords(num % 10000000) : '')
  }
  
  let words = 'Rupees ' + convertToWords(rupeesNum)
  
  if (paiseNum > 0) {
    words += ' and ' + convertToWords(paiseNum) + ' Paise'
  }
  
  return words + ' Only'
}

/**
 * Format amount in Indian currency format (with commas)
 */
export function formatIndianCurrency(amount: number): string {
  const [integer, decimal] = amount.toFixed(2).split('.')
  const lastThree = integer.substring(integer.length - 3)
  const otherNumbers = integer.substring(0, integer.length - 3)
  const formatted = otherNumbers !== '' 
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
    : lastThree
  
  return '₹' + formatted + '.' + decimal
}

/**
 * Calculate total GST liability for a period (for GST returns)
 */
export function calculateGSTLiability(quotations: GSTCalculation[]): {
  totalCGST: number
  totalSGST: number
  totalIGST: number
  totalGST: number
} {
  const totalCGST = quotations.reduce((sum, q) => sum + q.cgstAmount, 0)
  const totalSGST = quotations.reduce((sum, q) => sum + q.sgstAmount, 0)
  const totalIGST = quotations.reduce((sum, q) => sum + q.igstAmount, 0)
  const totalGST = totalCGST + totalSGST + totalIGST
  
  return {
    totalCGST: roundGSTAmount(totalCGST),
    totalSGST: roundGSTAmount(totalSGST),
    totalIGST: roundGSTAmount(totalIGST),
    totalGST: roundGSTAmount(totalGST)
  }
}
