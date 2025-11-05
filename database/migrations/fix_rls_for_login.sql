-- ============================================================================
-- Fix RLS Policies for Login Access
-- ============================================================================
-- This ensures users can read their own profile during login
-- ============================================================================

-- Drop and recreate the policy for users viewing their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Create policy that allows users to SELECT their own profile
-- This is critical for login to work properly
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Also ensure anon users can't access any profiles
DROP POLICY IF EXISTS "Prevent anonymous access" ON user_profiles;

CREATE POLICY "Prevent anonymous access" 
ON user_profiles FOR SELECT 
TO anon
USING (false);

-- Verify RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed! Users can now read their own profiles during login.';
END $$;

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;
