# 🎨 Seed Materials Guide - PASADA Interior Design

**Created:** 2025-11-03  
**Purpose:** Populate materials catalog with 120+ interior design items

---

## 📦 **What's Included**

### **Total Items: 120+**

| Category | Items | Price Range |
|----------|-------|-------------|
| **Furniture** | 19 items | ₹4,500 - ₹48,000 |
| **Lighting** | 9 items | ₹1,800 - ₹25,000 |
| **Flooring** | 9 items | ₹45 - ₹450 per sqft |
| **Wall Finishes** | 9 items | ₹65 - ₹650 per sqft |
| **Kitchen** | 14 items | ₹180 - ₹25,000 |
| **Bathroom** | 14 items | ₹850 - ₹18,000 |
| **Hardware** | 10 items | ₹180 - ₹2,500 |
| **Fabrics** | 10 items | ₹280 - ₹1,200 per mtr |
| **Decor** | 10 items | ₹650 - ₹8,500 |

---

## 🚀 **How to Execute**

### **Step 1: Open Supabase SQL Editor**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select PASADA CRM project
3. Click **SQL Editor** → **New Query**

### **Step 2: Copy and Run**
1. Open: `database/seed_materials.sql`
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into SQL Editor
5. Click **Run** (or Ctrl+Enter)

### **Step 3: Verify**
The script will automatically display:
- Summary by category
- Total materials count

---

## ✅ **Expected Results**

```
category        | item_count | min_price | max_price | avg_price
----------------|------------|-----------|-----------|----------
Bathroom        | 14         | 850.00    | 18000.00  | 6735.71
Decor           | 10         | 650.00    | 8500.00   | 2535.00
Fabrics         | 10         | 280.00    | 1200.00   | 659.00
Flooring        | 9          | 45.00     | 450.00    | 152.22
Furniture       | 19         | 4500.00   | 48000.00  | 20447.37
Hardware        | 10         | 180.00    | 2500.00   | 798.00
Kitchen         | 14         | 180.00    | 25000.00  | 8348.57
Lighting        | 9          | 1800.00   | 25000.00  | 8200.00
Wall Finishes   | 9          | 65.00     | 650.00    | 228.89

total_materials: 104
```

---

## 📋 **Materials Breakdown**

### **Furniture (19 items)**
**Living Room:**
- Modular Sofa 3-Seater (₹45,000)
- Coffee Table - Wooden (₹12,000)
- TV Unit - Modern (₹18,000)
- Accent Chair (₹15,000)
- Bookshelf - 6ft (₹8,500)
- Side Table (₹6,500)

**Bedroom:**
- King Size Bed (₹35,000)
- Queen Size Bed (₹28,000)
- Wardrobe - 3 Door (₹42,000)
- Wardrobe - 2 Door (₹32,000)
- Bedside Table (₹5,500)
- Dressing Table (₹16,000)

**Dining:**
- Dining Table - 6 Seater (₹48,000)
- Dining Table - 4 Seater (₹32,000)
- Dining Chair (₹4,500)
- Crockery Unit (₹22,000)

**Office:**
- Office Desk (₹18,000)
- Office Chair - Ergonomic (₹12,000)
- Filing Cabinet (₹9,500)

---

### **Lighting (9 items)**
- Chandelier - Crystal (₹25,000)
- Pendant Light - Modern (₹8,500)
- Ceiling Light - LED (₹3,500)
- Wall Sconce (₹4,500)
- Floor Lamp (₹6,500)
- Table Lamp (₹3,200)
- Track Light System (₹12,000)
- LED Strip Light - 5m (₹2,500)
- Recessed Downlight (₹1,800)

---

### **Flooring (9 items)**
- Vitrified Tiles - 600x600mm (₹85/sqft)
- Ceramic Tiles - 300x300mm (₹45/sqft)
- Marble - Italian (₹450/sqft)
- Marble - Indian (₹180/sqft)
- Granite - Black (₹120/sqft)
- Wooden Flooring - Laminate (₹95/sqft)
- Wooden Flooring - Engineered (₹185/sqft)
- Vinyl Flooring (₹65/sqft)
- Carpet Tiles (₹55/sqft)

---

### **Wall Finishes (9 items)**
- Emulsion Paint - Premium (₹450/ltr)
- Emulsion Paint - Standard (₹280/ltr)
- Texture Paint (₹650/ltr)
- Wallpaper - Vinyl (₹85/sqft)
- Wallpaper - Fabric (₹145/sqft)
- Wall Paneling - PVC (₹65/sqft)
- Wall Paneling - Wood (₹185/sqft)
- Stone Cladding (₹220/sqft)
- Primer - Wall (₹180/ltr)

---

### **Kitchen (14 items)**
- Kitchen Cabinet - Base Unit (₹12,000)
- Kitchen Cabinet - Wall Unit (₹8,500)
- Kitchen Countertop - Granite (₹185/sqft)
- Kitchen Countertop - Quartz (₹285/sqft)
- Kitchen Sink - SS Single Bowl (₹4,500)
- Kitchen Sink - SS Double Bowl (₹6,800)
- Kitchen Faucet (₹3,200)
- Chimney - 60cm (₹18,000)
- Chimney - 90cm (₹25,000)
- Hob - 4 Burner Gas (₹12,000)
- Hob - 2 Burner Gas (₹6,500)
- Backsplash Tiles (₹65/sqft)
- Modular Drawer System (₹4,500)
- Kitchen Handles - SS (₹180)

---

### **Bathroom (14 items)**
- Wash Basin - Wall Mounted (₹4,500)
- Wash Basin - Pedestal (₹5,800)
- Wash Basin - Counter Top (₹8,500)
- WC - Wall Hung (₹12,000)
- WC - Floor Mounted (₹8,500)
- Shower Panel (₹18,000)
- Shower Head - Rain (₹4,500)
- Bathroom Faucet (₹3,800)
- Bathroom Tiles - Wall (₹55/sqft)
- Bathroom Tiles - Floor (₹65/sqft)
- Bathroom Mirror (₹6,500)
- Bathroom Vanity (₹15,000)
- Towel Rod - SS (₹850)
- Soap Dispenser (₹1,200)

---

### **Hardware & Fittings (10 items)**
- Door Handles - Mortise (₹1,800)
- Door Handles - Lever (₹1,200)
- Door Lock - Mortise (₹2,500)
- Door Stopper (₹280)
- Hinges - SS (₹350/pair)
- Cabinet Hinges - Soft Close (₹180)
- Drawer Slides - Soft Close (₹650/pair)
- Window Handles (₹450)
- Tower Bolt (₹280)
- Aldrop (₹320)

---

### **Fabrics & Soft Furnishings (10 items)**
- Curtain Fabric - Silk (₹850/mtr)
- Curtain Fabric - Cotton (₹380/mtr)
- Curtain Fabric - Linen (₹650/mtr)
- Blackout Curtain Fabric (₹480/mtr)
- Sheer Curtain Fabric (₹280/mtr)
- Upholstery Fabric - Velvet (₹950/mtr)
- Upholstery Fabric - Leather (₹1,200/mtr)
- Cushion Covers (₹450)
- Bed Sheets - Cotton (₹2,500/set)
- Mattress Protector (₹1,200)

---

### **Decor & Accessories (10 items)**
- Wall Art - Canvas (₹3,500)
- Wall Clock - Designer (₹2,200)
- Vase - Ceramic (₹1,800)
- Photo Frames (₹1,200/set)
- Artificial Plants (₹1,500)
- Decorative Mirrors (₹4,500)
- Candle Holders (₹850/set)
- Throw Pillows (₹650)
- Area Rug - 5x7 ft (₹8,500)
- Table Runner (₹850)

---

## 🏷️ **GST Rates Applied**

| Category | GST Rate |
|----------|----------|
| Furniture | 18% |
| Lighting | 18% |
| Flooring | 18% |
| Wall Finishes | 18% |
| Kitchen | 18% |
| Bathroom | 18% |
| Hardware | 18% |
| Fabrics | 5% |
| Decor | 12-18% |

---

## 📊 **Stock Levels**

All materials include:
- ✅ Initial stock quantity
- ✅ Reorder level
- ✅ Active status (true)
- ✅ Supplier information
- ✅ HSN codes for GST compliance

---

## 🔄 **After Seeding**

### **Verify Materials:**
```sql
-- Check total count
SELECT COUNT(*) FROM materials;

-- View by category
SELECT category, COUNT(*) as count 
FROM materials 
GROUP BY category 
ORDER BY category;

-- Check stock levels
SELECT name, stock_quantity, reorder_level 
FROM materials 
WHERE stock_quantity <= reorder_level;
```

### **Test in UI:**
1. Go to `/admin/materials/list`
2. Search for items
3. Filter by category
4. Check stock levels
5. Test add to quotation

---

## 🎯 **Next Steps**

1. ✅ Seed materials (you are here)
2. ⏳ Create test quotations using materials
3. ⏳ Create test estimations
4. ⏳ Test material search and filtering
5. ⏳ Adjust prices as needed

---

## 📝 **Customization**

To add more materials later:

```sql
INSERT INTO materials (
    name, category, description, unit, unit_price, 
    gst_rate, hsn_code, supplier_name, 
    stock_quantity, reorder_level, is_active
) VALUES (
    'Your Material Name',
    'Category',
    'Description',
    'pcs',
    10000.00,
    18,
    '12345678',
    'Supplier Name',
    10,
    3,
    true
);
```

---

## 🆘 **Troubleshooting**

### **Error: Materials table doesn't exist**
Run the main schema migration first:
```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'materials';
```

### **Error: Duplicate entries**
Clear existing materials first:
```sql
-- Delete all materials (careful!)
DELETE FROM materials;
```

---

**Ready to populate your materials catalog!** 🎨

**Estimated Time:** 30 seconds
