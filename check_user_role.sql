-- Check current role of bajwa.376@gmail.com
SELECT id, email, full_name, role, organization_id 
FROM public.users 
WHERE email = 'bajwa.376@gmail.com';

-- If you want to test as a TAILOR, uncomment and run this:
-- UPDATE public.users 
-- SET role = 'tailor' 
-- WHERE email = 'bajwa.376@gmail.com';

-- To change back to superadmin later:
-- UPDATE public.users 
-- SET role = 'superadmin' 
-- WHERE email = 'bajwa.376@gmail.com';
