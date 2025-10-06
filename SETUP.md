# SequenceHUB Setup Guide

This guide will help you set up your SequenceHUB marketplace with Vercel and Supabase.

## Prerequisites

- Node.js 18+ installed
- A Vercel account
- A Supabase account
- A Stripe account (for payments)
- A Google Cloud account (for OAuth)

## 1. Supabase Setup

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

### Step 2: Get Supabase Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Set up Database
1. In Supabase dashboard, go to Settings → Database
2. Copy the **Connection string** → `DATABASE_URL`
3. Also copy the **Connection pooling** URLs for production:
   - **Transaction mode** → `POSTGRES_PRISMA_URL`
   - **Direct connection** → `POSTGRES_URL_NON_POOLING`

### Step 4: Configure Authentication
1. Go to Authentication → Settings
2. Add your domain to **Site URL** (e.g., `https://project-sh-v1.vercel.app`)
3. Add redirect URLs under **Redirect URLs**:
   - `https://project-sh-v1.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## 2. Vercel Setup

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project

### Step 2: Configure Environment Variables
In your Vercel project settings, add these environment variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://project-sh-v1.vercel.app
# NextAuth variables are no longer needed - using Supabase authentication
# NEXTAUTH_URL=https://your-app.vercel.app
# NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Database Configuration
DATABASE_URL=postgresql://postgres:password@host:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_PRISMA_URL=postgresql://postgres:password@host:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:password@host:5432/postgres?sslmode=require

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key

# Platform Fee Configuration
PLATFORM_FEE_PERCENT=15
PLATFORM_FEE_FIXED_CENTS=50
```

### Step 3: Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://project-sh-v1.vercel.app`

## 3. Database Migration

After deployment, you need to set up your database schema:

### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run database migration
vercel env pull .env.local
npx prisma generate
npx prisma db push
```

### Option 2: Using Supabase SQL Editor
1. Go to your Supabase dashboard → SQL Editor
2. Run the Prisma migration SQL (generated from `prisma db push`)

## 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `https://project-sh-v1.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your environment variables

## 5. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers → API keys
3. Set up webhooks at Developers → Webhooks:
   - Endpoint URL: `https://project-sh-v1.vercel.app/api/webhooks/stripe`
   - Events to send: `payment_intent.succeeded`, `account.updated`, etc.
4. Copy the webhook signing secret

## 6. Testing Your Setup

1. Visit your deployed app
2. Try signing up/signing in
3. Test creating a seller account
4. Test uploading sequences
5. Test the purchase flow

## 7. Local Development

For local development:

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Fill in your environment variables
4. Run:
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Troubleshooting

### Common Issues:

1. **Database connection errors**: Check your DATABASE_URL format
2. **Authentication not working**: Verify redirect URLs in Google OAuth and Supabase
3. **Stripe webhooks failing**: Ensure webhook URL is correct and accessible
4. **Build failures**: Check that all environment variables are set in Vercel

### Getting Help:

- Check Vercel deployment logs
- Check Supabase logs in the dashboard
- Use browser developer tools to debug client-side issues
- Check the Next.js and Prisma documentation

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Regularly rotate API keys
- Monitor your Stripe dashboard for unusual activity
- Set up proper CORS policies in Supabase