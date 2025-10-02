// Simple email test without PDF
const nodemailer = require('nodemailer');

const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'wntrsolace.uk@gmail.com',
        pass: 'afrq uoya outa tpcr'
    }
};

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

async function sendSimpleEmail() {
    try {
        const mailOptions = {
            from: EMAIL_CONFIG.auth.user,
            to: 'gospelachuenu@gmail.com',
            subject: 'Test Email from WinterSolace',
            html: '<h1>Test Email</h1><p>This is a simple test email.</p>',
            text: 'Test Email - This is a simple test email.'
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Simple email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Simple email failed:', error);
        return { success: false, error: error.message };
    }
}

sendSimpleEmail();

