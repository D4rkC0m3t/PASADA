# 📋 Quotation Builder - GST Enhancement Plan

**File:** `app/admin/quotations/new/page.tsx`  
**Current Size:** 536 lines  
**Target:** Add comprehensive GST functionality

---

## 🎯 Enhancement Goals

### **1. Fetch Company & Client GST Details**
- Get company GSTIN and state code from `company_settings`
- Get client GSTIN and state code from `clients` table (via project)
- Determine if transaction is B2B or B2C
- Determine if transaction is intra-state or inter-state

### **2. Add HSN/SAC Code Selection**
- Fetch HSN/SAC codes from `hsn_sac_master` table
- Add dropdown/search for HSN/SAC codes per line item
- Auto-fill GST rate from HSN/SAC code
- Allow manual override of GST rate

### **3. Enhanced Line Item Interface**
```typescript
interface LineItem {
  id: string
  material_id: string | null
  material_name: string
  description: string
  category: string
  hsn_sac_code: string        // NEW
  quantity: number
  unit: string
  unit_price: number
  taxable_value: number        // NEW (quantity * unit_price)
  tax_rate: number             // NEW (GST rate for this item)
  gst_amount: number           // NEW (total GST)
  cgst_amount: number          // NEW (CGST if intra-state)
  sgst_amount: number          // NEW (SGST if intra-state)
  igst_amount: number          // NEW (IGST if inter-state)
  total: number                // NEW (taxable_value + gst_amount)
}
```

### **4. GST Calculation Logic**
```typescript
// For each line item:
taxable_value = quantity * unit_price
gst_amount = taxable_value * (tax_rate / 100)

// If intra-state (same state):
cgst_amount = gst_amount / 2
sgst_amount = gst_amount / 2
igst_amount = 0

// If inter-state (different states):
cgst_amount = 0
sgst_amount = 0
igst_amount = gst_amount

total = taxable_value + gst_amount
```

### **5. Quotation-Level GST Fields**
```typescript
const quotationGST = {
  subtotal: number,              // Sum of all taxable_values
  gst_rate: number,              // Default rate (can be mixed)
  gst_amount: number,            // Total GST
  cgst_amount: number,           // Total CGST
  sgst_amount: number,           // Total SGST
  igst_amount: number,           // Total IGST
  total_with_gst: number,        // Grand total
  is_tax_inclusive: boolean,     // Tax inclusive pricing
  buyer_gstin: string,           // Client GSTIN
  seller_gstin: string,          // Company GSTIN
  place_of_supply: string,       // State name
  invoice_type: 'B2B' | 'B2C'    // Transaction type
}
```

### **6. UI Enhancements**

#### **Add GST Summary Section:**
```
┌─────────────────────────────────────┐
│ GST Breakdown                       │
├─────────────────────────────────────┤
│ Subtotal:              ₹10,000.00   │
│ Discount:              ₹500.00      │
│ Taxable Amount:        ₹9,500.00    │
│                                     │
│ CGST @ 9%:            ₹855.00       │
│ SGST @ 9%:            ₹855.00       │
│ ─────────────────────────────────   │
│ Total GST:            ₹1,710.00     │
│                                     │
│ Grand Total:          ₹11,210.00    │
└─────────────────────────────────────┘
```

#### **Add HSN/SAC Column to Line Items Table:**
```
Item | HSN/SAC | Qty | Rate | Taxable | GST% | GST Amt | Total
```

#### **Add Transaction Info Header:**
```
Transaction Type: B2B (Intra-State)
Seller GSTIN: 29CGRPB3179A1ZD (Karnataka)
Buyer GSTIN: 29XYZAB1234C1Z2 (Karnataka)
```

---

## 🔧 Implementation Steps

### **Step 1: Update Interfaces**
```typescript
// Add to existing interfaces
interface LineItem {
  // ... existing fields
  hsn_sac_code: string
  taxable_value: number
  tax_rate: number
  gst_amount: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
}

interface HSNSACCode {
  code: string
  description: string
  type: 'HSN' | 'SAC'
  gst_rate: number
}

interface CompanySettings {
  gstin: string
  state_code: string
}

interface ClientGST {
  gstin: string | null
  state_code: string | null
  client_type: 'B2B' | 'B2C'
}
```

### **Step 2: Add State Management**
```typescript
const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
const [clientGST, setClientGST] = useState<ClientGST | null>(null)
const [hsnSacCodes, setHsnSacCodes] = useState<HSNSACCode[]>([])
const [isIntraState, setIsIntraState] = useState(false)
const [invoiceType, setInvoiceType] = useState<'B2B' | 'B2C'>('B2C')
```

### **Step 3: Fetch Functions**
```typescript
const fetchCompanySettings = async () => {
  const { data } = await supabase
    .from('company_settings')
    .select('gstin, state_code')
    .single()
  setCompanySettings(data)
}

const fetchClientGST = async (projectId: string) => {
  const { data } = await supabase
    .from('projects')
    .select(`
      clients (
        gstin,
        state_code,
        client_type
      )
    `)
    .eq('id', projectId)
    .single()
  
  setClientGST(data?.clients)
  
  // Determine transaction type
  if (data?.clients?.gstin && companySettings?.gstin) {
    setInvoiceType('B2B')
    setIsIntraState(data.clients.state_code === companySettings.state_code)
  } else {
    setInvoiceType('B2C')
  }
}

const fetchHSNSACCodes = async () => {
  const { data } = await supabase
    .from('hsn_sac_master')
    .select('code, description, type, gst_rate')
    .eq('is_active', true)
    .order('code')
  setHsnSacCodes(data || [])
}
```

### **Step 4: Enhanced Line Item Functions**
```typescript
const addLineItem = (material?: Material, hsnSacCode?: HSNSACCode) => {
  const quantity = 1
  const unit_price = material?.unit_price || 0
  const tax_rate = hsnSacCode?.gst_rate || 18
  
  const taxable_value = quantity * unit_price
  const gst_amount = calculateGST(taxable_value, tax_rate)
  
  const newItem: LineItem = {
    id: Math.random().toString(36).substring(7),
    material_id: material?.id || null,
    material_name: material?.name || '',
    description: '',
    category: material?.category || 'Labor',
    hsn_sac_code: hsnSacCode?.code || '',
    quantity,
    unit: material?.unit || 'piece',
    unit_price,
    taxable_value,
    tax_rate,
    gst_amount,
    cgst_amount: isIntraState ? gst_amount / 2 : 0,
    sgst_amount: isIntraState ? gst_amount / 2 : 0,
    igst_amount: isIntraState ? 0 : gst_amount,
    total: taxable_value + gst_amount
  }
  
  setLineItems([...lineItems, newItem])
}

const updateLineItem = (id: string, field: string, value: any) => {
  setLineItems(lineItems.map(item => {
    if (item.id === id) {
      const updated = { ...item, [field]: value }
      
      // Recalculate
      updated.taxable_value = updated.quantity * updated.unit_price
      updated.gst_amount = calculateGST(updated.taxable_value, updated.tax_rate)
      updated.cgst_amount = isIntraState ? updated.gst_amount / 2 : 0
      updated.sgst_amount = isIntraState ? updated.gst_amount / 2 : 0
      updated.igst_amount = isIntraState ? 0 : updated.gst_amount
      updated.total = updated.taxable_value + updated.gst_amount
      
      return updated
    }
    return item
  }))
}
```

### **Step 5: GST Calculation Functions**
```typescript
import { calculateLineItemGST, calculateQuotationGST, formatIndianCurrency } from '@/lib/gst/calculator'

const calculateGSTBreakdown = () => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.taxable_value, 0)
  const totalCGST = lineItems.reduce((sum, item) => sum + item.cgst_amount, 0)
  const totalSGST = lineItems.reduce((sum, item) => sum + item.sgst_amount, 0)
  const totalIGST = lineItems.reduce((sum, item) => sum + item.igst_amount, 0)
  const totalGST = totalCGST + totalSGST + totalIGST
  const grandTotal = subtotal + totalGST
  
  return {
    subtotal,
    totalCGST,
    totalSGST,
    totalIGST,
    totalGST,
    grandTotal
  }
}
```

### **Step 6: Update Save Function**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const gstBreakdown = calculateGSTBreakdown()
  
  // Create quotation with GST fields
  const { data: quotation, error: quotationError } = await supabase
    .from('quotations')
    .insert([{
      title: formData.title,
      project_id: formData.project_id,
      subtotal: gstBreakdown.subtotal,
      gst_rate: 18, // or calculate weighted average
      gst_amount: gstBreakdown.totalGST,
      cgst_amount: gstBreakdown.totalCGST,
      sgst_amount: gstBreakdown.totalSGST,
      igst_amount: gstBreakdown.totalIGST,
      total_with_gst: gstBreakdown.grandTotal,
      buyer_gstin: clientGST?.gstin,
      seller_gstin: companySettings?.gstin,
      place_of_supply: clientGST?.state_code,
      invoice_type: invoiceType,
      // ... other fields
    }])
    .select()
    .single()
  
  // Create line items with GST fields
  const itemsToInsert = lineItems.map(item => ({
    quotation_id: quotation.id,
    material_id: item.material_id,
    category: item.category,
    description: item.material_name + (item.description ? ' - ' + item.description : ''),
    hsn_sac_code: item.hsn_sac_code,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    taxable_value: item.taxable_value,
    tax_rate: item.tax_rate,
    gst_amount: item.gst_amount,
    cgst_amount: item.cgst_amount,
    sgst_amount: item.sgst_amount,
    igst_amount: item.igst_amount,
    total: item.total
  }))
  
  await supabase.from('quote_items').insert(itemsToInsert)
}
```

---

## 🎨 UI Components to Add

### **1. Transaction Info Card**
```tsx
<div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
  <h3 className="text-sm font-semibold text-blue-400 mb-2">Transaction Information</h3>
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span className="text-zinc-400">Type:</span>
      <span className="ml-2 text-white">{invoiceType} ({isIntraState ? 'Intra-State' : 'Inter-State'})</span>
    </div>
    <div>
      <span className="text-zinc-400">Seller GSTIN:</span>
      <span className="ml-2 text-white">{companySettings?.gstin}</span>
    </div>
    <div>
      <span className="text-zinc-400">Buyer GSTIN:</span>
      <span className="ml-2 text-white">{clientGST?.gstin || 'N/A (B2C)'}</span>
    </div>
    <div>
      <span className="text-zinc-400">Place of Supply:</span>
      <span className="ml-2 text-white">{clientGST?.state_code}</span>
    </div>
  </div>
</div>
```

### **2. HSN/SAC Selector Column**
```tsx
<td className="px-4 py-3">
  <select
    value={item.hsn_sac_code}
    onChange={(e) => {
      const code = hsnSacCodes.find(c => c.code === e.target.value)
      updateLineItem(item.id, 'hsn_sac_code', e.target.value)
      if (code) {
        updateLineItem(item.id, 'tax_rate', code.gst_rate)
      }
    }}
    className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
  >
    <option value="">Select HSN/SAC</option>
    {hsnSacCodes.map(code => (
      <option key={code.code} value={code.code}>
        {code.code} - {code.description}
      </option>
    ))}
  </select>
</td>
```

### **3. GST Breakdown Card**
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
  <h3 className="text-lg font-semibold text-white mb-4">GST Breakdown</h3>
  <div className="space-y-2">
    <div className="flex justify-between text-zinc-300">
      <span>Subtotal (Taxable Amount):</span>
      <span className="font-semibold">{formatIndianCurrency(gstBreakdown.subtotal)}</span>
    </div>
    
    {isIntraState ? (
      <>
        <div className="flex justify-between text-zinc-300">
          <span>CGST @ 9%:</span>
          <span>{formatIndianCurrency(gstBreakdown.totalCGST)}</span>
        </div>
        <div className="flex justify-between text-zinc-300">
          <span>SGST @ 9%:</span>
          <span>{formatIndianCurrency(gstBreakdown.totalSGST)}</span>
        </div>
      </>
    ) : (
      <div className="flex justify-between text-zinc-300">
        <span>IGST @ 18%:</span>
        <span>{formatIndianCurrency(gstBreakdown.totalIGST)}</span>
      </div>
    )}
    
    <div className="border-t border-zinc-700 pt-2 mt-2">
      <div className="flex justify-between text-white font-semibold">
        <span>Total GST:</span>
        <span className="text-yellow-600">{formatIndianCurrency(gstBreakdown.totalGST)}</span>
      </div>
    </div>
    
    <div className="border-t border-zinc-700 pt-2 mt-2">
      <div className="flex justify-between text-white text-lg font-bold">
        <span>Grand Total:</span>
        <span className="text-emerald-600">{formatIndianCurrency(gstBreakdown.grandTotal)}</span>
      </div>
    </div>
  </div>
</div>
```

---

## ✅ Testing Checklist

- [ ] Fetch company GSTIN and state code
- [ ] Fetch client GSTIN when project is selected
- [ ] Detect B2B vs B2C correctly
- [ ] Detect intra-state vs inter-state correctly
- [ ] HSN/SAC dropdown populates from database
- [ ] Selecting HSN/SAC auto-fills GST rate
- [ ] Line item GST calculations are correct
- [ ] CGST/SGST shown for intra-state
- [ ] IGST shown for inter-state
- [ ] GST breakdown totals are correct
- [ ] All GST fields save to database
- [ ] Quotation can be retrieved with GST data

---

## 🎯 Success Criteria

1. **Accurate GST Calculations** - All amounts match manual calculations
2. **Correct Tax Split** - CGST/SGST for intra-state, IGST for inter-state
3. **HSN/SAC Integration** - Codes from master table, auto-fill rates
4. **Professional UI** - Clear GST breakdown, transaction info
5. **Database Persistence** - All GST fields save and retrieve correctly
6. **Audit Ready** - Complete trail of GST calculations

---

**Next:** Implement these enhancements in the quotation builder!
