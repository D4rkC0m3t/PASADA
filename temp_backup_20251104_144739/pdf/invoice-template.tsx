import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Define types for invoice data
interface InvoiceData {
  invoice_number: string
  invoice_date: string
  due_date: string
  payment_terms: string
  project_name: string
  site_location: string
  
  client: {
    name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    pincode: string | null
    gstin: string | null
  }
  
  items: Array<{
    item_number: number
    category: string | null
    description: string
    hsn_sac_code: string
    quantity: number
    unit: string
    unit_price: number
    taxable_value: number
    tax_rate: number
    gst_amount: number
    cgst_amount: number | null
    sgst_amount: number | null
    igst_amount: number | null
    total: number
  }>
  
  subtotal: number
  gst_rate: number
  gst_amount: number
  cgst_amount: number | null
  sgst_amount: number | null
  igst_amount: number | null
  total_with_gst: number
  discount: number
  buyer_gstin: string | null
  seller_gstin: string
  place_of_supply: string
  invoice_type: string
  reverse_charge: string
  supply_type: string
  notes: string | null
  irn: string | null
  ack_no: string | null
  ack_date: string | null
  qr_code_image: string | null
}

interface CompanyData {
  company_name: string
  legal_name: string
  gstin: string
  pan: string
  address: string
  city: string
  state: string
  state_code: string
  pincode: string
  email: string
  phone: string
}

interface InvoicePDFProps {
  invoice: InvoiceData
  company: CompanyData
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Header
  header: {
    marginBottom: 15,
    borderBottom: '2px solid #16A34A',
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
    color: '#16A34A',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  
  // Info sections
  infoSection: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  
  // Table
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    padding: 6,
    fontSize: 8,
  },
  col1: { width: '5%' },
  col2: { width: '30%' },
  col3: { width: '10%' },
  col4: { width: '8%' },
  col5: { width: '12%' },
  col6: { width: '10%' },
  col7: { width: '12%' },
  col8: { width: '13%' },
  
  // Summary
  summary: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    padding: 5,
    fontSize: 9,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    padding: 8,
    backgroundColor: '#16A34A',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 5,
  },
  
  // Footer
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1px solid #E5E7EB',
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 3,
  },
  
  // E-Invoice section
  eInvoiceSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 4,
    border: '1px solid #16A34A',
  },
  eInvoiceTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 5,
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
})

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.companyName}>{company.company_name}</Text>
              <Text style={styles.infoText}>{company.legal_name}</Text>
              <Text style={styles.infoText}>GSTIN: {company.gstin}</Text>
              <Text style={styles.infoText}>PAN: {company.pan}</Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
              <Text style={[styles.infoText, { textAlign: 'right' }]}>
                {invoice.invoice_number}
              </Text>
            </View>
          </View>
        </View>

        {/* Company & Client Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>From (Seller)</Text>
              <Text style={styles.infoText}>{company.company_name}</Text>
              <Text style={styles.infoText}>{company.address}</Text>
              <Text style={styles.infoText}>{company.city}, {company.state} - {company.pincode}</Text>
              <Text style={styles.infoText}>State Code: {company.state_code}</Text>
              <Text style={styles.infoText}>Email: {company.email}</Text>
              <Text style={styles.infoText}>Phone: {company.phone}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>To (Buyer)</Text>
              <Text style={styles.infoText}>{invoice.client.name}</Text>
              {invoice.client.address && <Text style={styles.infoText}>{invoice.client.address}</Text>}
              {invoice.client.city && (
                <Text style={styles.infoText}>
                  {invoice.client.city}, {invoice.client.state} - {invoice.client.pincode}
                </Text>
              )}
              {invoice.client.gstin && <Text style={styles.infoText}>GSTIN: {invoice.client.gstin}</Text>}
              {invoice.client.email && <Text style={styles.infoText}>Email: {invoice.client.email}</Text>}
              {invoice.client.phone && <Text style={styles.infoText}>Phone: {invoice.client.phone}</Text>}
            </View>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>
              <Text style={styles.infoText}>Invoice Date: {formatDate(invoice.invoice_date)}</Text>
              <Text style={styles.infoText}>Due Date: {formatDate(invoice.due_date)}</Text>
              <Text style={styles.infoText}>Payment Terms: {invoice.payment_terms}</Text>
              <Text style={styles.infoText}>Place of Supply: {invoice.place_of_supply}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>Project Details</Text>
              <Text style={styles.infoText}>Project: {invoice.project_name}</Text>
              {invoice.site_location && <Text style={styles.infoText}>Location: {invoice.site_location}</Text>}
              <Text style={styles.infoText}>Type: {invoice.invoice_type}</Text>
              <Text style={styles.infoText}>Reverse Charge: {invoice.reverse_charge}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>HSN/SAC</Text>
            <Text style={styles.col4}>Qty</Text>
            <Text style={styles.col5}>Rate</Text>
            <Text style={styles.col6}>Taxable</Text>
            <Text style={styles.col7}>GST</Text>
            <Text style={styles.col8}>Total</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.item_number}</Text>
              <Text style={styles.col2}>{item.description}</Text>
              <Text style={styles.col3}>{item.hsn_sac_code}</Text>
              <Text style={styles.col4}>{item.quantity} {item.unit}</Text>
              <Text style={styles.col5}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.col6}>{formatCurrency(item.taxable_value)}</Text>
              <Text style={styles.col7}>
                {item.tax_rate}%{'\n'}
                {formatCurrency(item.gst_amount)}
              </Text>
              <Text style={styles.col8}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.cgst_amount && invoice.sgst_amount ? (
            <>
              <View style={styles.summaryRow}>
                <Text>CGST:</Text>
                <Text>{formatCurrency(invoice.cgst_amount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>SGST:</Text>
                <Text>{formatCurrency(invoice.sgst_amount)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.summaryRow}>
              <Text>IGST:</Text>
              <Text>{formatCurrency(invoice.igst_amount || 0)}</Text>
            </View>
          )}
          {invoice.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text>Discount:</Text>
              <Text>-{formatCurrency(invoice.discount)}</Text>
            </View>
          )}
          <View style={styles.summaryTotal}>
            <Text>Total Amount:</Text>
            <Text>{formatCurrency(invoice.total_with_gst)}</Text>
          </View>
        </View>

        {/* E-Invoice Section */}
        {invoice.irn && (
          <View style={styles.eInvoiceSection}>
            <Text style={styles.eInvoiceTitle}>E-Invoice Details</Text>
            <Text style={styles.infoText}>IRN: {invoice.irn}</Text>
            {invoice.ack_no && <Text style={styles.infoText}>Ack No: {invoice.ack_no}</Text>}
            {invoice.ack_date && (
              <Text style={styles.infoText}>
                Ack Date: {formatDate(invoice.ack_date)}
              </Text>
            )}
            {invoice.qr_code_image && (
              <Image src={invoice.qr_code_image} style={styles.qrCode} />
            )}
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.footerText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a computer-generated invoice and does not require a signature.
          </Text>
          <Text style={styles.footerText}>
            For {company.company_name}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDF
