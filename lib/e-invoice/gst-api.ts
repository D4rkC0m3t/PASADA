/**
 * E-Invoice GST Portal Integration
 * 
 * This module handles integration with the GST e-invoice system
 * through either NIC (National Informatics Centre) or GSP (GST Suvidha Provider)
 * 
 * References:
 * - NIC e-Invoice API: https://einvoice1.gst.gov.in/
 * - GST e-Invoice Schema: https://einvoice1.gst.gov.in/Others/einvoice_schema.xsd
 */

export interface EInvoiceConfig {
  mode: 'sandbox' | 'production'
  provider: 'nic' | 'cleartax' | 'tally' | 'masters'
  apiKey?: string
  apiSecret?: string
  gstin: string
  username?: string
  password?: string
}

export interface SellerDetails {
  Gstin: string
  LglNm: string // Legal Name
  TrdNm?: string // Trade Name
  Addr1: string
  Addr2?: string
  Loc: string // Location/City
  Pin: number
  Stcd: string // State Code
  Ph?: string // Phone
  Em?: string // Email
}

export interface BuyerDetails {
  Gstin?: string // Optional for B2C
  LglNm: string
  TrdNm?: string
  Pos: string // Place of Supply (State Code)
  Addr1: string
  Addr2?: string
  Loc: string
  Pin: number
  Stcd: string
  Ph?: string
  Em?: string
}

export interface ItemDetails {
  SlNo: string // Serial Number
  PrdDesc: string // Product Description
  IsServc: 'Y' | 'N' // Is Service
  HsnCd: string // HSN/SAC Code
  Barcde?: string
  Qty: number
  FreeQty?: number
  Unit: string
  UnitPrice: number
  TotAmt: number // Total Amount
  Discount?: number
  PreTaxVal?: number
  AssAmt: number // Assessable Amount (Taxable Value)
  GstRt: number // GST Rate
  IgstAmt?: number
  CgstAmt?: number
  SgstAmt?: number
  CesRt?: number
  CesAmt?: number
  CesNonAdvlAmt?: number
  StateCesRt?: number
  StateCesAmt?: number
  StateCesNonAdvlAmt?: number
  OthChrg?: number
  TotItemVal: number // Total Item Value
}

export interface ValueDetails {
  AssVal: number // Assessable Value
  CgstVal?: number
  SgstVal?: number
  IgstVal?: number
  CesVal?: number
  StCesVal?: number
  Discount?: number
  OthChrg?: number
  RndOffAmt?: number
  TotInvVal: number // Total Invoice Value
}

export interface EInvoicePayload {
  Version: string // "1.1"
  TranDtls: {
    TaxSch: 'GST' // Tax Scheme
    SupTyp: 'B2B' | 'B2C' | 'SEZWP' | 'SEZWOP' | 'EXPWP' | 'EXPWOP' | 'DEXP'
    RegRev?: 'Y' | 'N' // Reverse Charge
    EcmGstin?: string
    IgstOnIntra?: 'Y' | 'N'
  }
  DocDtls: {
    Typ: 'INV' | 'CRN' | 'DBN' // Document Type
    No: string // Invoice Number
    Dt: string // Date (DD/MM/YYYY)
  }
  SellerDtls: SellerDetails
  BuyerDtls: BuyerDetails
  DispDtls?: SellerDetails // Dispatch Details (if different)
  ShipDtls?: BuyerDetails // Shipping Details (if different)
  ItemList: ItemDetails[]
  ValDtls: ValueDetails
  PayDtls?: {
    Nm?: string
    AccDet?: string
    Mode?: string
    FinInsBr?: string
    PayTerm?: string
    PayInstr?: string
    CrTrn?: string
    DirDr?: string
    CrDay?: number
    PaidAmt?: number
    PaymtDue?: number
  }
  RefDtls?: {
    InvRm?: string // Invoice Remarks
    DocPerdDtls?: {
      InvStDt?: string
      InvEndDt?: string
    }
    PrecDocDtls?: Array<{
      InvNo?: string
      InvDt?: string
      OthRefNo?: string
    }>
    ContrDtls?: Array<{
      RecAdvRefr?: string
      RecAdvDt?: string
      TendRefr?: string
      ContrRefr?: string
      ExtRefr?: string
      ProjRefr?: string
      PORefr?: string
      PORefDt?: string
    }>
  }
  AddlDocDtls?: Array<{
    Url?: string
    Docs?: string
    Info?: string
  }>
  ExpDtls?: {
    ShipBNo?: string
    ShipBDt?: string
    Port?: string
    RefClm?: 'Y' | 'N'
    ForCur?: string
    CntCode?: string
    ExpDuty?: number
  }
  EwbDtls?: {
    TransId?: string
    TransName?: string
    TransMode?: string
    Distance?: number
    TransDocNo?: string
    TransDocDt?: string
    VehNo?: string
    VehType?: string
  }
}

export interface EInvoiceResponse {
  success: boolean
  Irn?: string // Invoice Reference Number
  AckNo?: string // Acknowledgement Number
  AckDt?: string // Acknowledgement Date
  SignedInvoice?: string // Digitally signed invoice JSON
  SignedQRCode?: string // QR Code data
  Status?: string
  EwbNo?: string // E-Way Bill Number
  EwbDt?: string
  EwbValidTill?: string
  Remarks?: string
  error?: {
    error_cd?: string
    message?: string
  }
}

export interface CancelIRNPayload {
  Irn: string
  CnlRsn: '1' | '2' | '3' | '4' // 1=Duplicate, 2=Data Entry Mistake, 3=Order Cancelled, 4=Others
  CnlRem: string // Cancellation Remarks
}

export interface CancelIRNResponse {
  success: boolean
  Irn?: string
  CancelDate?: string
  error?: {
    error_cd?: string
    message?: string
  }
}

/**
 * E-Invoice API Client
 */
export class EInvoiceAPI {
  private config: EInvoiceConfig
  private baseUrl: string
  private authToken?: string

  constructor(config: EInvoiceConfig) {
    this.config = config
    this.baseUrl = this.getBaseUrl()
  }

  private getBaseUrl(): string {
    if (this.config.mode === 'sandbox') {
      switch (this.config.provider) {
        case 'nic':
          return 'https://gsp.adaequare.com/test/enriched/ei/api'
        case 'cleartax':
          return 'https://einvoicing.internal.cleartax.co/v2'
        default:
          return 'https://gsp.adaequare.com/test/enriched/ei/api'
      }
    } else {
      switch (this.config.provider) {
        case 'nic':
          return 'https://gsp.adaequare.com/enriched/ei/api'
        case 'cleartax':
          return 'https://api.cleartax.in/v2'
        default:
          return 'https://gsp.adaequare.com/enriched/ei/api'
      }
    }
  }

  /**
   * Authenticate with GST portal
   */
  async authenticate(): Promise<boolean> {
    try {
      // Implementation depends on provider
      // This is a placeholder - actual implementation will vary
      
      if (this.config.provider === 'nic') {
        // NIC authentication flow
        const response = await fetch(`${this.baseUrl}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.config.username,
            password: this.config.password,
            gstin: this.config.gstin,
          }),
        })

        const data = await response.json()
        if (data.access_token) {
          this.authToken = data.access_token
          return true
        }
      } else if (this.config.provider === 'cleartax') {
        // ClearTax uses API key authentication
        this.authToken = this.config.apiKey
        return true
      }

      return false
    } catch (error) {
      console.error('Authentication error:', error)
      return false
    }
  }

  /**
   * Generate IRN for an invoice
   */
  async generateIRN(payload: EInvoicePayload): Promise<EInvoiceResponse> {
    try {
      if (!this.authToken) {
        const authenticated = await this.authenticate()
        if (!authenticated) {
          return {
            success: false,
            error: {
              error_cd: 'AUTH_FAILED',
              message: 'Authentication failed',
            },
          }
        }
      }

      const response = await fetch(`${this.baseUrl}/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'gstin': this.config.gstin,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.Irn) {
        return {
          success: true,
          Irn: data.Irn,
          AckNo: data.AckNo,
          AckDt: data.AckDt,
          SignedInvoice: data.SignedInvoice,
          SignedQRCode: data.SignedQRCode,
          Status: data.Status,
        }
      } else {
        return {
          success: false,
          error: {
            error_cd: data.error_cd || 'UNKNOWN',
            message: data.message || 'Failed to generate IRN',
          },
        }
      }
    } catch (error) {
      console.error('IRN generation error:', error)
      return {
        success: false,
        error: {
          error_cd: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  /**
   * Cancel an IRN
   */
  async cancelIRN(payload: CancelIRNPayload): Promise<CancelIRNResponse> {
    try {
      if (!this.authToken) {
        await this.authenticate()
      }

      const response = await fetch(`${this.baseUrl}/invoice/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'gstin': this.config.gstin,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          Irn: data.Irn,
          CancelDate: data.CancelDate,
        }
      } else {
        return {
          success: false,
          error: {
            error_cd: data.error_cd,
            message: data.message,
          },
        }
      }
    } catch (error) {
      console.error('IRN cancellation error:', error)
      return {
        success: false,
        error: {
          error_cd: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  /**
   * Get IRN details
   */
  async getIRNDetails(irn: string): Promise<EInvoiceResponse> {
    try {
      if (!this.authToken) {
        await this.authenticate()
      }

      const response = await fetch(`${this.baseUrl}/invoice/irn/${irn}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'gstin': this.config.gstin,
        },
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          ...data,
        }
      } else {
        return {
          success: false,
          error: {
            error_cd: data.error_cd,
            message: data.message,
          },
        }
      }
    } catch (error) {
      console.error('Get IRN error:', error)
      return {
        success: false,
        error: {
          error_cd: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }
}

/**
 * Helper function to format date for e-invoice (DD/MM/YYYY)
 */
export function formatEInvoiceDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Helper function to validate GSTIN format
 */
export function validateGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin)
}

/**
 * Helper function to extract state code from GSTIN
 */
export function getStateCodeFromGSTIN(gstin: string): string {
  if (validateGSTIN(gstin)) {
    return gstin.substring(0, 2)
  }
  return ''
}

/**
 * Generate QR code image from signed QR code data
 */
export async function generateQRCodeImage(qrCodeData: string): Promise<string> {
  // This would use a QR code library like 'qrcode' to generate the image
  // Returns base64 encoded image
  // Implementation depends on the library used
  return qrCodeData // Placeholder
}
