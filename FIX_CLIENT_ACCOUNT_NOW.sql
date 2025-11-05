-- ================================================
-- QUICK FIX: Link Your Client Account
-- ================================================
-- Run this in Supabase SQL Editor to fix your account
-- Replace 'your-email@example.com' with your actual email

-- Create client record and link it to your user profile
WITH new_client AS (
  INSERT INTO clients (name, contact_name, email, phone, status, type)
  SELECT 
    COALESCE(up.full_name, up.email) as name,
    COALESCE(up.full_name, up.email) as contact_name,
    up.email,
    up.phone,
    'active' as status,
    'residential' as type
  FROM user_profiles up
  WHERE up.email = 'arjunin2020@gmail.com' AND up.role = 'client'
  ON CONFLICT (email) DO UPDATE 
    SET updated_at = now()
  RETURNING id
)
UPDATE user_profiles
SET 
  client_id = (SELECT id FROM new_client), 
  updated_at = now()
WHERE email = 'arjunin2020@gmail.com' AND role = 'client';

-- Verify the fix worked
SELECT 
  up.email, 
  up.role,
  up.client_id, 
  c.name as client_name,
  c.contact_name
FROM user_profiles up 
LEFT JOIN clients c ON up.client_id = c.id 
WHERE up.email = 'arjunin2020@gmail.com';

-- You should see:
-- email: arjunin2020@gmail.com
-- role: client
-- client_id: [some UUID]
-- client_name: [your name]
-- contact_name: [your name]
