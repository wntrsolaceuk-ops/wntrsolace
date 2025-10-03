// Payment server for WinterSolace
const express = require('express');
const cors = require('cors');
const stripe = require('./stripe-config');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
        
        // Generate order number
        const orderNumber = 'WS-' + Date.now();
        
        // Store payment intent ID for refund tracking
        const paymentIntentId = orderData.payment_details?.stripe_payment_intent_id;
        console.log('Payment Intent ID for tracking:', paymentIntentId);
        
        // Send order confirmation email using simple server
        console.log('About to send email to simple confirmation server...');
        try {
            const emailPayload = {
                orderData: {
                    order_id: orderNumber,
                    customer_name: orderData.customer_name || `${orderData.first_name || ''} ${orderData.last_name || ''}`.trim() || 'Customer',
                    customer_email: orderData.customer_email || orderData.email || 'customer@example.com',
                    shipping_address: orderData.shipping_address ? 
                        `${orderData.shipping_address.street || ''}, ${orderData.shipping_address.city || ''}, ${orderData.shipping_address.state || ''} ${orderData.shipping_address.zip || ''}`.trim() :
                        'Address not provided',
                    payment_intent_id: paymentIntentId
                },
                orderItems: orderData.items || []
            };
            
            console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
            
            const emailResponse = await fetch('http://localhost:3005/api/send-simple-confirmation', {
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
