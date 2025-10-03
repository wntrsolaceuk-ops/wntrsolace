-- Fix RLS policies for order_items table to allow order item creation
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;

-- Create new policies that allow order item creation
-- Policy 1: Allow authenticated users and anonymous users to insert order items
CREATE POLICY "Users can insert order items" ON order_items
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        -- Allow if user is authenticated and inserting their own order items
        (auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)) OR
        -- Allow if the order has no user_id (guest checkout)
        ((SELECT user_id FROM orders WHERE id = order_id) IS NULL) OR
        -- Allow if user is admin
        (auth.jwt() ->> 'email' IN (
            'wntrsolace.uk@gmail.com',
            'admin2@wntrsolace.com'
        ))
    );

-- Policy 2: Allow users to view order items for their orders
CREATE POLICY "Users can view order items" ON order_items
    FOR SELECT
    TO authenticated, anon
    USING (
        -- Allow if user is authenticated and viewing their own order items
        (auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)) OR
        -- Allow if the order has no user_id (guest checkout)
        ((SELECT user_id FROM orders WHERE id = order_id) IS NULL) OR
        -- Allow if user is admin
        (auth.jwt() ->> 'email' IN (
            'wntrsolace.uk@gmail.com',
            'admin2@wntrsolace.com'
        ))
    );

-- Policy 3: Allow admins to manage all order items
CREATE POLICY "Admins can manage order items" ON order_items
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            'wntrsolace.uk@gmail.com',
            'admin2@wntrsolace.com'
        )
    );
