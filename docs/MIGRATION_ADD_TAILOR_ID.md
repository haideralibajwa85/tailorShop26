# DATABASE MIGRATION: Add Tailor ID to Work Assignments

This document details the database change required to resolve the "Failed to assign stitcher" error seen on the dashboard.

## Error Observed
**Message:** `Could not find the 'tailor_id' column of 'work_assignments' in the schema cache`
**Reason:** The application code was updated to track which tailor makes an assignment, but the Supabase table `work_assignments` did not have a matching column.

## Required Supabase Fix (SQL)
Run the following script in your **Supabase SQL Editor**:

```sql
-- migration: add_tailor_id_to_work_assignments.sql

-- 1. Add the tailor_id column
ALTER TABLE public.work_assignments 
ADD COLUMN IF NOT EXISTS tailor_id UUID REFERENCES public.users(id);

-- 2. (Optional) If you have RLS enabled, ensure the tailor has permission to insert this column
-- Generally, if they can insert into work_assignments, adding a new column won't block them 
-- unless your RLS policy is extremely restrictive on specific columns.
```

## Application Fixes Applied
1.  **Dashboard Logic**: Updated `src/app/tailor/dashboard/page.tsx` to handle the assignment process more robustly.
2.  **Graceful Handling**: The code now constructs the assignment object dynamically. If the database update hasn't been run yet, the error logs will now be even more specific, but running the SQL above is the definitive fix.

## Why this is required
Tracking the `tailor_id` in the `work_assignments` table allows the system to:
- Generate reports on tailor performance.
- Ensure that in shops with multiple tailors, everyone knows who made a specific assignment.
- Maintain data integrity by linking production tasks back to the responsible staff member.
