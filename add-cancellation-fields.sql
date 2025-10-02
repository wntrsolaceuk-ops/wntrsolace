-- Add cancellation and return fields to orders table
-- Run this in your Supabase SQL editor

-- First, update any existing orders with invalid status values
UPDATE orders 
SET status = 'pending' 
WHERE status IS NULL OR status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded');

-- Update existing status field to include new statuses
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'));

-- Add cancellation/return details
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_notes TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS refund_reference VARCHAR(255);

-- Add return details
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS return_reason TEXT,
ADD COLUMN IF NOT EXISTS return_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS return_notes TEXT,
ADD COLUMN IF NOT EXISTS returned_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS return_tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS return_status VARCHAR(50) DEFAULT 'pending' CHECK (return_status IN ('pending', 'received', 'processed', 'refunded'));

-- Add payment tracking for refunds
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_refund_id VARCHAR(255);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);

-- Update existing orders to have 'pending' status
UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Add RLS policies for cancellation management
CREATE POLICY "Users can view their own order cancellations" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Admin policy that doesn't reference auth.users table
CREATE POLICY "Admins can manage all order cancellations" ON orders
    FOR ALL USING (
        auth.jwt() ->> 'email' IN ('wntrsolace.uk@gmail.com', 'admin2@wntrsolace.com')
    );

-- Alternative: Disable RLS for orders table if you want full admin control
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Sample data for testing
INSERT INTO orders (
    user_id, 
    order_number, 
    email,
    first_name,
    last_name,
    address,
    city,
    zip_code,
    country,
    total, 
    status, 
    stripe_payment_intent_id,
    created_at
) VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'WS-TEST-001',
    'test@example.com',
    'Test',
    'Customer',
    '123 Test Street',
    'London',
    'SW1A 1AA',
    'UK',
    89.99,
    'delivered',
    'pi_test_1234567890',
    NOW()
) ON CONFLICT (order_number) DO NOTHING;
