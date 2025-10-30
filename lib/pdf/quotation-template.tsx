import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Define types for quotation data
interface QuotationData {
  id: string
  title: string
  quotation_number: string
  created_at: string
  valid_until: string | null
  subtotal: number
  tax_percent: string
  tax_amount: number
  discount: string
  total_amount: number
  status: string
  notes: string | null
  terms: string | null
  project: {
    name: string
    location: string | null
    client: {
      name: string
      email: string | null
      phone: string | null
      address: string | null
    }
  }
  quote_items: Array<{
    material_name: string
    description: string | null
    quantity: number
    unit: string
    unit_price: number
    total: number
  }>
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Header Section
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #EAB308',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAB308',
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.4,
  },
  
  // Quotation Info
  quotationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  infoBlock: {
    width: '48%',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 1.5,
  },
  
  // Quote Title
  quoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  
  // Table Styles
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  
  // Table Columns
  col1: { width: '5%' },   // #
  col2: { width: '40%' },  // Item
  col3: { width: '10%', textAlign: 'center' },  // Qty
  col4: { width: '15%', textAlign: 'right' },   // Price
  col5: { width: '15%', textAlign: 'right' },   // Subtotal
  col6: { width: '15%', textAlign: 'right' },   // Total
  
  columnHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  columnText: {
    fontSize: 9,
    color: '#1F2937',
  },
  columnTextSecondary: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Totals Section
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottom: '1px solid #E5E7EB',
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EAB308',
  },
  
  // Terms Section
  termsSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  termsText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 10,
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
    month: 'long', 
    day: 'numeric' 
  })
}

// Main PDF Document Component
export const QuotationPDF: React.FC<{ data: QuotationData }> = ({ data }) => {
  const defaultTerms = [
    'This quotation is valid until the date specified above.',
    'Prices are subject to change based on market conditions.',
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
          <Text style={styles.companyName}>PASADA INTERIORS</Text>
          <Text style={styles.companyTagline}>Tailored Furniture & Interior Design Services</Text>
          <Text style={styles.companyInfo}>
            Email: contact@pasada.in | Phone: +91 98765 43210{'\n'}
            Website: www.pasada.in | Address: Bucharest, Romania
          </Text>
        </View>

        {/* Quotation Title */}
        <Text style={styles.quoteTitle}>QUOTATION</Text>

        {/* Quotation Info and Client Info */}
        <View style={styles.quotationInfo}>
          {/* Left: Quotation Details */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Quotation Details</Text>
            <Text style={styles.infoText}>Quote #: {data.quotation_number}</Text>
            <Text style={styles.infoText}>Date: {formatDate(data.created_at)}</Text>
            {data.valid_until && (
              <Text style={styles.infoText}>Valid Until: {formatDate(data.valid_until)}</Text>
            )}
            <Text style={styles.infoText}>Status: {data.status.toUpperCase()}</Text>
            <Text style={styles.infoText}>Project: {data.project.name}</Text>
            {data.project.location && (
              <Text style={styles.infoText}>Location: {data.project.location}</Text>
            )}
          </View>

          {/* Right: Client Details */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={styles.infoText}>{data.project.client.name}</Text>
            {data.project.client.email && (
              <Text style={styles.infoText}>Email: {data.project.client.email}</Text>
            )}
            {data.project.client.phone && (
              <Text style={styles.infoText}>Phone: {data.project.client.phone}</Text>
            )}
            {data.project.client.address && (
              <Text style={styles.infoText}>Address: {data.project.client.address}</Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, styles.col1]}>#</Text>
            <Text style={[styles.columnHeader, styles.col2]}>Item Description</Text>
            <Text style={[styles.columnHeader, styles.col3]}>Qty</Text>
            <Text style={[styles.columnHeader, styles.col4]}>Unit Price</Text>
            <Text style={[styles.columnHeader, styles.col6]}>Total</Text>
          </View>

          {/* Table Rows */}
          {data.quote_items.map((item, index) => (
            <View 
              key={index} 
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={[styles.columnText, styles.col1]}>{index + 1}</Text>
              <View style={styles.col2}>
                <Text style={styles.columnText}>{item.material_name}</Text>
                {item.description && (
                  <Text style={styles.columnTextSecondary}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.columnText, styles.col3]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.columnText, styles.col4]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.columnText, styles.col6]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          
          {parseFloat(data.discount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={[styles.totalValue, { color: '#DC2626' }]}>
                -{formatCurrency(parseFloat(data.discount))}
              </Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({data.tax_percent}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.tax_amount)}</Text>
          </View>
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total_amount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={[styles.termsSection, { marginTop: 20 }]}>
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Thank you for your business! | PASADA Interiors - Tailored Furniture & Interior Design Services
          </Text>
          <Text style={{ marginTop: 4 }}>
            For questions regarding this quotation, please contact us at contact@pasada.in
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default QuotationPDF
