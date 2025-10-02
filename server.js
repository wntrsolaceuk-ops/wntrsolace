const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe (SANDBOX/TEST MODE)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'layout-winter-frost.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/collections', (req, res) => {
    res.sendFile(path.join(__dirname, 'collections.html'));
});

app.get('/product-detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'product-detail.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/order-confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'order-confirmation.html'));
});

app.get('/confirm', (req, res) => {
    res.sendFile(path.join(__dirname, 'confirm.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

// Stripe Payment Intent API
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, order_number, currency = 'gbp' } = req.body;
        
        // Validate amount
        if (!amount || amount < 50) { // Minimum £0.50
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount in pence
            currency: currency,
            metadata: {
                order_number: order_number || 'temp_' + Date.now(),
                source: 'wintersolace_website'
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        res.json({ 
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });
        
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create payment intent',
            message: error.message 
        });
    }
});

// Stripe Webhook (for future use)
app.post('/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret');
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log('Payment succeeded:', event.data.object.id);
            // Update order status in Supabase here
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment failed:', event.data.object.id);
            // Handle failed payment
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
});

// Handle Supabase auth callbacks
app.get('/auth/callback', (req, res) => {
    // Redirect to confirmation page with URL fragments
    res.redirect('/confirm.html' + (req.url.includes('#') ? req.url.substring(req.url.indexOf('#')) : ''));
});

app.listen(PORT, () => {
    console.log(`🚀 WinterSolace server running on http://localhost:${PORT}`);
    console.log(`📱 Auth page: http://localhost:${PORT}/auth`);
    console.log(`🛍️ Collections: http://localhost:${PORT}/collections`);
    console.log(`💳 Checkout: http://localhost:${PORT}/checkout`);
    console.log(`🧪 Stripe SANDBOX/TEST mode active - safe for development!`);
});
