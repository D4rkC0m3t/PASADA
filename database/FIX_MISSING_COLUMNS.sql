-- ============================================
-- FIX MISSING COLUMNS - Run this FIRST
-- This adds missing columns to existing tables
-- ============================================

-- Fix clients table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE clients ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'contact_name'
    ) THEN
        ALTER TABLE clients ADD COLUMN contact_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'state_code'
    ) THEN
        ALTER TABLE clients ADD COLUMN state_code TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'gstin'
    ) THEN
        ALTER TABLE clients ADD COLUMN gstin TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'client_type'
    ) THEN
        ALTER TABLE clients ADD COLUMN client_type TEXT DEFAULT 'B2C';
    END IF;
END $$;

-- Fix projects table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'description'
    ) THEN
        ALTER TABLE projects ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'site_location'
    ) THEN
        ALTER TABLE projects ADD COLUMN site_location TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Fix materials table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'materials') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'materials' AND column_name = 'is_active'
        ) THEN
            ALTER TABLE materials ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
    END IF;
END $$;

-- Fix quotations table GST columns (if missing)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotations') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'quotations' AND column_name = 'gst_rate'
        ) THEN
            ALTER TABLE quotations ADD COLUMN gst_rate NUMERIC(5,2);
            ALTER TABLE quotations ADD COLUMN gst_amount NUMERIC(12,2);
            ALTER TABLE quotations ADD COLUMN cgst_amount NUMERIC(12,2);
            ALTER TABLE quotations ADD COLUMN sgst_amount NUMERIC(12,2);
            ALTER TABLE quotations ADD COLUMN igst_amount NUMERIC(12,2);
            ALTER TABLE quotations ADD COLUMN total_with_gst NUMERIC(12,2);
            ALTER TABLE quotations ADD COLUMN buyer_gstin TEXT;
            ALTER TABLE quotations ADD COLUMN seller_gstin TEXT;
            ALTER TABLE quotations ADD COLUMN place_of_supply TEXT;
            ALTER TABLE quotations ADD COLUMN invoice_type TEXT;
        END IF;
    END IF;
END $$;

-- Fix user_profiles table (if missing columns)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Add name column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'name'
        ) THEN
            ALTER TABLE user_profiles ADD COLUMN name TEXT;
        END IF;
        
        -- Add phone column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'phone'
        ) THEN
            ALTER TABLE user_profiles ADD COLUMN phone TEXT;
        END IF;
        
        -- Add company column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'company'
        ) THEN
            ALTER TABLE user_profiles ADD COLUMN company TEXT;
        END IF;
    END IF;
END $$;

-- ============================================
-- VERIFICATION - Check what we fixed
-- ============================================

-- Show all clients table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS! Now you can run QUICK_SETUP_ALL_TABLES.sql
-- ============================================
