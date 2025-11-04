import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Define types for GST quotation data
interface GSTQuotationData {
  id: string
  title: string
  quotation_number: string
  created_at: string
  valid_until: string | null
  
  // GST Fields
  subtotal: number
  gst_rate: number
  gst_amount: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_with_gst: number
  discount: number
  
  // Transaction Details
  buyer_gstin: string | null
  seller_gstin: string
  place_of_supply: string
  invoice_type: 'B2B' | 'B2C'
  
  status: string
  notes: string | null
  terms: string | null
  
  // Company Details
  company: {
    name: string
    gstin: string
    address: string
    city: string
    state: string
    state_code: string
    pin_code: string
    email: string
    phone: string
  }
  
  // Project and Client
  project: {
    name: string
    site_location: string | null
    clients: {
      name: string
      email: string | null
      phone: string | null
      address: string | null
      city: string | null
      state: string | null
      gstin: string | null
      state_code: string | null
      client_type: 'B2B' | 'B2C'
    }
  }
  
  // Line Items with GST
  quote_items: Array<{
    description: string
    hsn_sac_code: string | null
    quantity: number
    unit: string
    unit_price: number
    taxable_value: number
    tax_rate: number
    gst_amount: number
    cgst_amount: number
    sgst_amount: number
    igst_amount: number
    total: number
  }>
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Header Section
  header: {
    marginBottom: 15,
    borderBottom: '2px solid #EAB308',
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAB308',
    marginBottom: 3,
  },
  companyTagline: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 8,
    color: '#333333',
    lineHeight: 1.4,
  },
  gstinBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  gstinText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400E',
  },
  
  // Document Title
  docTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Transaction Info Banner
  transactionBanner: {
    backgroundColor: '#DBEAFE',
    padding: 8,
    marginBottom: 15,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionText: {
    fontSize: 8,
    color: '#1E40AF',
  },
  transactionLabel: {
    fontWeight: 'bold',
  },
  
  // Info Blocks
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoBlock: {
    width: '48%',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
    textTransform: 'uppercase',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 4,
  },
  infoText: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 3,
    lineHeight: 1.5,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333333',
  },
  
  // Table Styles
  table: {
    marginBottom: 15,
    border: '1px solid #E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottom: '2px solid #E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  
  // Table Columns (GST Compliant)
  colNo: { width: '4%' },
  colItem: { width: '24%' },
  colHSN: { width: '8%' },
  colQty: { width: '7%', textAlign: 'center' },
  colRate: { width: '10%', textAlign: 'right' },
  colTaxable: { width: '12%', textAlign: 'right' },
  colGST: { width: '7%', textAlign: 'center' },
  colGSTAmt: { width: '12%', textAlign: 'right' },
  colTotal: { width: '16%', textAlign: 'right' },
  
  columnHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  columnText: {
    fontSize: 7,
    color: '#1F2937',
  },
  columnTextBold: {
    fontSize: 7,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  columnTextSecondary: {
    fontSize: 6,
    color: '#6B7280',
    marginTop: 1,
  },
  
  // GST Breakdown Section
  gstBreakdown: {
    marginLeft: 'auto',
    width: '50%',
    border: '1px solid #E5E7EB',
    borderRadius: 4,
  },
  gstHeader: {
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderBottom: '1px solid #E5E7EB',
  },
  gstHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400E',
    textAlign: 'center',
  },
  gstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottom: '1px solid #F3F4F6',
  },
  gstLabel: {
    fontSize: 8,
    color: '#666666',
  },
  gstValue: {
    fontSize: 8,
    color: '#333333',
    fontWeight: 'bold',
  },
  gstTaxRow: {
    backgroundColor: '#F9FAFB',
  },
  grandTotalRow: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EAB308',
  },
  
  // Terms Section
  termsSection: {
    marginTop: 15,
    paddingTop: 12,
    borderTop: '1px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  termsText: {
    fontSize: 7,
    color: '#666666',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  
  // Declaration
  declaration: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  declarationText: {
    fontSize: 7,
    color: '#666666',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  
  // Signature Section
  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderTop: '1px solid #333333',
    marginTop: 30,
    paddingTop: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#999999',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 8,
  },
})

// Format currency in Indian style
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Main GST Quotation PDF Component
export const GSTQuotationPDF: React.FC<{ data: GSTQuotationData }> = ({ data }) => {
  const isIntraState = data.cgst_amount > 0
  const defaultTerms = [
    'This quotation is valid until the date specified above.',
    'Prices are inclusive of GST as mentioned.',
    'Payment terms: 50% advance, 50% on completion.',
    'Installation and delivery charges are included unless specified.',
    'Customizations may affect the final price and delivery timeline.',
  ]

  const terms = data.terms ? data.terms.split('\n') : defaultTerms

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ width: '60%' }}>
              <Text style={styles.companyName}>{data.company.name}</Text>
              <Text style={styles.companyTagline}>Tailored Furniture & Interior Design Services</Text>
              <Text style={styles.companyInfo}>
                {data.company.address}, {data.company.city}, {data.company.state} - {data.company.pin_code}{'\n'}
                Email: {data.company.email} | Phone: {data.company.phone}
              </Text>
            </View>
            <View style={{ width: '38%' }}>
              <View style={styles.gstinBox}>
                <Text style={styles.gstinText}>GSTIN: {data.company.gstin}</Text>
                <Text style={[styles.gstinText, { fontSize: 7, marginTop: 2 }]}>
                  State: {data.company.state} ({data.company.state_code})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.docTitle}>TAX QUOTATION</Text>

        {/* Transaction Info Banner */}
        <View style={styles.transactionBanner}>
          <Text style={styles.transactionText}>
            <Text style={styles.transactionLabel}>Type: </Text>
            {data.invoice_type} ({isIntraState ? 'Intra-State' : 'Inter-State'})
          </Text>
          <Text style={styles.transactionText}>
            <Text style={styles.transactionLabel}>Quote #: </Text>
            {data.quotation_number}
          </Text>
          <Text style={styles.transactionText}>
            <Text style={styles.transactionLabel}>Date: </Text>
            {formatDate(data.created_at)}
          </Text>
          <Text style={styles.transactionText}>
            <Text style={styles.transactionLabel}>Place of Supply: </Text>
            {data.place_of_supply}
          </Text>
        </View>

        {/* Quotation and Client Info */}
        <View style={styles.infoSection}>
          {/* Left: Quotation Details */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Quotation Details</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Project: </Text>{data.project.name}
            </Text>
            {data.project.site_location && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Location: </Text>{data.project.site_location}
              </Text>
            )}
            {data.valid_until && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Valid Until: </Text>{formatDate(data.valid_until)}
              </Text>
            )}
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Status: </Text>{data.status.toUpperCase()}
            </Text>
          </View>

          {/* Right: Client Details */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={[styles.infoText, { fontWeight: 'bold', fontSize: 9 }]}>
              {data.project.clients.name}
            </Text>
            {data.project.clients.gstin && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>GSTIN: </Text>{data.project.clients.gstin}
              </Text>
            )}
            {data.project.clients.address && (
              <Text style={styles.infoText}>{data.project.clients.address}</Text>
            )}
            {data.project.clients.city && data.project.clients.state && (
              <Text style={styles.infoText}>
                {data.project.clients.city}, {data.project.clients.state}
              </Text>
            )}
            {data.project.clients.email && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Email: </Text>{data.project.clients.email}
              </Text>
            )}
            {data.project.clients.phone && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Phone: </Text>{data.project.clients.phone}
              </Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, styles.colNo]}>#</Text>
            <Text style={[styles.columnHeader, styles.colItem]}>Item Description</Text>
            <Text style={[styles.columnHeader, styles.colHSN]}>HSN/SAC</Text>
            <Text style={[styles.columnHeader, styles.colQty]}>Qty</Text>
            <Text style={[styles.columnHeader, styles.colRate]}>Rate</Text>
            <Text style={[styles.columnHeader, styles.colTaxable]}>Taxable</Text>
            <Text style={[styles.columnHeader, styles.colGST]}>GST%</Text>
            <Text style={[styles.columnHeader, styles.colGSTAmt]}>GST Amt</Text>
            <Text style={[styles.columnHeader, styles.colTotal]}>Total</Text>
          </View>

          {/* Table Rows */}
          {data.quote_items.map((item, index) => (
            <View 
              key={index} 
              style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
            >
              <Text style={[styles.columnText, styles.colNo]}>{index + 1}</Text>
              <Text style={[styles.columnText, styles.colItem]}>{item.description}</Text>
              <Text style={[styles.columnText, styles.colHSN]}>
                {item.hsn_sac_code || '-'}
              </Text>
              <Text style={[styles.columnText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.columnText, styles.colRate]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.columnTextBold, styles.colTaxable]}>
                {formatCurrency(item.taxable_value)}
              </Text>
              <Text style={[styles.columnText, styles.colGST]}>
                {item.tax_rate}%
              </Text>
              <Text style={[styles.columnText, styles.colGSTAmt]}>
                {formatCurrency(item.gst_amount)}
              </Text>
              <Text style={[styles.columnTextBold, styles.colTotal]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* GST Breakdown */}
        <View style={styles.gstBreakdown}>
          <View style={styles.gstHeader}>
            <Text style={styles.gstHeaderText}>GST BREAKDOWN</Text>
          </View>
          
          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Subtotal (Taxable):</Text>
            <Text style={styles.gstValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          
          {data.discount > 0 && (
            <View style={styles.gstRow}>
              <Text style={styles.gstLabel}>Discount:</Text>
              <Text style={[styles.gstValue, { color: '#DC2626' }]}>
                - {formatCurrency(data.discount)}
              </Text>
            </View>
          )}
          
          <View style={[styles.gstRow, styles.gstTaxRow]}>
            {isIntraState ? (
              <>
                <View style={{ width: '100%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={styles.gstLabel}>CGST @ {data.gst_rate / 2}%:</Text>
                    <Text style={styles.gstValue}>{formatCurrency(data.cgst_amount)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.gstLabel}>SGST @ {data.gst_rate / 2}%:</Text>
                    <Text style={styles.gstValue}>{formatCurrency(data.sgst_amount)}</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.gstLabel}>IGST @ {data.gst_rate}%:</Text>
                <Text style={styles.gstValue}>{formatCurrency(data.igst_amount)}</Text>
              </>
            )}
          </View>
          
          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Total GST:</Text>
            <Text style={[styles.gstValue, { color: '#EAB308' }]}>
              {formatCurrency(data.gst_amount)}
            </Text>
          </View>
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total_with_gst)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={[styles.termsSection, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.termsText}>{data.notes}</Text>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          {terms.map((term, index) => (
            <Text key={index} style={styles.termsText}>
              {index + 1}. {term}
            </Text>
          ))}
        </View>

        {/* Declaration */}
        <View style={styles.declaration}>
          <Text style={styles.declarationText}>
            We declare that this quotation shows the actual price of the goods/services described and that all particulars are true and correct. GST will be charged as applicable at the time of invoice generation.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={[styles.infoText, { marginBottom: 2 }]}>Customer Signature:</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>Authorized Signatory</Text>
            </View>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={[styles.infoText, { marginBottom: 2 }]}>For {data.company.name}:</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>Authorized Signatory</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Thank you for your business! | {data.company.name} - Tailored Furniture & Interior Design Services
          </Text>
          <Text style={{ marginTop: 3 }}>
            For questions regarding this quotation, please contact us at {data.company.email}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default GSTQuotationPDF
