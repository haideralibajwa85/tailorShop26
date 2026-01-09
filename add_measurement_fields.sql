-- Add missing measurement columns to order_measurements table

ALTER TABLE IF EXISTS order_measurements
ADD COLUMN IF NOT EXISTS bicep text,
ADD COLUMN IF NOT EXISTS cuff text,
ADD COLUMN IF NOT EXISTS seat text,
ADD COLUMN IF NOT EXISTS knee text,
ADD COLUMN IF NOT EXISTS ankle text,
ADD COLUMN IF NOT EXISTS measurement_notes text;
