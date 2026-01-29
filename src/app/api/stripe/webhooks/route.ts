import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'

/**
 * Stripe Webhooks Handler
 *
 * This endpoint receives and processes webhook events from Stripe to keep our
 * database synchronized with Stripe Connect account status changes in real-time.
 *
 * Security:
 * - Verifies webhook signatures using STRIPE_WEBHOOK_SECRET
 * - Rejects requests with invalid signatures
 * - Uses raw request body for signature verification
 *
 * Handled events:
 * - account.updated: Connected account status changes
 * - account.application.deauthorized: User disconnects account
 * - capability.updated: Account capabilities change (charges, payouts)
 * - person.updated: Person verification status changes
 *
 * Setup instructions:
 * 1. Go to Stripe Dashboard > Developers > Webhooks
 * 2. Add endpoint: https://yourdomain.com/api/stripe/webhooks
 * 3. Select events to listen for (account.*, capability.*)
 * 4. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET env var
 *
 * Testing:
 * - Use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhooks
 * - Trigger events: stripe trigger account.updated
 *
 * @param request - Next.js request with webhook payload
 * @returns 200 OK response to acknowledge receipt
 */
export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    // Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Stripe Webhooks] STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[Stripe Webhooks] STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })

    // Get the raw request body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('[Stripe Webhooks] No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify the webhook signature to ensure it came from Stripe
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('[Stripe Webhooks] Signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Stripe Webhooks] Event received:', event.type)
      console.log('[Stripe Webhooks] Event ID:', event.id)
    }

    // Initialize Supabase client (we'll use service role key for webhook operations)
    // Note: createClient() from server.ts uses cookies, which webhooks don't have
    // For webhooks, we need to use the service client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseKey) {
      console.error('[Stripe Webhooks] SUPABASE_SERVICE_ROLE_KEY not configured')
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabase = createServiceClient(supabaseUrl, supabaseKey)

    // Handle different event types
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account, supabase)
        break

      case 'account.application.deauthorized':
        await handleAccountDeauthorized(event.data.object as any, supabase)
        break

      case 'capability.updated':
        // When capabilities change, fetch the full account and update
        const capability = event.data.object as Stripe.Capability
        const account = await stripe.accounts.retrieve(capability.account as string)
        await handleAccountUpdated(account, supabase)
        break

      case 'person.updated':
        // Person verification status changed, update the account
        const person = event.data.object as Stripe.Person
        const personAccount = await stripe.accounts.retrieve(person.account as string)
        await handleAccountUpdated(personAccount, supabase)
        break

      default:
        if (process.env.NODE_ENV === 'development') {
          console.log('[Stripe Webhooks] Unhandled event type:', event.type)
        }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Stripe Webhooks] Error processing webhook:', error)
    // Still return 200 to prevent Stripe from retrying
    // Log the error for investigation
    return NextResponse.json(
      { error: 'Webhook processing error', received: true },
      { status: 200 }
    )
  }
}

/**
 * Handle account.updated webhook event
 * Updates seller profile with latest account status
 */
async function handleAccountUpdated(account: Stripe.Account, supabase: any) {
  try {
    const accountId = account.id
    const hasChargesEnabled = account.charges_enabled
    const hasPayoutsEnabled = account.payouts_enabled
    const detailsSubmitted = account.details_submitted
    const isRestricted = account.requirements?.disabled_reason !== null

    // Determine account status
    let accountStatus: 'not_started' | 'pending' | 'active' | 'restricted'

    if (isRestricted) {
      accountStatus = 'restricted'
    } else if (hasChargesEnabled && hasPayoutsEnabled) {
      accountStatus = 'active'
    } else if (detailsSubmitted || account.requirements?.currently_due?.length > 0) {
      accountStatus = 'pending'
    } else {
      accountStatus = 'not_started'
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Stripe Webhooks] Updating account:', accountId)
      console.log('[Stripe Webhooks] New status:', accountStatus)
    }

    // Update seller profile
    const { error: updateError } = await supabase
      .from('seller_profiles')
      .update({
        stripe_account_status: accountStatus,
        stripe_charges_enabled: hasChargesEnabled,
        stripe_payouts_enabled: hasPayoutsEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', accountId)

    if (updateError) {
      console.error('[Stripe Webhooks] Failed to update seller profile:', updateError)
      throw updateError
    }

    // If account is now active, mark payout step as completed
    if (accountStatus === 'active') {
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('stripe_account_id', accountId)
        .single()

      if (sellerProfile) {
        await supabase
          .from('seller_onboarding_progress')
          .update({
            step_payout_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sellerProfile.id)
      }
    }

    console.log('[Stripe Webhooks] Successfully updated account:', accountId)
  } catch (error) {
    console.error('[Stripe Webhooks] Error in handleAccountUpdated:', error)
    throw error
  }
}

/**
 * Handle account.application.deauthorized webhook event
 * User has disconnected their Stripe account from our platform
 */
async function handleAccountDeauthorized(data: any, supabase: any) {
  try {
    const accountId = data.account

    if (process.env.NODE_ENV === 'development') {
      console.log('[Stripe Webhooks] Account deauthorized:', accountId)
    }

    // Clear Stripe account information from seller profile
    const { error: updateError } = await supabase
      .from('seller_profiles')
      .update({
        stripe_account_id: null,
        stripe_account_status: 'not_started',
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', accountId)

    if (updateError) {
      console.error('[Stripe Webhooks] Failed to clear account:', updateError)
      throw updateError
    }

    // Mark payout step as incomplete
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('stripe_account_id', accountId)
      .single()

    if (sellerProfile) {
      await supabase
        .from('seller_onboarding_progress')
        .update({
          step_payout_completed: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sellerProfile.id)
    }

    console.log('[Stripe Webhooks] Successfully deauthorized account:', accountId)
  } catch (error) {
    console.error('[Stripe Webhooks] Error in handleAccountDeauthorized:', error)
    throw error
  }
}

/**
 * Rate limiting helper
 * In production, implement proper rate limiting using a service like Upstash Redis
 * or a rate limiting library to prevent abuse
 */
function shouldRateLimit(ip: string): boolean {
  // TODO: Implement rate limiting
  // For now, we rely on Stripe's webhook signature verification
  return false
}
