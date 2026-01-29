# Stripe Connect Integration Setup Guide

This guide walks you through setting up Stripe Connect for the SequenceHUB marketplace seller onboarding flow.

## Overview

The implementation includes:
- **OAuth Flow**: Secure Stripe Connect account linking
- **Account Status Tracking**: Real-time status updates via webhooks
- **Account Management**: Refresh and reconnection capabilities
- **Security**: Webhook signature verification, CSRF protection, RLS policies

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Access to your Stripe Dashboard
3. Your SequenceHUB application running locally or deployed

## Step 1: Enable Stripe Connect

### 1.1 Activate Connect in Stripe Dashboard

1. Go to https://dashboard.stripe.com/settings/connect
2. Click **"Get started with Connect"**
3. Choose **"Platform or marketplace"** as your use case
4. Complete the Connect activation form:
   - Business name: SequenceHUB
   - Business type: Marketplace
   - Industry: Digital Goods / Software
   - Website URL: Your domain

### 1.2 Configure Connect Settings

1. Under **Connect Settings** (https://dashboard.stripe.com/settings/connect/general):
   - **Platform profile name**: SequenceHUB
   - **Support email**: Your support email
   - **Brand icon**: Upload your logo (recommended: 128x128px)
   - **Brand color**: Match your app's primary color

2. Under **OAuth Settings** (https://dashboard.stripe.com/settings/applications):
   - Click **Add redirect URI**
   - For development: `http://localhost:3000/api/stripe/connect/callback`
   - For production: `https://yourdomain.com/api/stripe/connect/callback`
   - **Important**: Add both development and production URLs

## Step 2: Get Your API Keys

### 2.1 Get Standard API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy the following keys:
   - **Publishable key**: Starts with `pk_test_` (test) or `pk_live_` (production)
   - **Secret key**: Starts with `sk_test_` (test) or `sk_live_` (production)

### 2.2 Get Connect Client ID

1. Go to https://dashboard.stripe.com/settings/applications
2. Under **OAuth settings**, copy your **Client ID**
   - Starts with `ca_` (same for test and live mode)

## Step 3: Configure Webhooks

### 3.1 Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your endpoint URL:
   - Development: `http://localhost:3000/api/stripe/webhooks`
   - Production: `https://yourdomain.com/api/stripe/webhooks`

### 3.2 Select Events to Listen For

Select the following events:
- ✅ `account.updated`
- ✅ `account.application.deauthorized`
- ✅ `capability.updated`
- ✅ `person.updated` (optional but recommended)

### 3.3 Get Webhook Secret

1. After creating the endpoint, click on it
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)

## Step 4: Configure Environment Variables

### 4.1 Update Your `.env.local` File

Copy the template from `.env.local.example` and fill in your values:

```bash
# Stripe Standard Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# Stripe Connect
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_your_client_id_here

# Stripe Webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URL (important for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.2 Important Notes

- **Never commit** `.env.local` to version control
- Use **test mode keys** (`pk_test_`, `sk_test_`) during development
- Switch to **live mode keys** (`pk_live_`, `sk_live_`) for production
- The `NEXT_PUBLIC_APP_URL` must match your actual domain

## Step 5: Test the Integration

### 5.1 Using Test Mode

1. Start your development server: `npm run dev`
2. Navigate to the seller onboarding: `/seller-onboarding`
3. Click **"Connect with Stripe"** on the Payout step
4. Use Stripe's test accounts:
   - For US accounts, use any valid SSN format (e.g., 000-00-0000)
   - Use test phone numbers (e.g., +1 555-555-5555)
   - Use future dates for DOB

### 5.2 Testing with Stripe CLI (Local Development)

For local webhook testing:

```bash
# Install Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# The CLI will output a webhook signing secret
# Use this temporary secret in your .env.local for local testing

# In another terminal, trigger test events
stripe trigger account.updated
```

### 5.3 Test Different Account States

Test these scenarios:

1. **New Account Connection**:
   - Complete full onboarding
   - Verify status changes to "active"

2. **Incomplete Onboarding**:
   - Start onboarding but close the window
   - Verify status shows "pending"
   - Click "Continue Setup" to resume

3. **Account Refresh**:
   - Click the refresh button on active accounts
   - Verify status updates from Stripe

4. **Account Restrictions**:
   - In Stripe Dashboard, manually restrict an account
   - Verify UI shows "restricted" status

## Step 6: Database Verification

The database schema already includes all necessary fields:

```sql
-- seller_profiles table
stripe_account_id text unique,
stripe_account_status text default 'not_started'
  check (stripe_account_status in ('not_started', 'pending', 'active', 'restricted')),
stripe_charges_enabled boolean default false,
stripe_payouts_enabled boolean default false,
```

No additional migrations are needed.

## Step 7: Production Deployment

### 7.1 Before Going Live

- [ ] Switch to **live mode keys** in production environment variables
- [ ] Update webhook endpoint URL to production domain
- [ ] Add production redirect URI in Stripe Connect settings
- [ ] Test with a real (non-test) Stripe account
- [ ] Review Stripe Connect [platform agreement](https://stripe.com/connect/legal)

### 7.2 Production Checklist

- [ ] All environment variables configured
- [ ] Webhook endpoint verified and receiving events
- [ ] SSL/TLS certificate active (required for webhooks)
- [ ] Error logging and monitoring configured
- [ ] Rate limiting implemented (recommended)
- [ ] Backup webhook endpoint configured (optional)

## API Endpoints Reference

### GET /api/stripe/connect
Initiates the Stripe Connect OAuth flow.

**Response**:
```json
{
  "url": "https://connect.stripe.com/oauth/authorize?...",
  "isReconnect": false
}
```

### GET /api/stripe/connect/callback
Handles OAuth callback after user completes Stripe onboarding.

**Query Parameters**:
- `code`: Authorization code from Stripe
- `state`: CSRF protection token
- `error`: Error code (if user cancelled)

### GET /api/stripe/connect/status
Checks current Stripe account status.

**Response**:
```json
{
  "status": "active",
  "accountId": "acct_xxx",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "requirements": {
    "currentlyDue": [],
    "eventuallyDue": [],
    "pastDue": []
  }
}
```

### POST /api/stripe/webhooks
Receives webhook events from Stripe.

**Handled Events**:
- `account.updated`: Account status changes
- `account.application.deauthorized`: User disconnects
- `capability.updated`: Capabilities change
- `person.updated`: Verification updates

## Troubleshooting

### Common Issues

#### 1. "Stripe configuration missing" Error
**Cause**: Environment variables not set correctly.
**Solution**:
- Verify `.env.local` file exists
- Check all required variables are present
- Restart the Next.js development server

#### 2. Webhook Signature Verification Failed
**Cause**: Wrong webhook secret or body parsing issue.
**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` matches the dashboard
- For local testing, use Stripe CLI's temporary secret
- Ensure no body parsing middleware interferes

#### 3. OAuth Redirect URI Mismatch
**Cause**: Redirect URI not configured in Stripe Dashboard.
**Solution**:
- Go to https://dashboard.stripe.com/settings/applications
- Add your exact callback URL under "OAuth settings"
- Include both http://localhost:3000 and production URL

#### 4. "Account not found" After Connection
**Cause**: User authenticated but account ID not saved.
**Solution**:
- Check browser console for errors
- Verify Supabase RLS policies allow updates
- Check seller_profiles table for stripe_account_id

### Debug Mode

Enable detailed logging:

```bash
# Add to .env.local
NODE_ENV=development
```

This enables console logs in:
- OAuth initiation (`[Stripe Connect]`)
- Callback handler (`[Stripe Callback]`)
- Status checks (`[Stripe Status]`)
- Webhook processing (`[Stripe Webhooks]`)

## Security Considerations

### Best Practices

1. **Never expose secret keys**: Only `NEXT_PUBLIC_*` variables are safe for client-side
2. **Verify webhook signatures**: Always validate `stripe-signature` header
3. **Use HTTPS in production**: Required for webhooks and OAuth
4. **Implement rate limiting**: Prevent abuse of API endpoints
5. **Monitor webhook delivery**: Check Stripe Dashboard for failed webhooks

### CSRF Protection

The implementation includes state parameter validation:
- State is generated server-side during OAuth initiation
- Verified in the callback handler
- Additional protection via user session validation

## Support Resources

- **Stripe Connect Docs**: https://stripe.com/docs/connect
- **OAuth Integration**: https://stripe.com/docs/connect/oauth-reference
- **Webhooks Guide**: https://stripe.com/docs/webhooks
- **Testing Guide**: https://stripe.com/docs/connect/testing
- **Stripe Support**: https://support.stripe.com

## Implementation Details

### Files Created/Modified

#### New API Routes:
- `/src/app/api/stripe/connect/route.ts` - OAuth initiation
- `/src/app/api/stripe/connect/callback/route.ts` - OAuth callback
- `/src/app/api/stripe/connect/status/route.ts` - Status checks
- `/src/app/api/stripe/webhooks/route.ts` - Webhook handler

#### Modified Components:
- `/src/components/onboarding/steps/PayoutStep.tsx` - Updated UI with status handling
- `/src/app/seller-onboarding/page.tsx` - Integrated API calls and handlers

#### Configuration:
- `.env.local.example` - Updated with Stripe Connect variables

### Account Status States

| Status | Description | UI Display |
|--------|-------------|------------|
| `not_started` | No Stripe account connected | "Connect with Stripe" button |
| `pending` | Onboarding started but incomplete | Yellow warning, "Continue Setup" |
| `active` | Fully verified, can receive payments | Green success message |
| `restricted` | Account disabled by Stripe | Red error, "Resolve Issues" |

### Webhook Event Flow

```
Stripe Event
    ↓
POST /api/stripe/webhooks
    ↓
Verify Signature
    ↓
Parse Event Type
    ↓
Update seller_profiles
    ↓
Update onboarding_progress (if needed)
    ↓
Return 200 OK
```

## Next Steps

After completing setup:

1. **Test thoroughly** in test mode
2. **Monitor webhook delivery** in Stripe Dashboard
3. **Set up error alerts** for failed webhooks
4. **Document internal processes** for handling restricted accounts
5. **Create support documentation** for sellers

---

**Questions?** Check the Stripe Connect documentation or review the inline code comments in the API route handlers.
