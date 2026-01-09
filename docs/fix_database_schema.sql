-- ==========================================
-- FIX ALL MISSING COLUMNS SCRIPT (FINAL)
-- ==========================================

-- The 'orders' table is missing several columns.
-- Please run this ENTIRE block in the Supabase SQL Editor.

-- 1. Add 'order_date' (This was causing your specific error)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;

-- 2. Add other missing columns (gender, fabric, etc.)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'male',
ADD COLUMN IF NOT EXISTS fabric_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS stitching_style VARCHAR(255),
ADD COLUMN IF NOT EXISTS design_reference_url TEXT,
ADD COLUMN IF NOT EXISTS custom_notes TEXT,
ADD COLUMN IF NOT EXISTS actual_completion_date DATE,
ADD COLUMN IF NOT EXISTS pickup_date DATE,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded'));

-- 3. Fix created_at default if needed
ALTER TABLE public.orders 
ALTER COLUMN created_at SET DEFAULT NOW();

-- 4. Verify RLS Policy for Insert (just in case)
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- STEP 2: RUN DUMMY DATA AGAIN
-- ==========================================
-- After seeing "Success" for this script, go back and run 'setup_data.sql' again.
