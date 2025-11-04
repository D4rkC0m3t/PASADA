import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Define types for estimation data
interface EstimationData {
  id: string
  estimation_number: string
  created_at: string
  validity_days: number
  
  // Estimation specific
  estimation_type: 'rough' | 'detailed' | 'fixed'
  margin_percent: number
  
  // Amounts (no GST for estimations)
  subtotal: number
  discount: number
  total: number
  
  status: string
  notes: string | null
  
  // Project and Client
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
  
  // Line items (simplified - no GST)
  estimation_items: Array<{
    description: string
    category: string | null
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
    marginBottom: 25,
    borderBottom: '2px solid #F97316',
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F97316',
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
  
  // Estimation Type Badge
  typeBadge: {
    backgroundColor: '#FED7AA',
    padding: 12,
    borderRadius: 6,
    border: '2px solid #F97316',
    minWidth: 140,
  },
  typeBadgeTitle: {
    fontSize: 8,
    color: '#9A3412',
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  typeBadgeType: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  typeBadgeAccuracy: {
    fontSize: 8,
    color: '#9A3412',
    marginTop: 2,
  },
  
  // Document Title
  docTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginVertical: 15,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  
  // Validity Banner
  validityBanner: {
    backgroundColor: '#FFF7ED',
    padding: 10,
    marginBottom: 20,
    borderRadius: 4,
    borderLeft: '4px solid #F97316',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  validityText: {
    fontSize: 9,
    color: '#9A3412',
  },
  validityLabel: {
    fontWeight: 'bold',
  },
  validityDays: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  
  // Info Blocks
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBlock: {
    width: '48%',
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 4,
  },
  infoText: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 1.5,
  },
  
  // Table Styles
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderBottom: '2px solid #F97316',
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
    backgroundColor: '#FFFBEB',
  },
  
  // Table Columns (simplified - no GST columns)
  col1: { width: '5%' },    // #
  col2: { width: '45%' },   // Description
  col3: { width: '15%', textAlign: 'center' },   // Qty
  col4: { width: '17%', textAlign: 'right' },    // Rate
  col5: { width: '18%', textAlign: 'right' },    // Total
  
  columnHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#9A3412',
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
  columnTextBold: {
    fontSize: 9,
    color: '#1F2937',
    fontWeight: 'bold',
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
  marginRow: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: '#FED7AA',
    paddingHorizontal: 10,
    borderRadius: 4,
    border: '2px solid #F97316',
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
    color: '#EA580C',
  },
  
  // Notes Section
  notesSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.6,
  },
  
  // Disclaimer Section
  disclaimer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    border: '2px solid #FDBA74',
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9A3412',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  disclaimerText: {
    fontSize: 8,
    color: '#9A3412',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  
  // Conversion Note
  conversionNote: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    borderLeft: '4px solid #3B82F6',
  },
  conversionText: {
    fontSize: 8,
    color: '#1E40AF',
    lineHeight: 1.4,
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

// Calculate valid until date
const calculateValidUntil = (createdAt: string, validityDays: number): string => {
  const created = new Date(createdAt)
  const validUntil = new Date(created)
  validUntil.setDate(validUntil.getDate() + validityDays)
  return formatDate(validUntil.toISOString())
}

// Calculate days remaining
const calculateDaysRemaining = (createdAt: string, validityDays: number): number => {
  const created = new Date(createdAt)
  const validUntil = new Date(created)
  validUntil.setDate(validUntil.getDate() + validityDays)
  const today = new Date()
  const daysRemaining = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, daysRemaining)
}

// Get estimation type details
const getEstimationTypeDetails = (type: 'rough' | 'detailed' | 'fixed'): { label: string; accuracy: string } => {
  switch (type) {
    case 'rough':
      return { label: 'ROUGH ESTIMATE', accuracy: '±20%' }
    case 'detailed':
      return { label: 'DETAILED ESTIMATE', accuracy: '±10%' }
    case 'fixed':
      return { label: 'FIXED PRICE', accuracy: 'Exact' }
  }
}

// Main Estimation PDF Component
export const EstimationPDF: React.FC<{ data: EstimationData }> = ({ data }) => {
  const typeDetails = getEstimationTypeDetails(data.estimation_type)
  const validUntil = calculateValidUntil(data.created_at, data.validity_days)
  const daysRemaining = calculateDaysRemaining(data.created_at, data.validity_days)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ width: '55%' }}>
              <Text style={styles.companyName}>PASADA INTERIORS</Text>
              <Text style={styles.companyTagline}>Tailored Furniture & Interior Design Services</Text>
              <Text style={styles.companyInfo}>
                Email: contact@pasada.in | Phone: +91 98765 43210{'\n'}
                Website: www.pasada.in | Address: Bucharest, Romania
              </Text>
            </View>
            <View style={{ width: '40%', alignItems: 'flex-end' }}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeTitle}>Estimation Type</Text>
                <Text style={styles.typeBadgeType}>{typeDetails.label}</Text>
                <Text style={styles.typeBadgeAccuracy}>Accuracy: {typeDetails.accuracy}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.docTitle}>📋 COST ESTIMATION</Text>

        {/* Validity Banner */}
        <View style={styles.validityBanner}>
          <View>
            <Text style={styles.validityText}>
              <Text style={styles.validityLabel}>Estimate #: </Text>
              {data.estimation_number}
            </Text>
            <Text style={styles.validityText}>
              <Text style={styles.validityLabel}>Date: </Text>
              {formatDate(data.created_at)}
            </Text>
          </View>
          <View>
            <Text style={styles.validityText}>
              <Text style={styles.validityLabel}>Valid Until: </Text>
              {validUntil}
            </Text>
            <Text style={styles.validityDays}>
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
            </Text>
          </View>
        </View>

        {/* Estimation and Client Info */}
        <View style={styles.infoSection}>
          {/* Left: Estimation Details */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Estimation Details</Text>
            <Text style={styles.infoText}>Project: {data.project.name}</Text>
            {data.project.location && (
              <Text style={styles.infoText}>Location: {data.project.location}</Text>
            )}
            <Text style={styles.infoText}>Status: {data.status.toUpperCase()}</Text>
            <Text style={styles.infoText}>Margin: {data.margin_percent}%</Text>
          </View>

          {/* Right: Client Details */}
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Prepared For</Text>
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
            <Text style={[styles.columnHeader, styles.col2]}>Description</Text>
            <Text style={[styles.columnHeader, styles.col3]}>Quantity</Text>
            <Text style={[styles.columnHeader, styles.col4]}>Rate</Text>
            <Text style={[styles.columnHeader, styles.col5]}>Total</Text>
          </View>

          {/* Table Rows */}
          {data.estimation_items.map((item, index) => (
            <View 
              key={index} 
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={[styles.columnText, styles.col1]}>{index + 1}</Text>
              <View style={styles.col2}>
                <Text style={styles.columnText}>{item.description}</Text>
                {item.category && (
                  <Text style={styles.columnTextSecondary}>Category: {item.category}</Text>
                )}
              </View>
              <Text style={[styles.columnText, styles.col3]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.columnText, styles.col4]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.columnTextBold, styles.col5]}>
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
          
          <View style={[styles.totalRow, styles.marginRow]}>
            <Text style={styles.totalLabel}>Margin ({data.margin_percent}%):</Text>
            <Text style={[styles.totalValue, { color: '#F97316' }]}>
              {formatCurrency(data.subtotal * (data.margin_percent / 100))}
            </Text>
          </View>
          
          {data.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={[styles.totalValue, { color: '#DC2626' }]}>
                - {formatCurrency(data.discount)}
              </Text>
            </View>
          )}
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Estimated Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ IMPORTANT NOTICE</Text>
          <Text style={styles.disclaimerText}>
            • This is a cost estimation only and not a formal quotation or invoice.
          </Text>
          <Text style={styles.disclaimerText}>
            • Actual prices may vary based on final specifications and market conditions.
          </Text>
          <Text style={styles.disclaimerText}>
            • This estimate is valid for {data.validity_days} days from the date mentioned above.
          </Text>
          <Text style={styles.disclaimerText}>
            • GST/taxes will be added in the final quotation as per applicable rates.
          </Text>
          <Text style={styles.disclaimerText}>
            • A {data.margin_percent}% margin is included in the total estimated cost.
          </Text>
        </View>

        {/* Conversion Note */}
        <View style={styles.conversionNote}>
          <Text style={styles.conversionText}>
            💡 To convert this estimation into a formal quotation with GST details, 
            please contact us or visit your client dashboard.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Thank you for considering PASADA Interiors | Tailored Furniture & Interior Design Services
          </Text>
          <Text style={{ marginTop: 4 }}>
            For questions regarding this estimation, please contact us at contact@pasada.in
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default EstimationPDF
