# WinterSolace Deployment Guide

This guide will help you deploy WinterSolace to production.

## Prerequisites

- GitHub account
- Domain name
- Supabase project (already configured)
- Stripe account with live keys
- Email service (Gmail or SendGrid)

## Deployment Steps

### 1. GitHub Repository Setup

1. Create a new repository on GitHub
2. Clone your repository locally
3. Copy all WinterSolace files to the repository
4. Commit and push to GitHub

### 2. Update Configuration for Production

Before deploying, update these files:

#### Update API URLs
- Replace all `localhost` URLs with production URLs
- Update CORS settings in server files
- Configure environment variables

#### Update Database Connections
- Ensure Supabase credentials are correct
- Test database connectivity

#### Update Email Configuration
- Configure production email settings
- Test email delivery

### 3. Static Website Deployment (Netlify)

1. Go to [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm install`
   - Publish directory: `/` (root)
4. Add custom domain
5. Enable SSL certificate

### 4. Node.js Servers Deployment (Railway)

1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Deploy each server separately:
   - Main Server (`main-server.js`)
   - Payment Server (`payment-server.js`)
   - Email Notification Server (`email-notification-server.js`)
   - Simple Order Confirmation Server (`simple-order-confirmation-server.js`)
   - Tracking Server (`track123-server.js`)

### 5. Domain Configuration

1. Point your domain to Netlify
2. Set up subdomains for API servers
3. Configure SSL certificates
4. Test all endpoints

### 6. Production Testing

Test these critical functions:
- [ ] User registration/login
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order confirmation emails
- [ ] Admin dashboard access
- [ ] Order management
- [ ] Cancellation/refund process

## Environment Variables

Set these in your hosting platform:

### Supabase
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Stripe
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Email
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Post-Deployment Checklist

- [ ] All servers are running
- [ ] Domain is configured
- [ ] SSL certificates are active
- [ ] Payment processing works
- [ ] Email notifications work
- [ ] Admin dashboard is accessible
- [ ] Database connections are stable
- [ ] Error monitoring is set up

## Monitoring

Set up monitoring for:
- Server uptime
- Error rates
- Payment failures
- Email delivery
- Database performance

## Backup Strategy

- Database backups (Supabase handles this)
- Code backups (GitHub)
- Configuration backups
- SSL certificate backups

## Troubleshooting

### Common Issues
1. **CORS errors**: Update CORS settings in server files
2. **Database connection**: Check Supabase credentials
3. **Email delivery**: Verify SMTP settings
4. **Payment failures**: Check Stripe configuration
5. **SSL issues**: Ensure certificates are properly configured

### Support
- Check server logs for errors
- Monitor payment processing
- Test email delivery
- Verify database connectivity

## Security Considerations

- Use environment variables for secrets
- Enable HTTPS everywhere
- Set up proper CORS policies
- Monitor for security vulnerabilities
- Keep dependencies updated

## Performance Optimization

- Enable gzip compression
- Set up CDN for static assets
- Optimize images
- Enable caching headers
- Monitor server performance

## Maintenance

- Regular security updates
- Monitor server performance
- Backup database regularly
- Update dependencies
- Monitor error logs
