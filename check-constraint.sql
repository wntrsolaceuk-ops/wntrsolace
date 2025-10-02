-- Check current constraint and fix if needed
-- Run this in Supabase SQL editor

-- Check current constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'orders_status_check';

-- If the constraint doesn't include all valid statuses, drop and recreate it
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'));
