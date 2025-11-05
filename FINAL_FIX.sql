-- ================================================
-- COPY THIS AND RUN IN SUPABASE DASHBOARD
-- ================================================
-- Go to: https://supabase.com/dashboard
-- Select your project → SQL Editor → New Query
-- Paste this and click RUN

-- Step 1: Create client record
INSERT INTO clients (name, contact_name, email, phone, status, type, created_at, updated_at)
VALUES (
  'Arjun',
  'Arjun',
  'arjunin2020@gmail.com',
  NULL,
  'active',
  'residential',
  now(),
  now()
)
ON CONFLICT (email) 
DO UPDATE SET updated_at = now();

-- Step 2: Link user profile to client
UPDATE user_profiles
SET 
  client_id = (SELECT id FROM clients WHERE email = 'arjunin2020@gmail.com'),
  updated_at = now()
WHERE email = 'arjunin2020@gmail.com' AND role = 'client';

-- Step 3: Verify (should show your email and a client_id)
SELECT 
  up.email, 
  up.role,
  up.client_id, 
  c.name as client_name
FROM user_profiles up 
LEFT JOIN clients c ON up.client_id = c.id 
WHERE up.email = 'arjunin2020@gmail.com';
