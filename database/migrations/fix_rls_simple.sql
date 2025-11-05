-- ============================================================================
-- Simple RLS Fix - Remove Recursive Policies
-- ============================================================================
-- The admin policies were causing recursion by checking user_profiles
-- to determine if user is admin, while trying to access user_profiles
-- ============================================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Prevent anonymous access" ON user_profiles;

-- Create simple, non-recursive policies

-- 1. Allow authenticated users to view their own profile
CREATE POLICY "allow_own_profile_select" 
ON user_profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 2. Allow authenticated users to update their own profile
CREATE POLICY "allow_own_profile_update" 
ON user_profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Allow authenticated users to insert their own profile (for signup)
CREATE POLICY "allow_own_profile_insert" 
ON user_profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Service role has full access (for admin operations via API)
-- No policy needed - service_role bypasses RLS

-- Verify RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Simple RLS policies created successfully!';
    RAISE NOTICE 'Users can now: SELECT, UPDATE, INSERT their own profiles';
    RAISE NOTICE 'Admins: Use service_role key for admin operations';
END $$;

-- Show final policies
SELECT 
    policyname,
    cmd,
    roles[1] as role,
    CASE 
        WHEN policyname LIKE '%select%' THEN 'Read own profile'
        WHEN policyname LIKE '%update%' THEN 'Update own profile'
        WHEN policyname LIKE '%insert%' THEN 'Create own profile'
        ELSE 'Other'
    END as description
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;
