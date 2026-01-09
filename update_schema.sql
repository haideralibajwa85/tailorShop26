-- Add tailor_id to orders table
ALTER TABLE IF EXISTS orders 
ADD COLUMN IF NOT EXISTS tailor_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_tailor_id ON orders(tailor_id);

-- Update RLS policies for orders
-- Allow tailors to see orders assigned to them
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Tailors can view assigned orders'
    ) THEN
        CREATE POLICY "Tailors can view assigned orders" ON orders 
        FOR SELECT TO authenticated 
        USING (tailor_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Tailors can update assigned orders'
    ) THEN
        CREATE POLICY "Tailors can update assigned orders" ON orders 
        FOR UPDATE TO authenticated 
        USING (tailor_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
    END IF;
END
$$;

-- Allow tailors to view measurements for their orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_measurements' AND policyname = 'Tailors can view measurements for assigned orders'
    ) THEN
        CREATE POLICY "Tailors can view measurements for assigned orders" ON order_measurements
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = order_measurements.order_id 
                AND (orders.tailor_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
            )
        );
    END IF;
END
$$;

-- Allow customers to view their own orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Customers can view own orders'
    ) THEN
        CREATE POLICY "Customers can view own orders" ON orders 
        FOR SELECT TO authenticated 
        USING (customer_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Customers can update own pending orders'
    ) THEN
        CREATE POLICY "Customers can update own pending orders" ON orders 
        FOR UPDATE TO authenticated 
        USING (customer_id = auth.uid() AND status = 'pending');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Customers can delete own pending orders'
    ) THEN
        CREATE POLICY "Customers can delete own pending orders" ON orders 
        FOR DELETE TO authenticated 
        USING (customer_id = auth.uid() AND status = 'pending');
    END IF;
END
$$;

-- Allow customers to view measurements for their orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_measurements' AND policyname = 'Customers can view own measurements'
    ) THEN
        CREATE POLICY "Customers can view own measurements" ON order_measurements
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = order_measurements.order_id 
                AND orders.customer_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_measurements' AND policyname = 'Customers can update own measurements'
    ) THEN
        CREATE POLICY "Customers can update own measurements" ON order_measurements
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = order_measurements.order_id 
                AND orders.customer_id = auth.uid()
                AND orders.status = 'pending'
            )
        );
    END IF;
END
$$;

-- Financial Enhancements
-- Add financial fields to orders
ALTER TABLE IF EXISTS orders 
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(10, 2) DEFAULT 0;

-- Create extra charges table
CREATE TABLE IF NOT EXISTS order_extra_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on extra charges
ALTER TABLE order_extra_charges ENABLE ROW LEVEL SECURITY;

-- RLS for extra charges
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_extra_charges' AND policyname = 'Users can view extra charges for their orders') THEN
        CREATE POLICY "Users can view extra charges for their orders" ON order_extra_charges
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = order_extra_charges.order_id 
                AND (orders.customer_id = auth.uid() OR orders.tailor_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_extra_charges' AND policyname = 'Tailors can manage extra charges for assigned orders') THEN
        CREATE POLICY "Tailors can manage extra charges for assigned orders" ON order_extra_charges
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = order_extra_charges.order_id 
                AND (orders.tailor_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
            )
        );
    END IF;
END
$$;

-- Allow tailors to manage customers in their organization
DO $$
BEGIN
    -- View customers
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Tailors can view customers in their organization') THEN
        CREATE POLICY "Tailors can view customers in their organization" ON users
        FOR SELECT TO authenticated
        USING (
            (role = 'customer' AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'tailor'))
            OR id = auth.uid()
            OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
        );
    END IF;

    -- Insert customers
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Tailors can insert customers in their organization') THEN
        CREATE POLICY "Tailors can insert customers in their organization" ON users
        FOR INSERT TO authenticated
        WITH CHECK (
            role = 'customer' AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'tailor')
        );
    END IF;

    -- Update customers
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Tailors can update customers in their organization') THEN
        CREATE POLICY "Tailors can update customers in their organization" ON users
        FOR UPDATE TO authenticated
        USING (
            role = 'customer' AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'tailor')
        );
    END IF;
END
$$;
