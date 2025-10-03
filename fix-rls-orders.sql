-- Fix RLS policies for orders table to allow order creation
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

-- Create new policies that allow order creation
-- Policy 1: Allow authenticated users to insert orders
CREATE POLICY "Authenticated users can insert orders" ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 2: Allow users to view their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy 3: Allow users to update their own orders
CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy 4: Allow admins to manage all orders
CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            'wntrsolace.uk@gmail.com',
            'admin2@wntrsolace.com'
        )
    );

-- Policy 5: Allow anonymous users to insert orders (for guest checkout)
CREATE POLICY "Anonymous users can insert orders" ON orders
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy 6: Allow anonymous users to view orders by email (for order confirmation)
CREATE POLICY "Anonymous users can view orders by email" ON orders
    FOR SELECT
    TO anon
    USING (true);
