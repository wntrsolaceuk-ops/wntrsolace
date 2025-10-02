const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const EMAIL_CONFIG = {
    service: 'gmail', // You can change this to your preferred email service
    auth: {
        user: 'wntrsolace.uk@gmail.com', // Replace with your email
        pass: 'afrq uoya outa tpcr' // Replace with your app password
    }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Email templates
const getEmailTemplate = (contactData) => {
    const subjectMap = {
        'order_inquiry': 'Order Inquiry',
        'shipping_question': 'Shipping Question',
        'product_question': 'Product Question',
        'return_refund': 'Return & Refund',
        'technical_support': 'Technical Support',
        'feedback': 'Feedback',
        'complaint': 'Complaint',
        'other': 'Other'
    };

    const subject = subjectMap[contactData.subject] || contactData.subject;
    const orderInfo = contactData.order_number ? `\nOrder Number: ${contactData.order_number}` : '';

    return {
        subject: `New Contact Form Submission - ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 30px;">📧 New Contact Form Submission</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
                        <p><strong>Name:</strong> ${contactData.name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${contactData.email}" style="color: #007bff;">${contactData.email}</a></p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        ${orderInfo}
                        <p><strong>Newsletter Subscription:</strong> ${contactData.newsletter_subscription ? 'Yes' : 'No'}</p>
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <h3 style="color: #856404; margin-top: 0;">Message</h3>
                        <p style="white-space: pre-wrap; color: #333;">${contactData.message}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 14px;">
                            <strong>Quick Reply:</strong> Click <a href="mailto:${contactData.email}?subject=Re: ${subject}&body=Hi ${contactData.name},%0D%0A%0D%0AThank you for contacting WinterSolace.%0D%0A%0D%0A" style="color: #007bff;">here</a> to reply directly to the customer.
                        </p>
                        <p style="color: #999; font-size: 12px; margin-top: 10px;">
                            This email was sent from your WinterSolace contact form.
                        </p>
                    </div>
                </div>
            </div>
        `,
        text: `
New Contact Form Submission - ${subject}

Contact Information:
- Name: ${contactData.name}
- Email: ${contactData.email}
- Subject: ${subject}
${orderInfo}
- Newsletter Subscription: ${contactData.newsletter_subscription ? 'Yes' : 'No'}

Message:
${contactData.message}

---
Quick Reply: Reply directly to ${contactData.email}
This email was sent from your WinterSolace contact form.
        `
    };
};

// Send email notification
async function sendEmailNotification(contactData) {
    try {
        const emailTemplate = getEmailTemplate(contactData);
        
        const mailOptions = {
            from: EMAIL_CONFIG.auth.user,
            to: 'wntrsolace.uk@gmail.com', // Your support email
            replyTo: contactData.email, // Customer's email for easy reply
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

// API endpoint to send email notification
app.post('/api/send-contact-notification', async (req, res) => {
    try {
        const contactData = req.body;
        
        // Validate required fields
        if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, subject, message'
            });
        }

        // Send email notification
        const result = await sendEmailNotification(contactData);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Email notification sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send email notification',
                details: result.error
            });
        }
    } catch (error) {
        console.error('Error in send-contact-notification endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Email notification server is running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Test email endpoint (for testing purposes)
app.post('/api/test-email', async (req, res) => {
    try {
        const testData = {
            name: 'Test User',
            email: 'test@example.com',
            subject: 'test',
            message: 'This is a test email from the notification server.',
            order_number: 'WS-TEST-001',
            newsletter_subscription: true
        };

        const result = await sendEmailNotification(testData);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Test email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send test email',
                details: result.error
            });
        }
    } catch (error) {
        console.error('Error in test-email endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`📧 Email notification server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📨 Send notification: http://localhost:${PORT}/api/send-contact-notification`);
    console.log(`🧪 Test email: http://localhost:${PORT}/api/test-email`);
    console.log('');
    console.log('📋 Setup Instructions:');
    console.log('1. Update EMAIL_CONFIG with your email credentials');
    console.log('2. Update support email address in sendEmailNotification function');
    console.log('3. Test with: curl -X POST http://localhost:3003/api/test-email');
});

module.exports = app;
