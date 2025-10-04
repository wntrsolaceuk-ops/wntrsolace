-- Fix RLS policies for product deletion by admin users
-- This will allow admin users to delete products

-- First, let's check current policies on products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable delete for admin users" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable delete for service role" ON products;

-- Create new policy to allow admin users to delete products
CREATE POLICY "Enable delete for admin users" ON products
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

-- Also allow service role to delete (for admin operations)
CREATE POLICY "Enable delete for service role" ON products
FOR DELETE
TO service_role
USING (true);

-- Check if RLS is enabled on products table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';

-- If RLS is not enabled, enable it
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';
