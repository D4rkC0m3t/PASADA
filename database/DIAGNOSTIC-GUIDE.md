# 🔍 Database Diagnostic Guide

## Step 1: Run Diagnostic Script

### **In Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard/project/eoahwxdhvdfgllolzoxd/editor
2. Click: **SQL Editor** → **New Query**
3. Copy entire file: `database/migrations/00_CHECK_EXISTING.sql`
4. Paste and click **RUN**

---

## Step 2: Review Results

The script will show you:

### ✅ **What to Look For:**

1. **EXISTING TABLES**
   - Does `user_profiles` exist?
   - Does `leads` exist?
   - Does `audit_logs` exist?

2. **TABLE STRUCTURES**
   - If tables exist, what columns do they have?
   - Are columns correct?

3. **RLS POLICIES**
   - What policies are already created?
   - Are they causing conflicts?

4. **FOREIGN KEYS**
   - Are foreign key constraints set up?
   - Are they referencing auth.users correctly?

5. **INDEXES**
   - What indexes exist?
   - Are they on the right columns?

6. **TRIGGERS & FUNCTIONS**
   - What triggers are active?
   - What functions exist?

---

## Step 3: Share Results

After running the diagnostic, share the output here so I can:

1. ✅ See exactly what exists
2. ✅ Identify what's missing
3. ✅ Create a migration that ONLY adds what's needed
4. ✅ Avoid conflicts with existing objects

---

## 📋 Expected Scenarios

### **Scenario A: Nothing Exists**
```
❌ user_profiles MISSING
❌ leads MISSING
❌ audit_logs MISSING
```
**Action**: Create everything from scratch

### **Scenario B: Partial Setup**
```
✅ user_profiles EXISTS (but missing columns)
❌ leads MISSING
❌ audit_logs MISSING
```
**Action**: Alter existing table, create missing tables

### **Scenario C: Tables Exist, Policies Missing**
```
✅ user_profiles EXISTS
✅ leads EXISTS
✅ audit_logs EXISTS
❌ No RLS policies
```
**Action**: Only create policies

### **Scenario D: Everything Exists**
```
✅ All tables exist
✅ All policies exist
```
**Action**: Just verify and test

---

## 🎯 Why This Approach Works

Instead of blindly running migrations:
1. ✅ We see the current state
2. ✅ We identify gaps
3. ✅ We create targeted fixes
4. ✅ We avoid "already exists" errors
5. ✅ We avoid "does not exist" errors

---

## 📞 Next Steps

1. Run `00_CHECK_EXISTING.sql`
2. Copy the output
3. Share it here
4. I'll create the perfect migration based on actual state

---

*This is the professional way to handle database migrations!* ✅
