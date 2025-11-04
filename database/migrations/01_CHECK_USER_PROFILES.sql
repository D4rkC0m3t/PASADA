-- ============================================================================
-- Check user_profiles table structure
-- ============================================================================
-- Run this to see what columns user_profiles actually has
-- ============================================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
