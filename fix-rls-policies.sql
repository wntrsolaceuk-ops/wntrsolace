-- Fix RLS policies for orders table
-- Run this in your Supabase SQL editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all order cancellations" ON orders;
DROP POLICY IF EXISTS "Users can view their own order cancellations" ON orders;

-- Create new admin policy that doesn't reference auth.users table
CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (
        auth.jwt() ->> 'email' IN ('wntrsolace.uk@gmail.com', 'admin2@wntrsolace.com')
    );

-- Create user policy for viewing their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Alternative: If you want to disable RLS completely for admin control
-- Uncomment the line below:
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Test the policies
-- This should work for admin users:
-- UPDATE orders SET status = 'cancelled' WHERE id = 'your-order-id';
