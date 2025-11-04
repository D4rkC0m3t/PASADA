# 🚀 Next Steps: Quotation Builder GST Enhancement

**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Complexity:** Medium  
**File:** `app/admin/quotations/new/page.tsx`

---

## 📋 Quick Implementation Checklist

### **Phase 1: Setup (30 minutes)**
- [ ] Add imports for GST utilities
- [ ] Update LineItem interface with GST fields
- [ ] Add state variables for company/client GST
- [ ] Create fetch functions for company settings and HSN/SAC codes

### **Phase 2: Core Logic (1 hour)**
- [ ] Implement GST calculation per line item
- [ ] Add auto-calculation on quantity/price change
- [ ] Detect intra-state vs inter-state
- [ ] Calculate CGST/SGST or IGST correctly

### **Phase 3: UI Enhancement (1 hour)**
- [ ] Add HSN/SAC dropdown column
- [ ] Add GST rate column
- [ ] Add transaction info header
- [ ] Add GST breakdown card
- [ ] Update totals display

### **Phase 4: Save & Test (30 minutes)**
- [ ] Update save function with GST fields
- [ ] Test with B2B client (with GSTIN)
- [ ] Test with B2C client (without GSTIN)
- [ ] Test intra-state transaction
- [ ] Test inter-state transaction

---

## 🔧 Step-by-Step Implementation

### **Step 1: Add Imports**

Add to top of file:
```typescript
import { calculateLineItemGST, calculateQuotationGST, formatIndianCurrency } from '@/lib/gst/calculator'
import { Calculator, Info } from 'lucide-react'
```

### **Step 2: Update LineItem Interface**

Replace existing interface:
```typescript
interface LineItem {
  id: string
  material_id: string | null
  material_name: string
  description: string
  category: string
  hsn_sac_code: string          // NEW
  quantity: number
  unit: string
  unit_price: number
  taxable_value: number          // NEW
  tax_rate: number               // NEW (GST rate)
  gst_amount: number             // NEW
  cgst_amount: number            // NEW
  sgst_amount: number            // NEW
  igst_amount: number            // NEW
  total: number                  // Updated (with GST)
}
```

### **Step 3: Add New Interfaces**

```typescript
interface HSNSACCode {
  code: string
  description: string
  type: 'HSN' | 'SAC'
  gst_rate: number
  is_active: boolean
}

interface CompanyGST {
  gstin: string
  state_code: string
}

interface ClientGST {
  gstin: string | null
  state_code: string | null
  client_type: 'B2B' | 'B2C'
}
```

### **Step 4: Add State Variables**

Add after existing useState declarations:
```typescript
const [companyGST, setCompanyGST] = useState<CompanyGST | null>(null)
const [clientGST, setClientGST] = useState<ClientGST | null>(null)
const [hsnSacCodes, setHsnSacCodes] = useState<HSNSACCode[]>([])
const [isIntraState, setIsIntraState] = useState(false)
const [invoiceType, setInvoiceType] = useState<'B2B' | 'B2C'>('B2C')
```

### **Step 5: Add Fetch Functions**

Add after existing fetch functions:
```typescript
const fetchCompanyGST = async () => {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('gstin, state_code')
      .single()
    
    if (error) throw error
    setCompanyGST(data)
  } catch (error) {
    console.error('Error fetching company GST:', error)
  }
}

const fetchClientGST = async (projectId: string) => {
  try {
    const { data, error } = await supabase
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
    
    if (error) throw error
    
    const client = data?.clients as any
    setClientGST(client)
    
    // Determine transaction type
    if (client?.gstin && companyGST?.gstin) {
      setInvoiceType('B2B')
      setIsIntraState(client.state_code === companyGST.state_code)
    } else {
      setInvoiceType('B2C')
      setIsIntraState(true) // Default to intra-state for B2C
    }
  } catch (error) {
    console.error('Error fetching client GST:', error)
  }
}

const fetchHSNSACCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('hsn_sac_master')
      .select('code, description, type, gst_rate, is_active')
      .eq('is_active', true)
      .order('code')
    
    if (error) throw error
    setHsnSacCodes(data || [])
  } catch (error) {
    console.error('Error fetching HSN/SAC codes:', error)
  }
}
```

### **Step 6: Update useEffect**

Replace existing useEffect:
```typescript
useEffect(() => {
  fetchProjects()
  fetchMaterials()
  fetchCompanyGST()
  fetchHSNSACCodes()
}, [])

// Add new useEffect for project selection
useEffect(() => {
  if (formData.project_id && companyGST) {
    fetchClientGST(formData.project_id)
  }
}, [formData.project_id, companyGST])
```

### **Step 7: Update addLineItem Function**

Replace existing function:
```typescript
const addLineItem = (material?: Material) => {
  const quantity = 1
  const unit_price = material?.unit_price || 0
  const tax_rate = 18 // Default GST rate
  
  const taxable_value = quantity * unit_price
  const gst_amount = (taxable_value * tax_rate) / 100
  
  const newItem: LineItem = {
    id: Math.random().toString(36).substring(7),
    material_id: material?.id || null,
    material_name: material?.name || '',
    description: '',
    category: material?.category || 'Labor',
    hsn_sac_code: '',
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
  setShowMaterialSelector(false)
  setMaterialSearch('')
}
```

### **Step 8: Update updateLineItem Function**

Replace existing function:
```typescript
const updateLineItem = (id: string, field: string, value: any) => {
  setLineItems(lineItems.map(item => {
    if (item.id === id) {
      const updated = { ...item, [field]: value }
      
      // Recalculate amounts
      updated.taxable_value = updated.quantity * updated.unit_price
      updated.gst_amount = (updated.taxable_value * updated.tax_rate) / 100
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

### **Step 9: Add GST Calculation Functions**

Add new functions:
```typescript
const calculateGSTBreakdown = () => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.taxable_value, 0)
  const totalCGST = lineItems.reduce((sum, item) => sum + item.cgst_amount, 0)
  const totalSGST = lineItems.reduce((sum, item) => sum + item.sgst_amount, 0)
  const totalIGST = lineItems.reduce((sum, item) => sum + item.igst_amount, 0)
  const totalGST = totalCGST + totalSGST + totalIGST
  const discount = parseFloat(formData.discount) || 0
  const grandTotal = subtotal - discount + totalGST
  
  return {
    subtotal,
    discount,
    taxableAmount: subtotal - discount,
    totalCGST,
    totalSGST,
    totalIGST,
    totalGST,
    grandTotal
  }
}
```

### **Step 10: Update handleSubmit**

Update the save function to include GST fields:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!formData.title || !formData.project_id || lineItems.length === 0) {
    alert('Please fill in all required fields and add at least one line item')
    return
  }

  try {
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const gstBreakdown = calculateGSTBreakdown()

    // Create quotation with GST fields
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert([{
        title: formData.title,
        project_id: formData.project_id,
        subtotal: gstBreakdown.subtotal,
        total_amount: gstBreakdown.subtotal, // Keep for backward compatibility
        gst_rate: 18, // You can calculate weighted average if needed
        gst_amount: gstBreakdown.totalGST,
        cgst_amount: gstBreakdown.totalCGST,
        sgst_amount: gstBreakdown.totalSGST,
        igst_amount: gstBreakdown.totalIGST,
        total_with_gst: gstBreakdown.grandTotal,
        discount: parseFloat(formData.discount) || null,
        buyer_gstin: clientGST?.gstin,
        seller_gstin: companyGST?.gstin,
        place_of_supply: clientGST?.state_code,
        invoice_type: invoiceType,
        status: 'draft',
        version: 1,
        valid_until: formData.valid_until || null,
        notes: formData.notes || null,
        terms: formData.terms || null,
        created_by: user.id
      }])
      .select()
      .single()

    if (quotationError) throw quotationError

    // Create line items with GST fields
    const itemsToInsert = lineItems.map(item => ({
      quotation_id: quotation.id,
      material_id: item.material_id,
      category: item.category,
      description: item.material_name + (item.description ? ' - ' + item.description : ''),
      hsn_sac_code: item.hsn_sac_code || null,
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

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(itemsToInsert)

    if (itemsError) throw itemsError

    router.push('/admin/quotations')
  } catch (error) {
    console.error('Error creating quotation:', error)
    alert('Failed to create quotation. Please try again.')
  } finally {
    setSaving(false)
  }
}
```

---

## 🎨 UI Components to Add

### **1. Transaction Info Card**

Add after the header, before the form:
```tsx
{companyGST && clientGST && (
  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
    <div className="flex items-center mb-3">
      <Info className="w-5 h-5 text-blue-400 mr-2" />
      <h3 className="text-sm font-semibold text-blue-400">Transaction Information</h3>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-zinc-400">Type:</span>
        <span className="ml-2 text-white font-medium">
          {invoiceType} ({isIntraState ? 'Intra-State' : 'Inter-State'})
        </span>
      </div>
      <div>
        <span className="text-zinc-400">Seller GSTIN:</span>
        <span className="ml-2 text-white font-mono">{companyGST.gstin}</span>
      </div>
      <div>
        <span className="text-zinc-400">Buyer GSTIN:</span>
        <span className="ml-2 text-white font-mono">
          {clientGST.gstin || 'N/A (B2C)'}
        </span>
      </div>
      <div>
        <span className="text-zinc-400">Place of Supply:</span>
        <span className="ml-2 text-white">{clientGST.state_code}</span>
      </div>
    </div>
  </div>
)}
```

### **2. Add HSN/SAC Column to Line Items Table**

Update the table header:
```tsx
<thead className="bg-zinc-800">
  <tr>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Item</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">HSN/SAC</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Qty</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Unit</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Rate</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">GST%</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Amount</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">GST</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Total</th>
    <th className="px-4 py-3"></th>
  </tr>
</thead>
```

Add HSN/SAC column in table body:
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
    <option value="">Select</option>
    {hsnSacCodes.map(code => (
      <option key={code.code} value={code.code}>
        {code.code}
      </option>
    ))}
  </select>
</td>
```

### **3. GST Breakdown Card**

Add after the line items table:
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
  <div className="flex items-center mb-4">
    <Calculator className="w-5 h-5 text-yellow-600 mr-2" />
    <h3 className="text-lg font-semibold text-white">GST Breakdown</h3>
  </div>
  
  {(() => {
    const breakdown = calculateGSTBreakdown()
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-zinc-300">
          <span>Subtotal (Taxable Amount):</span>
          <span className="font-semibold">{formatIndianCurrency(breakdown.subtotal)}</span>
        </div>
        
        {breakdown.discount > 0 && (
          <div className="flex justify-between text-zinc-300">
            <span>Discount:</span>
            <span className="text-red-400">- {formatIndianCurrency(breakdown.discount)}</span>
          </div>
        )}
        
        <div className="border-t border-zinc-700 pt-3">
          {isIntraState ? (
            <>
              <div className="flex justify-between text-zinc-300">
                <span>CGST @ 9%:</span>
                <span>{formatIndianCurrency(breakdown.totalCGST)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>SGST @ 9%:</span>
                <span>{formatIndianCurrency(breakdown.totalSGST)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-zinc-300">
              <span>IGST @ 18%:</span>
              <span>{formatIndianCurrency(breakdown.totalIGST)}</span>
            </div>
          )}
        </div>
        
        <div className="border-t border-zinc-700 pt-3">
          <div className="flex justify-between text-white font-semibold">
            <span>Total GST:</span>
            <span className="text-yellow-600">{formatIndianCurrency(breakdown.totalGST)}</span>
          </div>
        </div>
        
        <div className="border-t border-zinc-700 pt-3">
          <div className="flex justify-between text-white text-lg font-bold">
            <span>Grand Total:</span>
            <span className="text-emerald-600">{formatIndianCurrency(breakdown.grandTotal)}</span>
          </div>
        </div>
      </div>
    )
  })()}
</div>
```

---

## ✅ Testing Steps

1. **Test B2B Intra-State:**
   - Select project with Karnataka client (has GSTIN)
   - Company is also Karnataka
   - Add items
   - Verify CGST + SGST shown
   - Verify calculations correct

2. **Test B2B Inter-State:**
   - Select project with Maharashtra client (has GSTIN)
   - Company is Karnataka
   - Add items
   - Verify IGST shown
   - Verify calculations correct

3. **Test B2C:**
   - Select project with client without GSTIN
   - Add items
   - Verify GST calculated (default intra-state)
   - Verify saves correctly

4. **Test HSN/SAC:**
   - Select HSN code from dropdown
   - Verify GST rate auto-fills
   - Change quantity/price
   - Verify GST recalculates

---

## 🎯 Success Criteria

- [ ] Transaction info shows correctly
- [ ] HSN/SAC dropdown works
- [ ] GST calculations are accurate
- [ ] CGST/SGST for intra-state
- [ ] IGST for inter-state
- [ ] GST breakdown displays correctly
- [ ] All fields save to database
- [ ] Can retrieve quotation with GST data

---

**Ready to implement!** Follow these steps and you'll have a fully functional GST-enabled quotation builder! 🚀
