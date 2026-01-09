-- Fix Missing Categories and Clothing Types & RLS

-- 1. Relax Constraints (Allow Global Options)
ALTER TABLE IF EXISTS clothing_types ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE IF EXISTS categories ALTER COLUMN organization_id DROP NOT NULL;

-- 2. Enable RLS
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clothing_types ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access
DROP POLICY IF EXISTS "Allow read access for all users" ON categories;
CREATE POLICY "Allow read access for all users" ON categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow read access for all users" ON clothing_types;
CREATE POLICY "Allow read access for all users" ON clothing_types FOR SELECT TO authenticated USING (true);

-- 4. Add Unique Constraints (Required for ON CONFLICT)
DO $$
BEGIN
    -- Constraint for categories(name)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;

    -- Constraint for clothing_types(name, category_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clothing_types_name_category_id_key') THEN
        ALTER TABLE clothing_types ADD CONSTRAINT clothing_types_name_category_id_key UNIQUE (name, category_id);
    END IF;
END
$$;

-- 5. Seed Data
-- Categories
INSERT INTO categories (name) VALUES
('Shalwar Kameez'),
('Saudi Traditional Wear'),
('Thobe'),
('Waistcoat'),
('Abaya'),
('Other')
ON CONFLICT (name) DO NOTHING;

-- Clothing Types
INSERT INTO clothing_types (category_id, name)
SELECT id, 'Simple Shalwar Kameez' FROM categories WHERE name = 'Shalwar Kameez'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Designer Shalwar Kameez' FROM categories WHERE name = 'Shalwar Kameez'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Simple Thobe' FROM categories WHERE name = 'Saudi Traditional Wear'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Embroidered Thobe' FROM categories WHERE name = 'Saudi Traditional Wear'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Standard Thobe' FROM categories WHERE name = 'Thobe'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Plain Waistcoat' FROM categories WHERE name = 'Waistcoat'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Banarasi Waistcoat' FROM categories WHERE name = 'Waistcoat'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Simple Abaya' FROM categories WHERE name = 'Abaya'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Designer Abaya' FROM categories WHERE name = 'Abaya'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO clothing_types (category_id, name)
SELECT id, 'Custom' FROM categories WHERE name = 'Other'
ON CONFLICT (name, category_id) DO NOTHING;
