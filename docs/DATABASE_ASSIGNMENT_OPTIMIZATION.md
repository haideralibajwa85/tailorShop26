# DATABASE OPTIMIZATION: Assignment Uniqueness

This document details the database improvements made to prevent duplicate stitcher assignments and ensure data integrity.

## Problem Identified
The initial assignment logic could potentially create multiple rows in the `work_assignments` table for a single `order_id` if the user clicked the dropdown multiple times or if a network lag occurred. This caused the UI to sometimes show "Unassigned" because the fetch logic was confused by multiple records.

## SQL Fix (Enforced Uniqueness)
The following script cleans up existing duplicates and prevents future ones by adding a `UNIQUE` constraint on the `order_id` column.

```sql
-- migration: optimize_work_assignments.sql

-- 1. Cleanup: Remove older duplicates for the same order
DELETE FROM public.work_assignments a
USING public.work_assignments b
WHERE a.id < b.id AND a.order_id = b.order_id;

-- 2. Integrity: Add a unique constraint to order_id
-- This ensures that 1 Order ID can have exactly 1 record in this table.
ALTER TABLE public.work_assignments 
ADD CONSTRAINT unique_order_assignment UNIQUE (order_id);

-- 3. Re-verify the tailor_id column (required for attribution)
ALTER TABLE public.work_assignments 
ADD COLUMN IF NOT EXISTS tailor_id UUID REFERENCES public.users(id);
```

## Benefits
- **Zero Duplicates**: The database now rejects any attempt to create a second assignment for the same order, forcing the logic to use `.update()` instead.
- **Faster Queries**: Unique constraints automatically create indexes, making the "Live Work Tracker" load much faster.
- **Reliable UI**: There is now a 1-to-1 relationship between an Order and its Assignment status, ensuring the dashboard always shows the correct name.
