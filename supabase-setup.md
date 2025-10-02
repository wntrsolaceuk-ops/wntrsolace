# Supabase Setup Instructions for WinterSolace

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization or use existing
4. Create a new project:
   - **Name**: WinterSolace
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users

## 2. Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy your:
   - **Project URL** 
   - **Anon (public) key**

## 3. Update Your Code

Replace these placeholders in both `auth.html` and `layout-winter-frost.html`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'  // Replace with your Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'  // Replace with your Anon key
```

## 4. Configure Authentication

1. Go to **Authentication** → **Settings**
2. **Site URL**: Add your website URL (e.g., `http://localhost` for local development)
3. **Redirect URLs**: Add your auth callback URLs

## 5. Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

## 6. Database Setup (Optional)

Create additional tables for:
- User profiles
- Products
- Orders
- Admin settings

## 7. Test Your Setup

1. Replace the placeholder values with your actual Supabase credentials
2. Test sign up, sign in, and Google OAuth
3. Check the Supabase dashboard for new users

## Features Included

✅ **Email/Password Authentication**
✅ **Google OAuth Integration** 
✅ **User Session Management**
✅ **Email Confirmation**
✅ **Password Reset** (ready to implement)
✅ **User Metadata** (first name, last name)
✅ **Admin Detection**

## Security Notes

- Never expose your service role key in frontend code
- Use Row Level Security (RLS) for database access
- Validate user input on both frontend and backend
- Use HTTPS in production

Your WinterSolace authentication system is now ready for production! 🚀



