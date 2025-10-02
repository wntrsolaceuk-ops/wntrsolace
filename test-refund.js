// Test Stripe refund endpoint
// Run with: node test-refund.js

const fetch = require('node-fetch');

async function testRefund() {
    try {
        console.log('🧪 Testing Stripe refund endpoint...\n');
        
        // Test data - you'll need to replace with actual values from your test orders
        const testData = {
            payment_intent_id: 'pi_test_1234567890', // Replace with actual payment intent ID from test order
            amount: 1000 // Amount in pence (1000 = £10.00)
        };
        
        console.log('📤 Sending refund request...');
        console.log('Payment Intent ID:', testData.payment_intent_id);
        console.log('Amount:', testData.amount, 'pence (£' + (testData.amount / 100).toFixed(2) + ')');
        
        const response = await fetch('http://localhost:3002/api/process-refund', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('\n📥 Response Status:', response.status);
        console.log('📥 Response:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('\n✅ Refund endpoint is working!');
            if (result.refund_id) {
                console.log('🔄 Refund ID:', result.refund_id);
                console.log('💰 Refund Amount:', result.amount ? '£' + (result.amount / 100).toFixed(2) : 'N/A');
                console.log('📊 Refund Status:', result.status || 'N/A');
            }
        } else {
            console.log('\n❌ Refund failed:', result.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('\n💥 Error testing refund:', error.message);
    }
}

// Instructions for getting test data
console.log('📋 INSTRUCTIONS:');
console.log('1. Place a test order through your checkout');
console.log('2. Check the payment server logs for the payment_intent_id');
console.log('3. Update the payment_intent_id in this script');
console.log('4. Run: node test-refund.js\n');

// Uncomment the line below to run the test
// testRefund();
