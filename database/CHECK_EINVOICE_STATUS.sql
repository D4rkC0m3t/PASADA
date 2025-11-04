-- ============================================================================
-- E-INVOICE SYSTEM STATUS CHECK
-- Run this in Supabase SQL Editor to verify implementation status
-- ============================================================================

-- Check if invoice tables exist
SELECT 
    'Tables Exist' as check_type,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('invoices', 'invoice_items', 'payments', 'e_invoice_logs')
ORDER BY table_name;

-- Check invoice table structure
SELECT 
    'Invoice Columns' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('irn', 'ack_no', 'signed_qr_code', 'e_invoice_status') 
        THEN '✅ E-Invoice Field'
        ELSE 'Standard Field'
    END as field_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'invoices'
ORDER BY ordinal_position;

-- Check if any invoices exist
SELECT 
    'Invoice Data' as check_type,
    COUNT(*) as total_invoices,
    COUNT(CASE WHEN e_invoice_status = 'generated' THEN 1 END) as with_irn,
    COUNT(CASE WHEN e_invoice_status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN e_invoice_status = 'failed' THEN 1 END) as failed
FROM invoices;

-- Check invoice items
SELECT 
    'Invoice Items' as check_type,
    COUNT(*) as total_items,
    COUNT(CASE WHEN hsn_sac_code IS NOT NULL THEN 1 END) as with_hsn_sac
FROM invoice_items;

-- Check e_invoice_logs
SELECT 
    'E-Invoice Logs' as check_type,
    COUNT(*) as total_api_calls,
    COUNT(CASE WHEN action = 'generate_irn' THEN 1 END) as irn_generation_attempts,
    COUNT(CASE WHEN action = 'cancel_irn' THEN 1 END) as irn_cancellations
FROM e_invoice_logs;

-- Check RLS policies on invoices
SELECT 
    'RLS Policies' as check_type,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename = 'invoices'
ORDER BY policyname;

-- Check for company_settings table (needed for GST details)
SELECT 
    'Company Settings' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'company_settings'
        ) THEN '✅ Table exists'
        ELSE '❌ Table missing - need to create'
    END as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'company_settings'
        ) THEN (
            SELECT COUNT(*) 
            FROM company_settings
        )::text || ' records'
        ELSE 'N/A'
    END as records;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================
DO $$
DECLARE
    invoices_exists BOOLEAN;
    invoice_items_exists BOOLEAN;
    payments_exists BOOLEAN;
    e_invoice_logs_exists BOOLEAN;
    company_settings_exists BOOLEAN;
BEGIN
    -- Check table existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'invoices'
    ) INTO invoices_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'invoice_items'
    ) INTO invoice_items_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'payments'
    ) INTO payments_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'e_invoice_logs'
    ) INTO e_invoice_logs_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'company_settings'
    ) INTO company_settings_exists;

    -- Print summary
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 E-INVOICE SYSTEM STATUS REPORT';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '🗄️  DATABASE TABLES:';
    RAISE NOTICE '  invoices:         %', CASE WHEN invoices_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '  invoice_items:    %', CASE WHEN invoice_items_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '  payments:         %', CASE WHEN payments_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '  e_invoice_logs:   %', CASE WHEN e_invoice_logs_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '  company_settings: %', CASE WHEN company_settings_exists THEN '✅ EXISTS' ELSE '❌ MISSING - NEEDS CREATION' END;
    RAISE NOTICE '';
    
    IF invoices_exists AND invoice_items_exists AND payments_exists AND e_invoice_logs_exists THEN
        RAISE NOTICE '✅ DATABASE SCHEMA: COMPLETE';
        RAISE NOTICE '';
        RAISE NOTICE '📋 NEXT STEPS:';
        RAISE NOTICE '  1. Create company_settings table (if missing)';
        RAISE NOTICE '  2. Build frontend invoice list page';
        RAISE NOTICE '  3. Build invoice detail page with IRN generation';
        RAISE NOTICE '  4. Configure e-invoice API credentials in .env.local';
        RAISE NOTICE '  5. Test IRN generation in sandbox mode';
    ELSE
        RAISE NOTICE '❌ DATABASE SCHEMA: INCOMPLETE';
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  ACTION REQUIRED:';
        RAISE NOTICE '  Run migration: database/migrations/006_create_invoice_tables.sql';
        RAISE NOTICE '';
        RAISE NOTICE '📝 HOW TO FIX:';
        RAISE NOTICE '  1. Open Supabase SQL Editor';
        RAISE NOTICE '  2. Copy contents of: 006_create_invoice_tables.sql';
        RAISE NOTICE '  3. Paste and Run';
        RAISE NOTICE '  4. Re-run this status check';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
