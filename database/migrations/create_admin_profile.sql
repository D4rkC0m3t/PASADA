-- ============================================================================
-- Create Admin Profile
-- ============================================================================
-- Run this AFTER you've logged in at least once to create your auth user
-- ============================================================================

-- Create your admin profile (replace 'Your Name' with your actual name)
INSERT INTO user_profiles (id, full_name, role, is_active)
VALUES (
  auth.uid(),           -- Your current authenticated user ID
  'Admin User',         -- Replace with your name
  'admin',              -- Set as admin role
  true                  -- Active status
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin', 
  is_active = true,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the profile was created
SELECT 
  id,
  full_name,
  role,
  is_active,
  created_at
FROM user_profiles 
WHERE id = auth.uid();

-- Success message
DO $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  RAISE NOTICE 'Admin profile created successfully for: %', v_email;
END $$;
