const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { generateInvoicePDF } = require('./invoice-generator');

// Load logo as base64
const logoBase64 = fs.readFileSync('Wntrsolacewhite.png').toString('base64');
const LOGO_DATA_URL = `data:image/png;base64,${logoBase64}`;

const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration (same as contact notifications)
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'wntrsolace.uk@gmail.com',
        pass: 'afrq uoya outa tpcr'
    }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Order confirmation email template
const getOrderConfirmationTemplate = (orderData) => {
    const orderItems = orderData.items || [];
    const totalAmount = orderData.total_amount || 0;
    const orderNumber = orderData.order_number || 'WS-UNKNOWN';
    const customerName = orderData.customer_name || 'Valued Customer';
    const trackingNumber = orderData.tracking_number || 'Not available yet';
    const estimatedDelivery = orderData.estimated_delivery || '3-5 business days';

    // Simple items list
    const itemsList = orderItems.map(item => 
        `${item.name} (${item.size || 'N/A'}) x${item.quantity || 1} - £${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
    ).join('<br>');

    return {
        subject: `Order Confirmed - ${orderNumber}`,
        html: `
            <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #ffffff; color: #000000;">
                <!-- ASCII Header -->
                <div style="background: #000000; color: #ffffff; padding: 20px; text-align: center;">
                    <pre style="margin: 0; font-size: 12px; line-height: 1.2;">
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ██╗    ██╗██╗███╗   ██╗████████╗███████╗██████╗          ║
║    ██║    ██║██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗         ║
║    ██║ █╗ ██║██║██╔██╗ ██║   ██║   █████╗  ██████╔╝         ║
║    ██║███╗██║██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗         ║
║    ╚███╔███╔╝██║██║ ╚████║   ██║   ███████╗██║  ██║         ║
║     ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝         ║
║                                                              ║
║                    ORDER CONFIRMATION                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
                    </pre>
                </div>
                
                <!-- Confirmation -->
                <div style="padding: 30px; text-align: center;">
                    <div style="background: #000000; color: #ffffff; padding: 20px; border-radius: 8px;">
                        <h1 style="margin: 0; font-size: 24px;">✅ ORDER CONFIRMED ✅</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase, ${customerName}!</p>
                    </div>
                </div>
                
                <!-- Order Details -->
                <div style="padding: 0 30px 30px 30px;">
                    <div style="background: #f8f9fa; padding: 20px; border: 2px solid #000000; border-radius: 8px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 18px; text-align: center;">📋 ORDER DETAILS</h2>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                            <div style="flex: 1; margin-right: 10px;">
                                <div style="background: #ffffff; padding: 15px; border: 1px solid #000000;">
                                    <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold;">ORDER NUMBER</p>
                                    <p style="margin: 0; font-size: 16px; font-weight: bold;">${orderNumber}</p>
                                </div>
                            </div>
                            <div style="flex: 1; margin-left: 10px;">
                                <div style="background: #ffffff; padding: 15px; border: 1px solid #000000;">
                                    <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold;">DATE</p>
                                    <p style="margin: 0; font-size: 14px;">${new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between;">
                            <div style="flex: 1; margin-right: 10px;">
                                <div style="background: #ffffff; padding: 15px; border: 1px solid #000000;">
                                    <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold;">TOTAL AMOUNT</p>
                                    <p style="margin: 0; font-size: 20px; font-weight: bold;">$${totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                            <div style="flex: 1; margin-left: 10px;">
                                <div style="background: #ffffff; padding: 15px; border: 1px solid #000000;">
                                    <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold;">STATUS</p>
                                    <p style="margin: 0; font-size: 14px; font-weight: bold;">✅ PAID</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Items -->
                <div style="padding: 0 30px 30px 30px;">
                    <div style="background: #f8f9fa; padding: 20px; border: 2px solid #000000; border-radius: 8px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 18px; text-align: center;">🛍️ ITEMS ORDERED</h2>
                        
                        ${orderItems.map(item => `
                            <div style="background: #ffffff; padding: 15px; margin-bottom: 15px; border: 1px solid #000000; border-radius: 8px;">
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 60px; height: 60px; background: #000000; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-right: 15px;">
                                        ${item.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style="flex: 1;">
                                        <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">${item.name}</h3>
                                        <p style="margin: 0 0 3px 0; font-size: 14px;">Size: ${item.size || 'N/A'}</p>
                                        <p style="margin: 0 0 3px 0; font-size: 14px;">Quantity: ${item.quantity || 1}</p>
                                        <p style="margin: 0; font-size: 16px; font-weight: bold;">£${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Shipping Info -->
                <div style="padding: 0 30px 30px 30px;">
                    <div style="background: #f8f9fa; padding: 20px; border: 2px solid #000000; border-radius: 8px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 18px; text-align: center;">🚚 SHIPPING INFORMATION</h2>
                        
                        <div style="background: #ffffff; padding: 15px; border: 1px solid #000000;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold;">PROCESSING TIME</p>
                            <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">1-2 business days</p>
                            
                            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold;">DELIVERY</p>
                            <p style="margin: 0; font-size: 14px; font-weight: bold;">3-5 business days</p>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div style="padding: 0 30px 30px 30px; text-align: center;">
                    <a href="http://localhost:3000/order-details.html?order=${orderNumber}" 
                       style="display: inline-block; background: #000000; color: #ffffff; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 15px;">
                        📍 TRACK ORDER
                    </a>
                    <a href="http://localhost:3000/contact.html" 
                       style="display: inline-block; background: #ffffff; color: #000000; border: 2px solid #000000; padding: 13px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        💬 CONTACT SUPPORT
                    </a>
                </div>
                
                <!-- Footer -->
                <div style="padding: 30px; text-align: center; border-top: 2px solid #000000;">
                    <p style="color: #000000; font-size: 16px; margin: 0; font-weight: bold;">
                        Thank you for choosing <strong>WINTERSOLACE</strong>!
                    </p>
                    <p style="color: #666; font-size: 13px; margin: 10px 0 0 0;">
                        A detailed invoice is attached to this email.
                    </p>
                </div>
            </div>
        `,
        text: `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    WINTERSOLACE                              ║
║                 ORDER CONFIRMATION                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

✅ ORDER CONFIRMED ✅

Thank you for your purchase, ${customerName}!

═══════════════════════════════════════════════════════════════
📋 ORDER DETAILS
═══════════════════════════════════════════════════════════════

Order Number: ${orderNumber}
Date: ${new Date().toLocaleDateString()}
Total Amount: $${totalAmount.toFixed(2)}
Status: ✅ PAID

═══════════════════════════════════════════════════════════════
🛍️ ITEMS ORDERED
═══════════════════════════════════════════════════════════════

${orderItems.map(item => `
• ${item.name}
  Size: ${item.size || 'N/A'}
  Quantity: ${item.quantity || 1}
  Price: £${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
`).join('')}

═══════════════════════════════════════════════════════════════
🚚 SHIPPING INFORMATION
═══════════════════════════════════════════════════════════════

Processing Time: 1-2 business days
Delivery: 3-5 business days

═══════════════════════════════════════════════════════════════
🔗 QUICK LINKS
═══════════════════════════════════════════════════════════════

Track your order: http://localhost:3000/order-details.html?order=${orderNumber}
Contact support: http://localhost:3000/contact.html

═══════════════════════════════════════════════════════════════

Thank you for choosing WINTERSOLACE!

A detailed invoice is attached to this email.

Best regards,
The WinterSolace Team
        `
    };
};

// Send order confirmation email
async function sendOrderConfirmationEmail(orderData) {
    try {
        const emailTemplate = getOrderConfirmationTemplate(orderData);
        
        // Generate PDF invoice
        const invoiceFileName = `invoice-${orderData.order_number || 'unknown'}-${Date.now()}.pdf`;
        const invoicePath = path.join(__dirname, 'temp', invoiceFileName);
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Generate PDF
        await generateInvoicePDF(orderData, invoicePath);
        
        const mailOptions = {
            from: EMAIL_CONFIG.auth.user,
            to: orderData.customer_email,
            subject: emailTemplate.subject,
            text: emailTemplate.text
            // Using only text, no HTML
        };

        const result = await transporter.sendMail(mailOptions);
        
        // Clean up temporary PDF file
        try {
            fs.unlinkSync(invoicePath);
            console.log('Temporary PDF file cleaned up');
        } catch (cleanupError) {
            console.warn('Could not clean up temporary PDF file:', cleanupError.message);
        }
        
        console.log('Order confirmation email with PDF invoice sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
}

// API endpoint to send order confirmation
app.post('/api/send-order-confirmation', async (req, res) => {
    try {
        const orderData = req.body;
        
        // Validate required fields
        if (!orderData.customer_email || !orderData.order_number) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: customer_email, order_number'
            });
        }

        // Send order confirmation email
        const result = await sendOrderConfirmationEmail(orderData);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Order confirmation email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send order confirmation email',
                details: result.error
            });
        }
    } catch (error) {
        console.error('Error in send-order-confirmation endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Order confirmation server is running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Test order confirmation endpoint
app.post('/api/test-order-confirmation', async (req, res) => {
    try {
        const testOrderData = {
            order_number: 'WS-TEST-2024-001',
            customer_name: 'Test Customer',
            customer_email: 'wntrsolace.uk@gmail.com',
            total_amount: 129.99,
            tracking_number: 'EVRI123456789',
            estimated_delivery: '3-5 business days',
            shipping_address: {
                name: 'Test Customer',
                street: '123 Test Street',
                city: 'Test City',
                state: 'TC',
                zip: '12345',
                country: 'United States'
            },
            items: [
                {
                    name: 'Winter Solace Hoodie',
                    price: 79.99,
                    quantity: 1,
                    size: 'Large',
                    color: 'Black',
                    sku: 'WS-HOODIE-BLK-L',
                    image_url: 'https://via.placeholder.com/80x80?text=Hoodie'
                },
                {
                    name: 'Winter Solace Beanie',
                    price: 25.00,
                    quantity: 2,
                    size: 'One Size',
                    color: 'Gray',
                    sku: 'WS-BEANIE-GRY-OS',
                    image_url: 'https://via.placeholder.com/80x80?text=Beanie'
                }
            ]
        };

        const result = await sendOrderConfirmationEmail(testOrderData);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Test order confirmation email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send test order confirmation email',
                details: result.error
            });
        }
    } catch (error) {
        console.error('Error in test-order-confirmation endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`📦 Order confirmation server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📧 Send confirmation: http://localhost:${PORT}/api/send-order-confirmation`);
    console.log(`🧪 Test confirmation: http://localhost:${PORT}/api/test-order-confirmation`);
    console.log('');
    console.log('🎯 Ready to send badass order confirmation emails!');
});

module.exports = app;
