/**
 * Invoice Builder for E-Invoice Payload
 * 
 * Converts PASADA CRM invoice data to GST e-invoice JSON format
 */

import {
  EInvoicePayload,
  SellerDetails,
  BuyerDetails,
  ItemDetails,
  ValueDetails,
  formatEInvoiceDate,
} from './gst-api'

export interface InvoiceData {
  invoice_number: string
  invoice_date: Date
  invoice_type: 'B2B' | 'B2C'
  reverse_charge: 'Y' | 'N'
  supply_type: 'Goods' | 'Services' | 'Both'
  
  // Seller (Company)
  seller: {
    gstin: string
    legal_name: string
    trade_name?: string
    address: string
    address2?: string
    city: string
    state_code: string
    pin_code: string
    phone?: string
    email?: string
  }
  
  // Buyer (Client)
  buyer: {
    gstin?: string
    legal_name: string
    trade_name?: string
    address: string
    address2?: string
    city: string
    state_code: string
    pin_code: string
    phone?: string
    email?: string
  }
  
  // Line Items
  items: Array<{
    sl_no: number
    description: string
    is_service: boolean
    hsn_sac_code: string
    quantity: number
    unit: string
    unit_price: number
    total_amount: number
    discount?: number
    taxable_value: number
    gst_rate: number
    cgst_amount?: number
    sgst_amount?: number
    igst_amount?: number
    total_item_value: number
  }>
  
  // Totals
  totals: {
    assessable_value: number
    cgst_value?: number
    sgst_value?: number
    igst_value?: number
    discount?: number
    other_charges?: number
    round_off?: number
    total_invoice_value: number
  }
  
  // Additional Details
  payment_terms?: string
  notes?: string
}

/**
 * Build E-Invoice payload from invoice data
 */
export function buildEInvoicePayload(invoiceData: InvoiceData): EInvoicePayload {
  // Determine supply type
  const supTyp = invoiceData.invoice_type === 'B2B' ? 'B2B' : 'B2C'
  
  // Determine if intra-state or inter-state
  const isIntraState = invoiceData.seller.state_code === invoiceData.buyer.state_code
  
  // Build seller details
  const sellerDtls: SellerDetails = {
    Gstin: invoiceData.seller.gstin,
    LglNm: invoiceData.seller.legal_name,
    TrdNm: invoiceData.seller.trade_name,
    Addr1: invoiceData.seller.address,
    Addr2: invoiceData.seller.address2,
    Loc: invoiceData.seller.city,
    Pin: parseInt(invoiceData.seller.pin_code),
    Stcd: invoiceData.seller.state_code,
    Ph: invoiceData.seller.phone,
    Em: invoiceData.seller.email,
  }
  
  // Build buyer details
  const buyerDtls: BuyerDetails = {
    Gstin: invoiceData.buyer.gstin,
    LglNm: invoiceData.buyer.legal_name,
    TrdNm: invoiceData.buyer.trade_name,
    Pos: invoiceData.buyer.state_code, // Place of Supply
    Addr1: invoiceData.buyer.address,
    Addr2: invoiceData.buyer.address2,
    Loc: invoiceData.buyer.city,
    Pin: parseInt(invoiceData.buyer.pin_code),
    Stcd: invoiceData.buyer.state_code,
    Ph: invoiceData.buyer.phone,
    Em: invoiceData.buyer.email,
  }
  
  // Build item list
  const itemList: ItemDetails[] = invoiceData.items.map((item) => ({
    SlNo: item.sl_no.toString(),
    PrdDesc: item.description,
    IsServc: item.is_service ? 'Y' : 'N',
    HsnCd: item.hsn_sac_code,
    Qty: item.quantity,
    Unit: mapUnitToGSTCode(item.unit),
    UnitPrice: item.unit_price,
    TotAmt: item.total_amount,
    Discount: item.discount,
    AssAmt: item.taxable_value,
    GstRt: item.gst_rate,
    IgstAmt: item.igst_amount,
    CgstAmt: item.cgst_amount,
    SgstAmt: item.sgst_amount,
    TotItemVal: item.total_item_value,
  }))
  
  // Build value details
  const valDtls: ValueDetails = {
    AssVal: invoiceData.totals.assessable_value,
    CgstVal: invoiceData.totals.cgst_value,
    SgstVal: invoiceData.totals.sgst_value,
    IgstVal: invoiceData.totals.igst_value,
    Discount: invoiceData.totals.discount,
    OthChrg: invoiceData.totals.other_charges,
    RndOffAmt: invoiceData.totals.round_off,
    TotInvVal: invoiceData.totals.total_invoice_value,
  }
  
  // Build complete payload
  const payload: EInvoicePayload = {
    Version: '1.1',
    TranDtls: {
      TaxSch: 'GST',
      SupTyp: supTyp,
      RegRev: invoiceData.reverse_charge,
      IgstOnIntra: isIntraState ? 'N' : undefined,
    },
    DocDtls: {
      Typ: 'INV',
      No: invoiceData.invoice_number,
      Dt: formatEInvoiceDate(invoiceData.invoice_date),
    },
    SellerDtls: sellerDtls,
    BuyerDtls: buyerDtls,
    ItemList: itemList,
    ValDtls: valDtls,
  }
  
  // Add payment details if available
  if (invoiceData.payment_terms) {
    payload.PayDtls = {
      PayTerm: invoiceData.payment_terms,
    }
  }
  
  // Add reference details if notes available
  if (invoiceData.notes) {
    payload.RefDtls = {
      InvRm: invoiceData.notes,
    }
  }
  
  return payload
}

/**
 * Map CRM unit codes to GST unit codes
 */
function mapUnitToGSTCode(unit: string): string {
  const unitMap: Record<string, string> = {
    'pcs': 'NOS', // Numbers
    'sqft': 'SQF', // Square Feet
    'sqm': 'SQM', // Square Meter
    'rft': 'RFT', // Running Feet
    'set': 'SET', // Set
    'lot': 'LOT', // Lot
    'kg': 'KGS', // Kilograms
    'ltr': 'LTR', // Liters
    'mtr': 'MTR', // Meters
  }
  
  return unitMap[unit.toLowerCase()] || 'OTH' // OTH = Others
}

/**
 * Validate invoice data before generating e-invoice
 */
export function validateInvoiceData(invoiceData: InvoiceData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Validate seller GSTIN
  if (!invoiceData.seller.gstin || invoiceData.seller.gstin.length !== 15) {
    errors.push('Invalid seller GSTIN')
  }
  
  // Validate buyer GSTIN for B2B
  if (invoiceData.invoice_type === 'B2B') {
    if (!invoiceData.buyer.gstin || invoiceData.buyer.gstin.length !== 15) {
      errors.push('Buyer GSTIN is required for B2B invoices')
    }
  }
  
  // Validate invoice number
  if (!invoiceData.invoice_number || invoiceData.invoice_number.length > 16) {
    errors.push('Invalid invoice number (max 16 characters)')
  }
  
  // Validate items
  if (!invoiceData.items || invoiceData.items.length === 0) {
    errors.push('At least one item is required')
  }
  
  // Validate HSN/SAC codes
  invoiceData.items.forEach((item, index) => {
    if (!item.hsn_sac_code) {
      errors.push(`HSN/SAC code missing for item ${index + 1}`)
    }
    if (item.is_service && item.hsn_sac_code.length !== 6) {
      errors.push(`SAC code must be 6 digits for item ${index + 1}`)
    }
    if (!item.is_service && (item.hsn_sac_code.length < 4 || item.hsn_sac_code.length > 8)) {
      errors.push(`HSN code must be 4-8 digits for item ${index + 1}`)
    }
  })
  
  // Validate totals
  const calculatedTotal = invoiceData.items.reduce((sum, item) => sum + item.total_item_value, 0)
  const diff = Math.abs(calculatedTotal - invoiceData.totals.total_invoice_value)
  if (diff > 0.01) {
    errors.push('Total invoice value mismatch')
  }
  
  // Validate GST amounts
  const isIntraState = invoiceData.seller.state_code === invoiceData.buyer.state_code
  if (isIntraState) {
    if (!invoiceData.totals.cgst_value || !invoiceData.totals.sgst_value) {
      errors.push('CGST and SGST required for intra-state transactions')
    }
    if (invoiceData.totals.igst_value) {
      errors.push('IGST not applicable for intra-state transactions')
    }
  } else {
    if (!invoiceData.totals.igst_value) {
      errors.push('IGST required for inter-state transactions')
    }
    if (invoiceData.totals.cgst_value || invoiceData.totals.sgst_value) {
      errors.push('CGST/SGST not applicable for inter-state transactions')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Convert PASADA invoice to e-invoice format
 */
export async function convertToEInvoice(invoiceId: string): Promise<{
  success: boolean
  payload?: EInvoicePayload
  errors?: string[]
}> {
  // This would fetch the invoice from database and convert it
  // Placeholder implementation
  
  try {
    // Fetch invoice data from database
    // const invoiceData = await fetchInvoiceData(invoiceId)
    
    // Validate the data
    // const validation = validateInvoiceData(invoiceData)
    // if (!validation.valid) {
    //   return { success: false, errors: validation.errors }
    // }
    
    // Build the payload
    // const payload = buildEInvoicePayload(invoiceData)
    
    // return { success: true, payload }
    
    return { success: false, errors: ['Not implemented'] }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}
