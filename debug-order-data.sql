-- Debug what's being sent to the database
-- Run this to see the exact data structure

-- Check the current constraint
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'orders_status_check';

-- Check if there are any other constraints that might be interfering
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- Check the column definition for status
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'status';
