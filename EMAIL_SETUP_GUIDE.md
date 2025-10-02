# 📧 Email Notification Setup Guide

## Overview
This guide will help you set up automatic email notifications for your WinterSolace contact form.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
# Copy the package.json file
copy email-server-package.json package.json

# Install dependencies
npm install
```

### 2. Configure Email Settings

Edit `email-notification-server.js` and update these settings:

```javascript
const EMAIL_CONFIG = {
    service: 'gmail', // Change to your email service (gmail, outlook, etc.)
    auth: {
        user: 'your-email@gmail.com', // Your email address
        pass: 'your-app-password' // Your app password (not regular password)
    }
};
```

### 3. Update Support Email
In the `sendEmailNotification` function, change:
```javascript
to: 'support@wintersolace.com', // Your support email address
```

## 📧 Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Generate a new app password for "Mail"
4. Use this password in the EMAIL_CONFIG

### Step 3: Update Configuration
```javascript
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'your-gmail@gmail.com',
        pass: 'your-16-character-app-password'
    }
};
```

## 🚀 Start the Server

### Option 1: Use the batch file
```bash
start-servers.bat
```

### Option 2: Start manually
```bash
node email-notification-server.js
```

## 🧪 Test the Setup

### Test Email Endpoint
```bash
curl -X POST http://localhost:3003/api/test-email
```

### Health Check
```bash
curl http://localhost:3003/api/health
```

## 📋 Features

### ✅ What You Get:
- **Automatic email notifications** when contact form is submitted
- **Professional email templates** with customer information
- **Direct reply functionality** - click to reply to customer
- **Order number tracking** if provided
- **Newsletter subscription status**
- **Error handling** and logging

### 📧 Email Template Includes:
- Customer name and email
- Subject category
- Order number (if provided)
- Full message content
- Newsletter subscription status
- Direct reply link

## 🔧 Troubleshooting

### Common Issues:

**1. "Invalid login" error**
- Make sure you're using an app password, not your regular password
- Verify 2-factor authentication is enabled

**2. "Connection timeout" error**
- Check your internet connection
- Verify the email service settings

**3. Emails not sending**
- Check the server console for error messages
- Verify the support email address is correct

### Debug Mode:
The server logs all email attempts. Check the console for:
- `Email sent successfully: [messageId]`
- `Error sending email: [error details]`

## 📱 Email Service Alternatives

### Outlook/Hotmail:
```javascript
const EMAIL_CONFIG = {
    service: 'hotmail',
    auth: {
        user: 'your-email@outlook.com',
        pass: 'your-password'
    }
};
```

### Custom SMTP:
```javascript
const EMAIL_CONFIG = {
    host: 'smtp.your-provider.com',
    port: 587,
    secure: false,
    auth: {
        user: 'your-email@domain.com',
        pass: 'your-password'
    }
};
```

## 🎯 Next Steps

1. **Test the setup** with the test email endpoint
2. **Submit a contact form** to verify everything works
3. **Check your email** for the notification
4. **Reply directly** to the customer using the reply link

## 📞 Support

If you need help setting this up, check:
- Server console logs for error messages
- Email service provider documentation
- Test with the `/api/test-email` endpoint

---

**Your contact form now automatically sends you email notifications!** 🎉

