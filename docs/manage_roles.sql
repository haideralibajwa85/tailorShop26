-- ==========================================
-- ROLE TOGGLE SCRIPT
-- ==========================================
-- Use this script to switch your ONE account (bajwa.376@gmail.com) 
-- between different roles to test different Dashboards.

-- ------------------------------------------
-- OPTION 1: BECOME AN ADMIN
-- ------------------------------------------
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'bajwa.376@gmail.com';

-- After running this:
-- 1. Refresh the website.
-- 2. You should be redirected to /admin/dashboard (or click it manually).

-- ------------------------------------------
-- OPTION 2: BECOME A TAILOR
-- ------------------------------------------
/*
UPDATE public.users 
SET role = 'tailor' 
WHERE email = 'bajwa.376@gmail.com';
*/

-- ------------------------------------------
-- OPTION 3: BECOME A CUSTOMER (Default)
-- ------------------------------------------
/*
UPDATE public.users 
SET role = 'customer' 
WHERE email = 'bajwa.376@gmail.com';
*/

-- ==========================================
-- CHECK YOUR CURRENT ROLE
-- ==========================================
SELECT email, role FROM public.users WHERE email = 'bajwa.376@gmail.com';
