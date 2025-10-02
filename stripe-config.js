// Stripe configuration for WinterSolace
const Stripe = require('stripe');

// Use environment variable for Stripe key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here');

module.exports = stripe;
