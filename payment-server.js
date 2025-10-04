// Payment server for WinterSolace
const express = require('express');
const cors = require('cors');
const stripe = require('./stripe-config');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://pbbmrajuptceokpjnynz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiYm1yYWp1cHRjZW9rcGpueW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzY1MzcsImV4cCI6MjA3NDA1MjUzN30.BYxGzM6G7MROTDTdj6KN3gCcrs6nxUaa_ylFZwMBT9o';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware - Allow specific origins
app.use(cors({
    origin: [
        'https://www.wntrsolace.uk',
        'https://wntrsolace.uk', 
        'https://d75da05a898b347a.vercel-dns-017.com',
        'http://localhost:3000',
        'http://127.0.0.1:5500'
    ],
    credentials: true
}));

app.use(express.json());

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;
        
        console.log('Creating payment intent for amount:', amount);
        
        // Create real Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount already in cents from frontend
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        console.log('Payment intent created:', paymentIntent.id);
        
        res.json({
            success: true,
            client_secret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment intent'
        });
    }
});

// Complete order endpoint
app.post('/api/complete-order', async (req, res) => {
    try {
        const orderData = req.body;
        
        console.log('=== COMPLETE ORDER REQUEST ===');
        console.log('Order data received:', JSON.stringify(orderData, null, 2));
        console.log('User ID in order data:', orderData.user_id);
        
        // Handle both desktop and mobile formats
        const orderNumber = orderData.order_id || orderData.order_number;
        
        // Store payment intent ID for refund tracking
        const paymentIntentId = orderData.payment_intent_id;
        console.log('Payment Intent ID for tracking:', paymentIntentId);
        
        // Extract customer info from either format
        const customerName = orderData.customer_name || `${orderData.first_name || ''} ${orderData.last_name || ''}`.trim() || 'Customer';
        const customerEmail = orderData.customer_email || orderData.email || 'customer@example.com';
        const customerPhone = orderData.customer_phone || orderData.phone || '';
        
        // Handle shipping address from either format
        let shippingAddress = 'Address not provided';
        if (orderData.shipping_address) {
            if (typeof orderData.shipping_address === 'string') {
                shippingAddress = orderData.shipping_address;
            } else if (typeof orderData.shipping_address === 'object') {
                shippingAddress = `${orderData.shipping_address.street || ''}, ${orderData.shipping_address.city || ''}, ${orderData.shipping_address.state || ''} ${orderData.shipping_address.zip || ''}, ${orderData.shipping_address.country || ''}`.trim().replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '');
            }
        }
        
        // Send order confirmation email using simple server
        console.log('About to send email to simple confirmation server...');
        try {
            const emailPayload = {
                orderData: {
                    order_id: orderNumber,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    shipping_address: shippingAddress,
                    payment_intent_id: paymentIntentId,
                    total_amount: orderData.total_amount || orderData.total || 0
                },
                orderItems: orderData.items || []
            };
            
            console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
            
            const emailResponse = await fetch('https://wntrsolace-email.onrender.com/api/send-simple-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailPayload)
            });
            
            console.log('Email response status:', emailResponse.status);
            if (emailResponse.ok) {
                const emailResult = await emailResponse.json();
                console.log('Order confirmation email sent successfully:', emailResult);
            } else {
                const errorText = await emailResponse.text();
                console.warn('Email sending failed:', errorText);
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
        }
        
        // Save order to database
        try {
            console.log('Saving order to database...');
            
            // Insert order
            // Parse shipping address into separate fields
            let address = '', city = '', state = '', zipCode = '', country = '';
            if (orderData.shipping_address) {
                if (typeof orderData.shipping_address === 'object') {
                    address = orderData.shipping_address.street || '';
                    city = orderData.shipping_address.city || '';
                    state = orderData.shipping_address.state || '';
                    zipCode = orderData.shipping_address.zip || '';
                    country = orderData.shipping_address.country || '';
                } else {
                    // Parse string format: "street, city, state zip, country"
                    const parts = orderData.shipping_address.split(',').map(p => p.trim());
                    address = parts[0] || '';
                    city = parts[1] || '';
                    if (parts[2]) {
                        const stateZip = parts[2].split(' ');
                        state = stateZip[0] || '';
                        zipCode = stateZip[1] || '';
                    }
                    country = parts[3] || '';
                }
            }

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    user_id: orderData.user_id || null,
                    first_name: orderData.first_name || customerName.split(' ')[0] || '',
                    last_name: orderData.last_name || customerName.split(' ').slice(1).join(' ') || '',
                    email: customerEmail,
                    phone: customerPhone,
                    address: address,
                    city: city,
                    state: state,
                    zip_code: zipCode,
                    country: country,
                    stripe_payment_intent_id: paymentIntentId,
                    total: orderData.total_amount || orderData.total,
                    status: orderData.status || 'processing',
                    notes: orderData.notes || ''
                })
                .select()
                .single();
            
            if (orderError) {
                console.error('Error saving order:', orderError);
                throw new Error('Failed to save order to database: ' + orderError.message);
            } else {
                console.log('Order saved to database:', order.id);
                
                // Insert order items
                if (orderData.items && orderData.items.length > 0) {
                    const orderItems = orderData.items.map(item => {
                        const unitPrice = item.price || item.product_price || 0;
                        const quantity = item.quantity || 1;
                        const totalPrice = unitPrice * quantity;
                        
                        return {
                            order_id: order.id,
                            product_id: item.id || item.product_id,
                            product_name: item.name || item.product_name,
                            product_price: unitPrice,
                            unit_price: unitPrice,
                            total_price: totalPrice,
                            quantity: quantity,
                            size: item.size
                        };
                    });
                    
                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(orderItems);
                    
                    if (itemsError) {
                        console.error('Error saving order items:', itemsError);
                        throw new Error('Failed to save order items: ' + itemsError.message);
                    } else {
                        console.log('Order items saved to database');
                    }
                }
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
            throw new Error('Database operation failed: ' + dbError.message);
        }
        
        res.json({
            success: true,
            orderNumber: orderNumber,
            message: 'Order completed successfully'
        });
    } catch (error) {
        console.error('Order completion error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete order'
        });
    }
});

// Process Stripe refund
app.post('/api/process-refund', async (req, res) => {
    try {
        const { payment_intent_id, amount } = req.body;
        
        console.log('=== PROCESSING REFUND ===');
        console.log('Payment Intent ID:', payment_intent_id);
        console.log('Refund Amount:', amount);
        
        if (!payment_intent_id || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing payment_intent_id or amount'
            });
        }
        
        // Create refund using Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment_intent_id,
            amount: amount, // Amount in cents
            reason: 'requested_by_customer'
        });
        
        console.log('Refund created successfully:', refund.id);
        
        res.json({
            success: true,
            refund_id: refund.id,
            amount: refund.amount,
            status: refund.status,
            message: 'Refund processed successfully'
        });
        
    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process refund',
            details: error.message
        });
    }
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'WinterSolace Payment Server',
        status: 'Running',
        port: PORT,
        endpoints: [
            'POST /api/create-payment-intent',
            'POST /api/complete-order',
            'POST /api/process-refund',
            'GET /api/health'
        ]
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'Payment server is healthy!',
        port: PORT,
        endpoints: [
            'POST /api/create-payment-intent',
            'POST /api/complete-order',
            'POST /api/process-refund',
            'GET /api/health'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`💳 Payment server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💸 Create payment: http://localhost:${PORT}/api/create-payment-intent`);
    console.log(`✅ Complete order: http://localhost:${PORT}/api/complete-order`);
    console.log('🚀 Ready to process payments!');
});

module.exports = app;
