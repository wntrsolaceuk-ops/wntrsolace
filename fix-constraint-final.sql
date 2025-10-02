-- Final fix for orders_status_check constraint
-- Run this in Supabase SQL editor

-- First, check what constraint exists
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'orders_status_check';

-- Drop the existing constraint completely
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the new constraint with all valid statuses
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'orders_status_check';
