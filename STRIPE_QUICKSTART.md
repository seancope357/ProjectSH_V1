# Stripe Connect - Quick Start Guide

Get your Stripe Connect integration running in 5 minutes.

## Prerequisites
- Stripe account (sign up at https://stripe.com)
- Node.js and npm installed
- SequenceHUB running locally

## 5-Minute Setup

### Step 1: Get Your Stripe Keys (2 minutes)

1. **Standard API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy both keys (keep tab open)

2. **Connect Client ID**
   - Go to: https://dashboard.stripe.com/settings/applications
   - Enable Connect if prompted
   - Copy the Client ID (starts with `ca_`)

3. **Create Webhook**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - URL: `http://localhost:3000/api/stripe/webhooks`
   - Events: `account.updated`, `account.application.deauthorized`, `capability.updated`
   - Copy the webhook secret (starts with `whsec_`)

4. **Add Redirect URI**
   - Still at: https://dashboard.stripe.com/settings/applications
   - Under "OAuth settings", click "Add redirect URI"
   - Add: `http://localhost:3000/api/stripe/connect/callback`
   - Save

### Step 2: Configure Environment Variables (1 minute)

Create/update `.env.local` in your project root:

```bash
# Copy from your Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Already in your .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Restart Your Server (30 seconds)

```bash
# Stop your dev server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Test the Integration (1 minute)

1. Go to: http://localhost:3000/seller-onboarding
2. Navigate to the "Payout Setup" step
3. Click "Connect with Stripe"
4. Fill in test data:
   - Business type: Individual
   - SSN: 000-00-0000
   - Phone: +1 555-555-5555
   - DOB: Any future date
5. Complete the form and submit

### Step 5: Verify It Works (30 seconds)

After submission, you should:
- See a green "Payment Account Connected" message
- Status should show "active" or "pending"
- Check your database - `seller_profiles.stripe_account_id` should be populated

## Test Mode Webhook Testing

For local webhook testing, use Stripe CLI:

```bash
# Install Stripe CLI (Mac)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Copy the webhook signing secret it outputs
# Replace STRIPE_WEBHOOK_SECRET in .env.local
# Restart your server

# Test triggering events
stripe trigger account.updated
```

## Common Issues

### "Stripe configuration missing"
- Check `.env.local` file exists
- Verify all 4 Stripe variables are set
- Restart your dev server

### "OAuth redirect URI mismatch"
- Verify you added `http://localhost:3000/api/stripe/connect/callback` in Stripe Dashboard
- Check for typos or extra spaces

### "Webhook signature verification failed"
- For local testing, use Stripe CLI's webhook secret
- Copy it exactly as shown by the CLI
- Don't use the Dashboard webhook secret for local testing

## What's Next?

- Read `STRIPE_CONNECT_SETUP.md` for detailed configuration
- Review `STRIPE_IMPLEMENTATION_SUMMARY.md` for architecture details
- Test different scenarios (pending, restricted, cancelled)
- When ready for production, switch to live mode keys

## Quick Reference

### API Endpoints Created
```
GET  /api/stripe/connect              - Initiate OAuth
GET  /api/stripe/connect/callback     - Handle OAuth callback
GET  /api/stripe/connect/status       - Check account status
POST /api/stripe/webhooks             - Receive Stripe events
```

### Account Status States
- `not_started` - No account connected
- `pending` - Onboarding incomplete or verifying
- `active` - Ready to receive payments
- `restricted` - Account disabled, needs attention

### Test SSN (works in test mode)
- US: 000-00-0000
- Other valid formats accepted

### Support
- Setup issues: Check `STRIPE_CONNECT_SETUP.md`
- Architecture questions: Check `STRIPE_IMPLEMENTATION_SUMMARY.md`
- Stripe docs: https://stripe.com/docs/connect

---

**Ready to Go?** Follow the 5 steps above and start testing!
