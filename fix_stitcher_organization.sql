-- Check and fix stitcher organization_id mismatch
-- This script helps diagnose and fix issues where stitchers don't show up in dropdowns

-- 1. Check current state
SELECT 
    'Tailors' as type,
    id, 
    full_name, 
    email,
    organization_id,
    role
FROM users 
WHERE role = 'tailor';

SELECT 
    'Stitchers' as type,
    id, 
    full_name, 
    email,
    organization_id,
    role
FROM users 
WHERE role = 'stitcher';

-- 2. Fix: Update all stitchers to have the same organization_id as the first tailor
-- (Only run this if you have a single-tailor setup)
UPDATE users
SET organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE role = 'tailor' 
    LIMIT 1
)
WHERE role = 'stitcher' 
AND (organization_id IS NULL OR organization_id != (
    SELECT organization_id 
    FROM users 
    WHERE role = 'tailor' 
    LIMIT 1
));

-- 3. Verify the fix
SELECT 
    'After Fix - Stitchers' as type,
    id, 
    full_name, 
    email,
    organization_id,
    role
FROM users 
WHERE role = 'stitcher';
