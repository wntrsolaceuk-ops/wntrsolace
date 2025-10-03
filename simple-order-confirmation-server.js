const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration - Using Resend API (FREE: 3,000 emails/month)
const RESEND_API_KEY = process.env.RESEND_API_KEY || 'your-resend-api-key';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@wntrsolace.uk';

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Simple order confirmation server running' });
});

// Send simple order confirmation
app.post('/api/send-simple-confirmation', async (req, res) => {
    try {
        const { orderData, orderItems } = req.body;
        
        if (!orderData || !orderItems) {
            return res.status(400).json({ error: 'Missing order data or items' });
        }

        // Create simple order summary
        let orderSummary = '';
        let totalAmount = 0;
        
        orderItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;
            orderSummary += `• ${item.name} - £${item.price} x ${item.quantity} = £${itemTotal.toFixed(2)}\n`;
        });

        const mailOptions = {
            from: 'wntrsolace.uk@gmail.com',
            to: orderData.customer_email,
            subject: `Order Confirmation #${orderData.order_id}`,
            text: `
WINTERSOLACE - Order Confirmation

Hello ${orderData.customer_name},

Thank you for your order! Here are your order details:

Order ID: ${orderData.order_id}
Date: ${new Date().toLocaleDateString()}

Items Ordered:
${orderSummary}

Total Amount: £${totalAmount.toFixed(2)}

Shipping Address:
${orderData.shipping_address}

Your order is being processed and will be shipped within 2-3 business days.

Thank you for choosing WinterSolace!

Best regards,
WinterSolace Team
            `
        };

        // Send customer email using Resend
        const customerEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [orderData.customer_email],
                subject: `Order Confirmation #${orderData.order_id}`,
                text: `
WINTERSOLACE - Order Confirmation

Hello ${orderData.customer_name},

Thank you for your order! Here are your order details:

Order ID: ${orderData.order_id}
Date: ${new Date().toLocaleDateString()}

Items Ordered:
${orderSummary}

Total Amount: £${totalAmount.toFixed(2)}

Shipping Address:
${orderData.shipping_address}

Your order is being processed and will be shipped within 2-3 business days.

Thank you for choosing WinterSolace!

Best regards,
WinterSolace Team
                `
            })
        });

        if (customerEmailResponse.ok) {
            const result = await customerEmailResponse.json();
            console.log('Customer confirmation email sent successfully:', result.id);
        } else {
            console.error('Failed to send customer email:', await customerEmailResponse.text());
        }

        // Send admin notification using Resend
        const adminEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [FROM_EMAIL],
                subject: `New Order Received - #${orderData.order_id}`,
                text: `
NEW ORDER NOTIFICATION

A new order has been placed on WinterSolace:

Order ID: ${orderData.order_id}
Customer: ${orderData.customer_name}
Email: ${orderData.customer_email}
Date: ${new Date().toLocaleDateString()}

Items Ordered:
${orderSummary}

Total Amount: £${totalAmount.toFixed(2)}

Shipping Address:
${orderData.shipping_address}

Please process this order and prepare for shipment.

Best regards,
WinterSolace System
                `
            })
        });

        if (adminEmailResponse.ok) {
            const result = await adminEmailResponse.json();
            console.log('Admin notification sent successfully:', result.id);
        } else {
            console.error('Failed to send admin email:', await adminEmailResponse.text());
        }
        
        res.json({ 
            success: true, 
            message: 'Order confirmation sent successfully via Resend'
        });

    } catch (error) {
        console.error('Error sending simple order confirmation:', error);
        res.status(500).json({ 
            error: 'Failed to send order confirmation',
            details: error.message
        });
    }
});

// Send cancellation email to customer
app.post('/api/send-cancellation-email', async (req, res) => {
    try {
        const { order_id, order_number, customer_email, cancellation_reason, cancellation_notes, refund_amount } = req.body;
        
        if (!order_id || !customer_email) {
            return res.status(400).json({ error: 'Missing order ID or customer email' });
        }

        // Use real customer email and order number from the request
        const orderData = {
            order_id: order_id,
            order_number: order_number || order_id, // Use order number if available, fallback to ID
            customer_name: 'Customer', // We don't have the name in the request, could be improved
            customer_email: customer_email,
            total_amount: refund_amount || 0
        };

        const mailOptions = {
            from: 'wntrsolace.uk@gmail.com',
            to: orderData.customer_email,
            subject: `Order Cancellation Confirmation - #${orderData.order_number}`,
            text: `
WINTERSOLACE - Order Cancellation Confirmation

Hello ${orderData.customer_name},

Your order has been successfully cancelled.

Order Details:
- Order Number: ${orderData.order_number}
- Cancellation Date: ${new Date().toLocaleDateString()}
- Reason: ${cancellation_reason || 'Not specified'}
- Refund Amount: £${(refund_amount || 0).toFixed(2)}

${cancellation_notes ? `Notes: ${cancellation_notes}` : ''}

Your refund will be processed within 3-5 business days and will appear on your original payment method.

If you have any questions, please contact us at wntrsolace.uk@gmail.com

Thank you for your understanding.

Best regards,
WinterSolace Team
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Cancellation email sent successfully:', result.messageId);
        
        res.json({ 
            success: true, 
            message: 'Cancellation email sent successfully',
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error sending cancellation email:', error);
        res.status(500).json({ 
            error: 'Failed to send cancellation email',
            details: error.message
        });
    }
});

// Send return confirmation email to customer
app.post('/api/send-return-email', async (req, res) => {
    try {
        const { order_id, order_number, customer_email, return_reason, return_tracking_number, return_notes } = req.body;
        
        if (!order_id || !customer_email) {
            return res.status(400).json({ error: 'Missing order ID or customer email' });
        }

        // Use real customer email and order number from the request
        const orderData = {
            order_id: order_id,
            order_number: order_number || order_id, // Use order number if available, fallback to ID
            customer_name: 'Customer', // We don't have the name in the request, could be improved
            customer_email: customer_email
        };

        const mailOptions = {
            from: 'wntrsolace.uk@gmail.com',
            to: orderData.customer_email,
            subject: `Return Confirmation - #${orderData.order_number}`,
            text: `
WINTERSOLACE - Return Confirmation

Hello ${orderData.customer_name},

Your return has been successfully processed.

Return Details:
- Order ID: ${orderData.order_id}
- Return Date: ${new Date().toLocaleDateString()}
- Reason: ${return_reason || 'Not specified'}
${return_tracking_number ? `- Tracking Number: ${return_tracking_number}` : ''}

${return_notes ? `Notes: ${return_notes}` : ''}

Once we receive your returned items, we will process your refund within 3-5 business days.

If you have any questions, please contact us at wntrsolace.uk@gmail.com

Thank you for choosing WinterSolace.

Best regards,
WinterSolace Team
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Return email sent successfully:', result.messageId);
        
        res.json({ 
            success: true, 
            message: 'Return email sent successfully',
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error sending return email:', error);
        res.status(500).json({ 
            error: 'Failed to send return email',
            details: error.message
        });
    }
});

// Test endpoint to send mock order confirmation
app.post('/api/test-simple', async (req, res) => {
    try {
        const mockOrderData = {
            order_id: 'WS-2024-001',
            customer_name: 'Test Customer',
            customer_email: 'gospelachuenu@gmail.com',
            shipping_address: '123 Test Street, London, SW1A 1AA'
        };

        const mockOrderItems = [
            {
                name: 'Premium Winter Jacket',
                price: 89.99,
                quantity: 1
            },
            {
                name: 'Wool Scarf',
                price: 24.99,
                quantity: 2
            }
        ];

        // Create simple order summary
        let orderSummary = '';
        let totalAmount = 0;
        
        mockOrderItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;
            orderSummary += `• ${item.name} - £${item.price} x ${item.quantity} = £${itemTotal.toFixed(2)}\n`;
        });

        const mailOptions = {
            from: 'wntrsolace.uk@gmail.com',
            to: 'gospelachuenu@gmail.com',
            subject: `Order Confirmation #${mockOrderData.order_id}`,
            text: `
WINTERSOLACE - Order Confirmation

Hello ${mockOrderData.customer_name},

Thank you for your order! Here are your order details:

Order ID: ${mockOrderData.order_id}
Date: ${new Date().toLocaleDateString()}

Items Ordered:
${orderSummary}

Total Amount: £${totalAmount.toFixed(2)}

Shipping Address:
${mockOrderData.shipping_address}

Your order is being processed and will be shipped within 2-3 business days.

Thank you for choosing WinterSolace!

Best regards,
WinterSolace Team
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Simple test email sent successfully:', result.messageId);
        
        res.json({ 
            success: true, 
            message: 'Test order confirmation sent successfully',
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ 
            error: 'Failed to send test email',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`📧 Simple order confirmation server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📧 Send simple confirmation: http://localhost:${PORT}/api/send-simple-confirmation`);
    console.log(`🧪 Test simple: http://localhost:${PORT}/api/test-simple`);
});