import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'

/**
 * Stripe Connect Account Status Endpoint
 *
 * This endpoint checks the current status of a seller's Stripe Connect account
 * by fetching the latest information from Stripe's API and updating the database.
 *
 * Use cases:
 * - Periodic status checks in the onboarding flow
 * - Refreshing account status in seller dashboard
 * - Verifying account capabilities before allowing actions
 *
 * The endpoint returns comprehensive account information including:
 * - Overall status (not_started, pending, active, restricted)
 * - Charges enabled status
 * - Payouts enabled status
 * - Outstanding requirements
 * - Account restrictions
 *
 * @param request - Next.js request object
 * @returns JSON response with account status details
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Stripe Status] STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })

    // Verify user authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch seller profile to get Stripe account ID
    const { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Stripe Status] Failed to fetch seller profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch seller profile' },
        { status: 500 }
      )
    }

    // If no Stripe account is connected, return not_started status
    if (!sellerProfile?.stripe_account_id) {
      return NextResponse.json({
        status: 'not_started',
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirements: {
          currentlyDue: [],
          eventuallyDue: [],
          pastDue: [],
        },
        restrictions: null,
      })
    }

    // Fetch the latest account information from Stripe
    let accountDetails: Stripe.Account
    try {
      accountDetails = await stripe.accounts.retrieve(sellerProfile.stripe_account_id)
    } catch (stripeError: any) {
      console.error('[Stripe Status] Failed to retrieve account:', stripeError)

      // If the account no longer exists, update database to reflect this
      if (stripeError.code === 'account_invalid') {
        await supabase
          .from('seller_profiles')
          .update({
            stripe_account_id: null,
            stripe_account_status: 'not_started',
            stripe_charges_enabled: false,
            stripe_payouts_enabled: false,
          })
          .eq('id', user.id)

        return NextResponse.json({
          status: 'not_started',
          accountId: null,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          error: 'Stripe account no longer exists',
        })
      }

      return NextResponse.json(
        { error: 'Failed to fetch account status from Stripe' },
        { status: 500 }
      )
    }

    // Determine account status based on Stripe's data
    const hasChargesEnabled = accountDetails.charges_enabled
    const hasPayoutsEnabled = accountDetails.payouts_enabled
    const detailsSubmitted = accountDetails.details_submitted
    const isRestricted = accountDetails.requirements?.disabled_reason !== null

    let accountStatus: 'not_started' | 'pending' | 'active' | 'restricted'

    if (isRestricted) {
      accountStatus = 'restricted'
    } else if (hasChargesEnabled && hasPayoutsEnabled) {
      accountStatus = 'active'
    } else if (detailsSubmitted || accountDetails.requirements?.currently_due?.length > 0) {
      accountStatus = 'pending'
    } else {
      accountStatus = 'not_started'
    }

    // Check if status has changed and update database
    if (
      accountStatus !== sellerProfile.stripe_account_status ||
      hasChargesEnabled !== sellerProfile.stripe_charges_enabled ||
      hasPayoutsEnabled !== sellerProfile.stripe_payouts_enabled
    ) {
      const { error: updateError } = await supabase
        .from('seller_profiles')
        .update({
          stripe_account_status: accountStatus,
          stripe_charges_enabled: hasChargesEnabled,
          stripe_payouts_enabled: hasPayoutsEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('[Stripe Status] Failed to update seller profile:', updateError)
        // Don't fail the entire request for this
      }

      // Update onboarding progress if account is now active
      if (accountStatus === 'active') {
        await supabase
          .from('seller_onboarding_progress')
          .update({
            step_payout_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Stripe Status] Account status:', accountStatus)
      console.log('[Stripe Status] Charges enabled:', hasChargesEnabled)
      console.log('[Stripe Status] Payouts enabled:', hasPayoutsEnabled)
      console.log('[Stripe Status] Currently due:', accountDetails.requirements?.currently_due?.length || 0)
    }

    // Return comprehensive status information
    return NextResponse.json({
      status: accountStatus,
      accountId: sellerProfile.stripe_account_id,
      chargesEnabled: hasChargesEnabled,
      payoutsEnabled: hasPayoutsEnabled,
      detailsSubmitted: detailsSubmitted,
      requirements: {
        currentlyDue: accountDetails.requirements?.currently_due || [],
        eventuallyDue: accountDetails.requirements?.eventually_due || [],
        pastDue: accountDetails.requirements?.past_due || [],
        pendingVerification: accountDetails.requirements?.pending_verification || [],
      },
      restrictions: {
        disabled: isRestricted,
        disabledReason: accountDetails.requirements?.disabled_reason || null,
      },
      metadata: {
        country: accountDetails.country,
        defaultCurrency: accountDetails.default_currency,
        email: accountDetails.email,
        type: accountDetails.type,
      },
    })
  } catch (error: any) {
    console.error('[Stripe Status] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check account status',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint to manually trigger a status refresh
 * Useful for polling or user-initiated refresh actions
 */
export async function POST(request: NextRequest) {
  // Reuse the GET logic for status checks
  return GET(request)
}
