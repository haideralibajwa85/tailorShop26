-- Tailor Shop Management Database Schema for Supabase (UPDATED)

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clothing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_measurement_history ENABLE ROW LEVEL SECURITY;

-- 1. Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  business_address TEXT,
  business_phone VARCHAR(20),
  business_email VARCHAR(255),
  logo_url TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_by UUID, -- Can be linked to a superadmin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  language_preference VARCHAR(10) DEFAULT 'en' CHECK (language_preference IN ('en', 'ur', 'ar')),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('superadmin', 'admin', 'tailor', 'stitcher', 'customer')),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- 3. Profiles table (for extended user information)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_image_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  preferred_measurement_unit VARCHAR(10) DEFAULT 'inches' CHECK (preferred_measurement_unit IN ('inches', 'cm')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Fabrics table
CREATE TABLE IF NOT EXISTS fabrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_meter DECIMAL(10, 2),
  available_colors TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Clothing types table
CREATE TABLE IF NOT EXISTS clothing_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  base_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL,
  clothing_type VARCHAR(255) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  fabric_type VARCHAR(255),
  color VARCHAR(100),
  stitching_style VARCHAR(255),
  design_reference_url TEXT,
  custom_notes TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_completion_date DATE NOT NULL,
  actual_completion_date DATE,
  pickup_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_stitching', 'completed', 'late', 'completed_not_picked', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Order measurements table
CREATE TABLE IF NOT EXISTS order_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  chest VARCHAR(20),
  waist VARCHAR(20),
  hip VARCHAR(20),
  shoulder VARCHAR(20),
  sleeve_length VARCHAR(20),
  shirt_length VARCHAR(20),
  trouser_length VARCHAR(20),
  neck VARCHAR(20),
  bicep VARCHAR(20),
  cuff VARCHAR(20),
  seat VARCHAR(20),
  knee VARCHAR(20),
  ankle VARCHAR(20),
  measurement_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)
);

-- 9. Staff table (for tracking tailor/stitcher details)
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('tailor', 'stitcher', 'admin')),
  specialization TEXT[],
  experience_years INTEGER,
  hourly_rate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 10. Order assignments (linking orders to tailors/stitchers)
CREATE TABLE IF NOT EXISTS order_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  tailor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Managing tailor
  stitcher_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Assigned stitcher
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  notes TEXT
);

-- 11. Order status logs
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- 12. Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id VARCHAR(100) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'mobile_payment')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Customer measurement history
CREATE TABLE IF NOT EXISTS customer_measurement_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  chest VARCHAR(20),
  waist VARCHAR(20),
  hip VARCHAR(20),
  shoulder VARCHAR(20),
  sleeve_length VARCHAR(20),
  shirt_length VARCHAR(20),
  trouser_length VARCHAR(20),
  neck VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Stitchers Table (Explicitly used in some services)
CREATE TABLE IF NOT EXISTS stitchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  hourly_rate DECIMAL(10, 2),
  specialization TEXT,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tailor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clothing_types_updated_at BEFORE UPDATE ON clothing_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_measurements_updated_at BEFORE UPDATE ON order_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stitchers_updated_at BEFORE UPDATE ON stitchers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('designs', 'designs', true),
       ('measurements', 'measurements', true),
       ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage
CREATE POLICY "Allow public read access to designs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'designs');
CREATE POLICY "Allow public read access to measurements" ON storage.objects FOR SELECT TO public USING (bucket_id = 'measurements');
CREATE POLICY "Allow public read access to profiles" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profiles');

-- RLS Policies (Basic examples, need refinement)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT TO authenticated
      USING (auth.uid() = id OR role = 'admin' OR role = 'superadmin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Admin can view everything in org'
  ) THEN
    CREATE POLICY "Admin can view everything in org" ON users
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
            AND (
              (u.role = 'admin' AND u.organization_id = users.organization_id)
              OR u.role = 'superadmin'
            )
        )
      );
  END IF;
END
$$;

-- Default Data
INSERT INTO organizations (name, slug, is_active) VALUES ('Default Shop', 'default-shop', true) ON CONFLICT DO NOTHING;

INSERT INTO categories (name, description) VALUES 
('Shalwar Kameez', 'Traditional Pakistani clothing'),
('Saudi Traditional Wear', 'Traditional Saudi Arabian clothing')
ON CONFLICT (name) DO NOTHING;

INSERT INTO fabrics (name, description, price_per_meter, available_colors) VALUES
('Cotton', 'Lightweight and breathable fabric', 200.00, ARRAY['white', 'black', 'blue']),
('Linen', 'Natural fabric, great for summer', 300.00, ARRAY['white', 'beige']),
('Silk', 'Luxurious smooth fabric', 800.00, ARRAY['gold', 'red'])
ON CONFLICT (name) DO NOTHING;