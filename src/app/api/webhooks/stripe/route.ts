import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    console.error('No orderId in payment intent metadata')
    return
  }

  try {
    // Update order status
    let order
    try {
      order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'COMPLETED',
        },
        include: {
          items: {
            include: {
              sequence: {
                include: {
                  storefront: {
                    include: {
                      sellerProfile: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      order = await SupabaseDB.updateOrder(orderId, {
        status: 'COMPLETED',
      })
      
      if (!order) {
        console.error(`Failed to update order ${orderId} status`)
        return
      }
      
      // Get order details for processing transfers
      order = await SupabaseDB.getOrderById(orderId)
    }

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return
    }

    // Process transfers to sellers
    for (const item of order.items || []) {
      const seller = item.sequence?.storefront?.sellerProfile
      
      if (seller?.stripeAccountId) {
        const transferAmount = item.price - item.platformFee

        await stripe.transfers.create({
          amount: transferAmount,
          currency: 'usd',
          destination: seller.stripeAccountId,
          metadata: {
            orderId: order.id,
            sequenceId: item.sequenceId,
            sellerId: seller.id,
          },
        })
      }
    }

    console.log(`Order ${orderId} completed successfully`)
  } catch (error) {
    console.error(`Failed to process successful payment for order ${orderId}:`, error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    console.error('No orderId in payment intent metadata')
    return
  }

  try {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      await SupabaseDB.updateOrder(orderId, {
        status: 'CANCELLED',
      })
    }

    console.log(`Order ${orderId} marked as cancelled`)
  } catch (error) {
    console.error(`Failed to update failed order ${orderId}:`, error)
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    let seller
    try {
      seller = await prisma.sellerProfile.findFirst({
        where: { stripeAccountId: account.id },
      })

      if (seller) {
        await prisma.sellerProfile.update({
          where: { id: seller.id },
          data: {
            stripeOnboarded: account.details_submitted && account.charges_enabled,
          },
        })
      }
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - find user with matching stripe account
      // This is a simplified approach since we don't have direct seller profile lookup
      // In a real implementation, you might store this mapping in Supabase metadata
      console.log(`Stripe account ${account.id} updated, but seller profile lookup failed`)
      return
    }

    if (seller) {
      console.log(`Updated seller ${seller.id} onboarding status`)
    }
  } catch (error) {
    console.error(`Failed to update seller account ${account.id}:`, error)
  }
}