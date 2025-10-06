import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/supabase-db'
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
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in session metadata')
      return
    }

    // Update order status (align with schema)
    await db.orders.update(orderId, {
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent as string,
    })

    // Get order details to create download records
    const order = await db.orders.findById(orderId)
    if (order && order.items) {
      // Create download records for each sequence
      for (const item of order.items) {
        const sequence = await db.sequences.findById(item.sequence_id)
        await db.downloads.create({
          user_id: order.user_id,
          sequence_id: item.sequence_id,
          order_id: orderId,
          download_url: sequence?.file_url ?? null,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        })
        // Update sequence download count
        if (sequence) {
          await db.sequences.update(item.sequence_id, {
            download_count: (sequence.download_count || 0) + 1,
          })
        }
      }
    }

    console.log('Checkout session completed for order:', orderId)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    // Update order status
    await db.orders.update(orderId, {
      status: 'completed',
      stripe_payment_intent_id: paymentIntent.id,
    })

    console.log('Payment succeeded for order:', orderId)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // TODO: Implement payment failure handling with Supabase
    console.log('Payment failed:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // TODO: Implement account update handling with Supabase
    console.log('Account updated:', account.id)
  } catch (error) {
    console.error('Error handling account update:', error)
  }
}