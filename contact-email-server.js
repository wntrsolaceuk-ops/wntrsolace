// Contact Email Server for WinterSolace
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
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

// Gmail Email configuration
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'wntrsolace.uk@gmail.com',
        pass: 'afrq uoya outa tpcr' // Gmail app password
    }
};

// Create transporter
const transporter = nodemailer.createTransporter(EMAIL_CONFIG);

// Contact form email template
const getContactEmailTemplate = (contactData) => {
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
                        ${orderInfo ? `<p><strong>Order Number:</strong> ${contactData.order_number}</p>` : ''}
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <h3 style="color: #856404; margin-top: 0;">Message</h3>
                        <p style="color: #856404; line-height: 1.6; white-space: pre-wrap;">${contactData.message}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 14px; margin: 0;">
                            This message was sent from the WinterSolace contact form.<br>
                            Reply directly to this email to respond to ${contactData.name}.
                        </p>
                    </div>
                </div>
            </div>
        `
    };
};

// Send contact email function
async function sendContactEmail(contactData) {
    try {
        const template = getContactEmailTemplate(contactData);
        
        const mailOptions = {
            from: 'wntrsolace.uk@gmail.com',
            to: 'wntrsolace.uk@gmail.com', // Admin email
            replyTo: contactData.email, // Customer's email for replies
            subject: template.subject,
            html: template.html
        };

        console.log('Sending contact email...', {
            to: mailOptions.to,
            from: mailOptions.from,
            subject: mailOptions.subject,
            customerEmail: contactData.email
        });

        const result = await transporter.sendMail(mailOptions);
        
        console.log('Contact email sent successfully:', result.messageId);
        return { 
            success: true, 
            messageId: result.messageId 
        };
        
    } catch (error) {
        console.error('Error sending contact email:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// API endpoint to send contact notification
app.post('/api/send-contact-notification', async (req, res) => {
    try {
        const contactData = req.body;
        
        console.log('=== CONTACT FORM SUBMISSION ===');
        console.log('Contact data received:', JSON.stringify(contactData, null, 2));
        
        // Validate required fields
        if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, subject, message'
            });
        }

        // Send email notification
        const result = await sendContactEmail(contactData);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Contact email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send contact email',
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
    res.status(200).json({
        status: 'Contact email server is healthy!',
        port: PORT,
        service: 'Gmail with nodemailer',
        endpoints: [
            'POST /api/send-contact-notification',
            'GET /api/health'
        ]
    });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
    try {
        const testContactData = {
            name: 'Test Customer',
            email: 'test@example.com',
            subject: 'test',
            message: 'This is a test email from the contact server.'
        };
        
        const result = await sendContactEmail(testContactData);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Test email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Test email failed',
                details: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Test email error: ' + error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`📧 Contact Email Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📨 Send contact: http://localhost:${PORT}/api/send-contact-notification`);
    console.log(`🧪 Test email: http://localhost:${PORT}/api/test-email`);
    console.log('');
    console.log('📋 Email Configuration:');
    console.log(`   Service: Gmail`);
    console.log(`   From: wntrsolace.uk@gmail.com`);
    console.log(`   To: wntrsolace.uk@gmail.com`);
    console.log('');
    console.log('🚀 Ready to send contact emails!');
});

module.exports = app;
