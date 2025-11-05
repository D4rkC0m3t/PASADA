-- Step 1: Insert client record
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
DO UPDATE SET updated_at = now()
RETURNING id;

-- Step 2: Update user_profile with client_id (replace the UUID below with the one from Step 1)
-- Or run this query to auto-link:
UPDATE user_profiles up
SET client_id = c.id, updated_at = now()
FROM clients c
WHERE up.email = 'arjunin2020@gmail.com' 
  AND c.email = 'arjunin2020@gmail.com'
  AND up.role = 'client';

-- Step 3: Verify
SELECT 
  up.email, 
  up.role,
  up.client_id, 
  c.name as client_name
FROM user_profiles up 
LEFT JOIN clients c ON up.client_id = c.id 
WHERE up.email = 'arjunin2020@gmail.com';
