-- ============================================================================
-- Fix User Profiles Table with RLS Policies
-- ============================================================================
-- Description: Ensures user_profiles table exists with proper RLS policies
-- Author: Arjun @ Phoenix
-- Date: 2025-11-05
-- ============================================================================

-- Drop existing table if you want to recreate it fresh (CAUTION: This deletes data!)
-- Uncomment the line below only if you want to start fresh
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'client')),
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN company_id UUID;
    END IF;
END $$;

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public read access for user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON user_profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" 
ON user_profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON user_profiles FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON user_profiles;

CREATE TRIGGER update_user_profiles_updated_at_trigger
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
-- Index for company_id can be added later when companies table exists
-- CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO service_role;

-- Add comments
COMMENT ON TABLE user_profiles IS 'Extended user information with role-based access';
COMMENT ON COLUMN user_profiles.role IS 'User role: admin, staff, or client';
COMMENT ON COLUMN user_profiles.is_active IS 'Whether the user account is active';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User profiles table and RLS policies created successfully!';
END $$;

-- Optional: Add foreign key constraint for company_id later (when companies table exists)
-- ALTER TABLE user_profiles
-- ADD CONSTRAINT fk_user_profiles_company_id 
-- FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
