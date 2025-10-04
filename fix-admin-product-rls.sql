-- Fix RLS policies for admin product management
-- This will allow admin users to view, create, update, and delete products

-- First, let's check current policies on products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for admin users" ON products;
DROP POLICY IF EXISTS "Enable insert for admin users" ON products;
DROP POLICY IF EXISTS "Enable update for admin users" ON products;
DROP POLICY IF EXISTS "Enable delete for admin users" ON products;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable read for anon users" ON products;
DROP POLICY IF EXISTS "Enable all for service role" ON products;

-- Create comprehensive policies for admin users

-- 1. SELECT policy - allow admin users to read all products
CREATE POLICY "Enable read for admin users" ON products
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

-- 2. INSERT policy - allow admin users to create products
CREATE POLICY "Enable insert for admin users" ON products
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

-- 3. UPDATE policy - allow admin users to update products
CREATE POLICY "Enable update for admin users" ON products
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

-- 4. DELETE policy - allow admin users to delete products
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

-- 5. Allow public read access for regular users (for product display)
CREATE POLICY "Enable read for anon users" ON products
FOR SELECT
TO anon
USING (true);

-- 6. Allow authenticated users to read products (for product display)
CREATE POLICY "Enable read for authenticated users" ON products
FOR SELECT
TO authenticated
USING (true);

-- 7. Allow service role full access (for admin operations)
CREATE POLICY "Enable all for service role" ON products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Check if RLS is enabled on products table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';

-- If RLS is not enabled, enable it
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- Check if the admin user exists and has admin privileges
SELECT up.id, au.email, up.is_admin 
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'gospelachuenu4321@gmail.com';
