-- Debug constraint issue
-- Run this in Supabase SQL editor

-- 1. Check current constraint definition
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'orders_status_check';

-- 2. Check all existing status values in orders table
SELECT DISTINCT status, COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY status;

-- 3. Check for any NULL or invalid status values
SELECT id, order_number, status, created_at
FROM orders 
WHERE status IS NULL 
   OR status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded')
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are any other constraints on the status column
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
  AND conname LIKE '%status%';
