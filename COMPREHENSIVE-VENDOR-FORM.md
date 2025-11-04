# Comprehensive Vendor Form Implementation Plan

Due to the large number of fields (35+), I recommend implementing the form in sections. Here's the complete structure:

## Form Sections to Add:

### 1. Request Information (NEW)
```tsx
<div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
  <h2>Request Information</h2>
  - Request Type: Dropdown (Creation/Modification)
  - Title: Dropdown (Mr/Ms/Mrs/Company)
  - Vendor Type: Dropdown (Domestic/Foreign) - This controls which bank section shows
</div>
```

### 2. Basic Information (UPDATE EXISTING)
```tsx
- Vendor/Company Name * (existing)
- Contact Person Name (existing)
- Category (existing - update options to match: Service Provider, Consumables, Capital Items)
- Type of Service/Goods Receipt (NEW - textarea)
```

### 3. Address Information (UPDATE EXISTING)
```tsx
- Street Address (existing)
- City (existing)
- State (existing)
- Zip Code (existing)
- Country (add if missing)
```

### 4. Communication (UPDATE EXISTING)
```tsx
- Telephone (NEW - separate from phone)
- Mobile (NEW - separate from phone)
- Fax (NEW)
- Email (existing)
- E-mail of TSRL SPOC (NEW)
```

### 5. Tax Information (NEW SECTION)
```tsx
<div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
  <h2>Tax Information (if any)</h2>
  - PAN
  - GSTIN
  - MSME No. (with note: If Any, Mention NA if not applicable)
</div>
```

### 6. Bank Details - Indian Vendor (NEW SECTION - Conditional)
```tsx
{formData.vendor_type === 'domestic' && (
  <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
    <h2>Bank Details of Indian Vendor</h2>
    - Name of the beneficiary
    - Bank Name
    - Beneficiary A/C No.
    - Bank branch name
    - Bank IFSC code
  </div>
)}
```

### 7. Bank Details - Foreign Vendor (NEW SECTION - Conditional)
```tsx
{formData.vendor_type === 'foreign' && (
  <div className="bg-pasada-950 border border-pasada-800 rounded-xl p-6">
    <h2>Bank Details of Foreign Vendor</h2>
    - Name of the beneficiary
    - Address of beneficiary
    - Beneficiary A/C No.
    - Bank Name & Branch
    - Bank Address
    - ABA Routing
    - Sort Code
    - IBAN No
    - Swift Code
    - Beneficiary E-mail
  </div>
)}
```

### 8. Payment Details (UPDATE EXISTING)
```tsx
- Payment Method (NEW - dropdown: Cheque/NEFT/RTGS/Bank Transfer/DD)
- Payment Terms (existing - update to show SAP codes: Z010, Z012, Z014)
- Rating (existing)
- Status (existing)
```

### 9. Mandatory Documents (NEW INFO SECTION)
```tsx
<div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-6">
  <h3>Mandatory Documents Required</h3>
  <ul className="list-disc pl-5 space-y-1 text-sm text-pasada-300">
    <li>Cancelled Cheque (With Name of Party on Cheque) / Bank Certificate</li>
    <li>Copy of PAN / Form 60 if no PAN</li>
    <li>GST Certificate / Provisional GST Certificate / Declaration of No GST Registration</li>
    <li>Copy of Valid MSME Certificate (if any)</li>
    <li>Incorporation certificate in case of a company</li>
    <li>Tax Exemption / Lowertax deduction certificate if any</li>
  </ul>
</div>
```

### 10. Other Clarifications (NEW INFO SECTION)
```tsx
<div className="bg-yellow-950/20 border border-yellow-800/30 rounded-xl p-6">
  <h3>Other Clarifications</h3>
  <ul className="list-disc pl-5 space-y-1 text-sm text-pasada-300">
    <li>In case Vendor has provided service from more than one state, separate registration will be required for every state</li>
    <li>In case of modification of existing Company only on account but not restricted to Merger, etc will require New Incorporation Certificate and court order</li>
    <li>Any Update for the Vendor Master will require the necessary documents as mentioned above</li>
    <li>Change in name of the Company only on account but not restricted to Merger, etc will require New Incorporation Certificate and court order</li>
    <li>No Update request will be accepted from vendor directly, it should be routed through TSRL SPOC</li>
  </ul>
</div>
```

### 11. Notes (EXISTING)
```tsx
- Notes textarea (existing)
```

## Implementation Strategy:

**Option 1: Single Long Form** (Current approach)
- Add all sections sequentially
- Use collapsible sections for better UX
- Scroll-based navigation

**Option 2: Multi-Step Wizard** (Recommended for 35+ fields)
- Step 1: Request & Basic Info
- Step 2: Address & Communication
- Step 3: Tax Information
- Step 4: Bank Details
- Step 5: Payment & Documents
- Step 6: Review & Submit

**Option 3: Tabbed Interface**
- Tab 1: Basic Details
- Tab 2: Contact & Address
- Tab 3: Tax & Banking
- Tab 4: Payment Terms
- Tab 5: Documents & Notes

## Next Steps:

1. Choose implementation approach
2. Update form UI with all fields
3. Add conditional rendering for domestic/foreign bank details
4. Update validation logic
5. Test form submission
6. Update database schema if needed

Would you like me to proceed with Option 1 (add all fields to current form) or implement Option 2 (multi-step wizard)?
