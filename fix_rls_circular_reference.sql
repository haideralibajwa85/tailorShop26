-- Fix RLS policies for users table to avoid circular references
-- Run this in Supabase SQL Editor

-- First, drop ALL existing policies on the users table
DROP POLICY IF EXISTS "Tailors can view customers in their organization" ON users;
DROP POLICY IF EXISTS "Tailors can insert customers in their organization" ON users;
DROP POLICY IF EXISTS "Tailors can update customers in their organization" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Tailors and admins can view organization users" ON users;
DROP POLICY IF EXISTS "Tailors can insert customers" ON users;
DROP POLICY IF EXISTS "Tailors can update customers" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a simpler approach: Allow users to view their own profile always
-- This breaks the circular dependency
CREATE POLICY "Users can view own profile" ON users
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Allow superadmins to view ALL users
CREATE POLICY "Superadmins can view all users" ON users
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users AS u
        WHERE u.id = auth.uid() 
        AND u.role = 'superadmin'
    )
);

-- Allow tailors and admins to view all users in their organization
CREATE POLICY "Tailors and admins can view organization users" ON users
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users AS u
        WHERE u.id = auth.uid() 
        AND u.role IN ('tailor', 'admin')
        AND u.organization_id = users.organization_id
        AND u.organization_id IS NOT NULL
    )
);

-- Allow superadmins to insert any user
CREATE POLICY "Superadmins can insert any user" ON users
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users AS u
        WHERE u.id = auth.uid() 
        AND u.role = 'superadmin'
    )
);

-- Allow tailors to insert customers in their organization
CREATE POLICY "Tailors can insert customers" ON users
FOR INSERT TO authenticated
WITH CHECK (
    role = 'customer' 
    AND EXISTS (
        SELECT 1 FROM users AS u
        WHERE u.id = auth.uid() 
        AND u.role = 'tailor'
        AND u.organization_id = organization_id
    )
);

-- Allow superadmins to update any user
CREATE POLICY "Superadmins can update any user" ON users
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users AS u
        WHERE u.id = auth.uid() 
        AND u.role = 'superadmin'
    )
);

-- Allow tailors to update customers in their organization
CREATE POLICY "Tailors can update customers" ON users
FOR UPDATE TO authenticated
USING (
    role = 'customer' 
    AND EXISTS (
        SELECT 1 FROM users AS u
        WHERE u.id = auth.uid() 
        AND u.role = 'tailor'
        AND u.organization_id = users.organization_id
    )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE TO authenticated
USING (id = auth.uid());
