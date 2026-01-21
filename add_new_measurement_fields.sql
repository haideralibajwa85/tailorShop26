-- Add missing measurement and style columns to order_measurements table
ALTER TABLE IF EXISTS order_measurements
ADD COLUMN IF NOT EXISTS armhole text,
ADD COLUMN IF NOT EXISTS collar_size text,
ADD COLUMN IF NOT EXISTS front_patti_length text,
ADD COLUMN IF NOT EXISTS side_chak_length text,
ADD COLUMN IF NOT EXISTS daman_width text,
ADD COLUMN IF NOT EXISTS fit_type text,
ADD COLUMN IF NOT EXISTS collar_style text,
ADD COLUMN IF NOT EXISTS sleeve_style text,
ADD COLUMN IF NOT EXISTS daman_style text,
ADD COLUMN IF NOT EXISTS pocket_kameez text,
ADD COLUMN IF NOT EXISTS thigh text,
ADD COLUMN IF NOT EXISTS shalwar_type text,
ADD COLUMN IF NOT EXISTS waist_style text,
ADD COLUMN IF NOT EXISTS pocket_type text;
