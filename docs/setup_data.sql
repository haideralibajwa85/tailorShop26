-- ==========================================
-- CORRECTED DUMMY DATA SCRIPT
-- ==========================================

-- PROBLEM: You cannot manually insert users into 'public.users' if they don't exist in 'auth.users' first.
-- SOLUTION: 
-- 1. Register the users via the website (http://localhost:3000/auth/register).
-- 2. Then run the UPDATE commands below to set their roles.
-- 3. Then run the INSERT command to add dummy orders for them.

-- ==========================================
-- 1. SET ROLES (Run this AFTER registering these emails)
-- ==========================================

-- Make a user an ADMIN (Replace with the email you registered)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@test.com'; -- <--- CHANGE THIS EMAIL

-- Make a user a TAILOR (Replace with the email you registered)
UPDATE public.users 
SET role = 'tailor' 
WHERE email = 'tailor@test.com'; -- <--- CHANGE THIS EMAIL

-- ==========================================
-- 2. ADD DUMMY ORDERS (For a specific customer)
-- ==========================================

-- This will add an order for the user with email 'bajwa.376@gmail.com'
-- Make sure this user exists in public.users first!

INSERT INTO public.orders (
    customer_id, 
    order_id, 
    category, 
    clothing_type, 
    gender, 
    quantity, 
    fabric_type, 
    color, 
    status, 
    order_date, 
    expected_completion_date,
    total_amount
)
SELECT 
    id, 
    'TS-DEMO-' || FLOOR(RANDOM() * 1000)::text, 
    'Shalwar Kameez', 
    'Simple Shalwar Kameez', 
    'male', 
    2, 
    'Cotton', 
    'White', 
    'pending', 
    CURRENT_DATE, 
    CURRENT_DATE + 7,
    1500.00
FROM public.users 
WHERE email = 'bajwa.376@gmail.com' -- <--- The order will be assigned to this user
ON CONFLICT DO NOTHING;

-- Add another completed order
INSERT INTO public.orders (
    customer_id, 
    order_id, 
    category, 
    clothing_type, 
    gender, 
    quantity, 
    fabric_type, 
    color, 
    status, 
    order_date, 
    expected_completion_date,
    total_amount
)
SELECT 
    id, 
    'TS-DEMO-' || FLOOR(RANDOM() * 1000)::text, 
    'Saudi Traditional Wear', 
    'Thobe (Dishdasha)', 
    'male', 
    1, 
    'Polyester', 
    'Black', 
    'completed', 
    CURRENT_DATE - 10, 
    CURRENT_DATE - 3,
    800.00
FROM public.users 
WHERE email = 'bajwa.376@gmail.com'
ON CONFLICT DO NOTHING;
