-- Check tracking information for all orders
SELECT 
    id,
    order_number,
    status,
    tracking_number,
    shipping_company,
    estimated_delivery,
    tracking_link,
    created_at,
    updated_at
FROM orders 
WHERE tracking_number IS NOT NULL
ORDER BY created_at DESC;

-- Check specific order if you have the order number
-- Replace 'ORDER_NUMBER_HERE' with the actual order number
-- SELECT * FROM orders WHERE order_number = 'ORDER_NUMBER_HERE';

-- Check if tracking columns exist and their data types
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('tracking_number', 'shipping_company', 'estimated_delivery', 'tracking_link')
ORDER BY ordinal_position;


