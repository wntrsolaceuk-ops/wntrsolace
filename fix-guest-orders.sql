-- Fix RLS policy to allow guest orders (user_id = null)
-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

-- Create a new policy that allows both authenticated and guest orders
CREATE POLICY "Users can insert orders" ON orders
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        -- Allow if user is authenticated and inserting their own order
        (auth.uid() = user_id) OR
        -- Allow if user_id is null (guest checkout)
        (user_id IS NULL) OR
        -- Allow if user is admin
        (auth.jwt() ->> 'email' IN (
            'wntrsolace.uk@gmail.com',
            'admin2@wntrsolace.com'
        ))
    );
