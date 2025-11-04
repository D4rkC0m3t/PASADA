-- ============================================
-- CLEAN SLATE SETUP - Fresh Database
-- WARNING: This DROPS existing tables!
-- Only use if you want to start fresh
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS estimation_items CASCADE;
DROP TABLE IF EXISTS estimations CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- STEP 2: Now run QUICK_SETUP_ALL_TABLES.sql
-- ============================================

-- After running this file, copy and paste the entire
-- QUICK_SETUP_ALL_TABLES.sql file content here and run it.

-- This ensures a completely clean database with no conflicts.
