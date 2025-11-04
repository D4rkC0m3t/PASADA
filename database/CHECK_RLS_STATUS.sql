-- Check if RLS is enabled or disabled
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '❌ RLS IS ENABLED (This is the problem!)'
        WHEN rowsecurity = false THEN '✅ RLS IS DISABLED (Good!)'
        ELSE 'Unknown'
    END as status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- Check if there are any policies still active
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    'Policy exists - should be dropped!' as note
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public';
