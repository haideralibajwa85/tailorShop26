-- Fix Work Assignments Table & Permissions

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS work_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    stitcher_id UUID REFERENCES users(id) ON DELETE SET NULL, -- The stitcher
    tailor_id UUID REFERENCES users(id) ON DELETE SET NULL,   -- The assigner
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable RLS
ALTER TABLE work_assignments ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- Policy: Tailors can ASSIGN (Insert)
-- Check if tailors can insert
DROP POLICY IF EXISTS "Tailors can create assignments" ON work_assignments;
CREATE POLICY "Tailors can create assignments" ON work_assignments
FOR INSERT TO authenticated
WITH CHECK (
    -- Allow if the user is a tailor
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'tailor')
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Policy: Tailors can VIEW assignments (Select)
-- They should see assignments they created OR assignments in their organization (better)
DROP POLICY IF EXISTS "Tailors can view assignments" ON work_assignments;
CREATE POLICY "Tailors can view assignments" ON work_assignments
FOR SELECT TO authenticated
USING (
    tailor_id = auth.uid() 
    OR 
    stitcher_id = auth.uid() -- Stitchers can see their own
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Policy: Tailors/Stitchers can UPDATE assignments (e.g. status)
DROP POLICY IF EXISTS "Team can update assignments" ON work_assignments;
CREATE POLICY "Team can update assignments" ON work_assignments
FOR UPDATE TO authenticated
USING (
    tailor_id = auth.uid() 
    OR 
    stitcher_id = auth.uid()
)
WITH CHECK (
    tailor_id = auth.uid() 
    OR 
    stitcher_id = auth.uid()
);
