-- ============================================
-- PASADA CRM - Quick Admin Setup
-- ============================================
-- This script creates an admin user profile for the currently logged-in user
-- Run this in Supabase SQL Editor while logged in as the user you want to make admin

-- Step 1: Check your current user ID
SELECT 
  auth.uid() as my_user_id,
  auth.email() as my_email;

-- Step 2: Create admin profile for current user
-- (Uncomment and run after verifying your user ID above)
INSERT INTO user_profiles (user_id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Step 3: Verify the profile was created
SELECT * FROM user_profiles WHERE user_id = auth.uid();

-- ============================================
-- Alternative: Create admin for specific user by email
-- ============================================
-- Replace 'your-email@example.com' with your actual email

-- INSERT INTO user_profiles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) 
-- DO UPDATE SET role = 'admin';

-- ============================================
-- Test the RLS functions
-- ============================================
-- After creating your admin profile, test these:

-- Check if you're recognized as admin
SELECT 
  auth.uid() as user_id,
  get_user_role() as my_role,
  is_admin() as am_i_admin,
  is_client() as am_i_client;

-- This should return: my_role = 'admin', am_i_admin = true

-- ============================================
-- Create additional users (if needed)
-- ============================================
-- To create other admin or client users:

-- INSERT INTO user_profiles (user_id, role)
-- SELECT id, 'admin'  -- or 'client'
-- FROM auth.users
-- WHERE email = 'other-user@example.com'
-- ON CONFLICT (user_id) 
-- DO UPDATE SET role = 'admin';

-- ============================================
-- Troubleshooting
-- ============================================
-- If you get "user_id does not exist" error:
-- 1. Make sure you've run analytics-schema.sql first
-- 2. Make sure you're logged in to Supabase
-- 3. Try running: SELECT auth.uid(); to verify authentication

-- If queries return NULL:
-- Make sure you're using the SQL Editor in Supabase Dashboard
-- and that you're logged in as an authenticated user
