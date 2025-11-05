-- ================================================
-- Fix Existing Client Users Without client_id
-- ================================================
-- This script creates client records for existing client users
-- who don't have a client_id in their user_profiles

-- Step 1: Create clients table entry for each user_profile that has role='client' but no client_id
INSERT INTO clients (name, contact_name, email, phone, status, type, created_at, updated_at)
SELECT 
    COALESCE(up.full_name, up.email) as name,
    COALESCE(up.full_name, up.email) as contact_name,
    up.email,
    up.phone,
    'active' as status,
    'residential' as type,
    now() as created_at,
    now() as updated_at
FROM user_profiles up
WHERE up.role = 'client'
  AND up.client_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM clients c WHERE c.email = up.email
  )
ON CONFLICT (email) DO NOTHING;

-- Step 2: Update user_profiles to link them with their newly created client records
UPDATE user_profiles up
SET client_id = c.id,
    updated_at = now()
FROM clients c
WHERE up.role = 'client'
  AND up.client_id IS NULL
  AND up.email = c.email;

-- Step 3: Verify the update
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.client_id,
    c.name as client_name,
    c.contact_name as client_contact_name
FROM user_profiles up
LEFT JOIN clients c ON up.client_id = c.id
WHERE up.role = 'client';
