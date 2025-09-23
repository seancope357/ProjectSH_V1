import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a seller profile
    let sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })

    let stripeAccountId = sellerProfile?.stripeAccountId

    // Create Stripe Connect account if it doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: session.user.email!,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      
      stripeAccountId = account.id

      // Create or update seller profile
      if (sellerProfile) {
        await prisma.sellerProfile.update({
          where: { id: sellerProfile.id },
          data: { stripeAccountId },
        })
      } else {
        await prisma.sellerProfile.create({
          data: {
            userId: session.user.id,
            displayName: session.user.name || 'Seller',
            stripeAccountId,
          },
        })
      }
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/onboarding?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ 
      onboardingUrl: accountLink.url,
      accountId: stripeAccountId 
    })
  } catch (error) {
    console.error('Stripe Connect initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize Stripe Connect' },
      { status: 500 }
    )
  }
}