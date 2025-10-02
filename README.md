# WinterSolace - Premium Winter Apparel E-commerce

A modern e-commerce platform for winter apparel with full order management, payment processing, and admin dashboard.

## Features

- 🛍️ **Product Catalog**: Browse and view winter apparel products
- 🛒 **Shopping Cart**: Add items with size selection
- 💳 **Payment Processing**: Stripe integration for secure payments
- 📧 **Email Notifications**: Order confirmations and admin notifications
- 👤 **User Authentication**: Supabase-powered user accounts
- 📊 **Admin Dashboard**: Order management, cancellations, and returns
- 🎨 **Modern UI**: Responsive design with winter theme

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Supabase for authentication
- Stripe for payments

### Backend
- Node.js with Express
- Multiple microservices architecture
- Supabase PostgreSQL database

### Services
- **Main Server** (Port 3000): Website hosting
- **Payment Server** (Port 3002): Stripe payment processing
- **Email Servers** (Ports 3003, 3005): Email notifications
- **Tracking Server** (Port 3001): Order tracking

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wintersolace.git
cd wintersolace
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Update Supabase credentials in HTML files
- Configure Stripe keys in `stripe-config.js`
- Set up email credentials in server files

4. Start all servers:
```bash
# Windows
.\start-servers.bat

# Or manually start each server
node main-server.js
node payment-server.js
node email-notification-server.js
node simple-order-confirmation-server.js
```

5. Open your browser to `http://localhost:3000`

## Project Structure

```
wintersolace/
├── public/                 # Static assets
├── admin-*.html           # Admin dashboard pages
├── *.html                 # Main website pages
├── *-server.js            # Backend services
├── styles.css             # Main stylesheet
├── start-servers.bat      # Server startup script
└── README.md              # This file
```

## Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL scripts in the root directory:
   - `create-contact-table.sql`
   - `add-cancellation-fields.sql`
   - `fix-constraint-final.sql`

### Stripe Setup
1. Get your Stripe API keys
2. Update `stripe-config.js` with your keys
3. Configure webhook endpoints

### Email Setup
1. Configure Gmail SMTP credentials
2. Update email servers with your credentials
3. Test email delivery

## Deployment

### Static Website
Deploy HTML/CSS/JS files to:
- Netlify
- Vercel
- GitHub Pages

### Node.js Servers
Deploy to:
- Railway
- Heroku
- DigitalOcean App Platform

## Admin Access

- **Admin Email**: wntrsolace.uk@gmail.com
- **Admin Dashboard**: `/admin-dashboard.html`
- **Order Management**: `/admin-orders.html`
- **Contact Messages**: `/admin-contact.html`
- **Cancellations**: `/admin-cancellations.html`

## API Endpoints

### Payment Server (Port 3002)
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/complete-order` - Complete order after payment
- `POST /api/process-refund` - Process Stripe refunds

### Email Servers (Ports 3003, 3005)
- `POST /api/send-contact-email` - Send contact form emails
- `POST /api/send-simple-confirmation` - Send order confirmations
- `POST /api/send-cancellation-email` - Send cancellation emails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email wntrsolace.uk@gmail.com or create an issue on GitHub.