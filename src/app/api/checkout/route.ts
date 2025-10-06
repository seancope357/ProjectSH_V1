import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/supabase-db'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, successUrl, cancelUrl } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    // Validate and fetch sequence details
    const sequenceIds = items.map(item => item.sequenceId)
    const sequences = await db.sequences.findByIds(sequenceIds)

    if (sequences.length !== items.length) {
      return NextResponse.json(
        { error: 'Some sequences not found' },
        { status: 404 }
      )
    }

    // Create line items for Stripe
    const lineItems = sequences.map((sequence: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: sequence.title,
          description: sequence.description,
          images: sequence.thumbnail_url ? [sequence.thumbnail_url] : [],
          metadata: {
            sequenceId: sequence.id,
            sellerId: sequence.seller_id,
          },
        },
        unit_amount: Math.round(sequence.price * 100), // Convert to cents
      },
      quantity: 1,
    }))

    // Calculate order totals aligned with schema (DECIMAL fields)
    const subtotal = sequences.reduce((sum: number, seq: any) => sum + Number(seq.price || 0), 0)
    const tax = 0 // apply tax rules as needed
    const platformFee = Number((subtotal * 0.15 + 0.5 * sequences.length).toFixed(2))
    const total = Number((subtotal + tax + platformFee).toFixed(2))

    // Create pending order (matching supabase-schema.sql)
    const order = await db.orders.create({
      user_id: user.id,
      status: 'pending',
      subtotal,
      tax,
      platform_fee: platformFee,
      total,
      items: sequences.map((seq: any) => {
        const sellerPayout = Number((Number(seq.price || 0) - (Number(seq.price || 0) * 0.15 + 0.5)).toFixed(2))
        return {
          sequence_id: seq.id,
          price: seq.price,
          seller_id: seq.seller_id,
          seller_payout: sellerPayout,
        }
      }),
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: user.email,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          userId: user.id,
        },
      },
    })

    // Optional: store Stripe session id if you add the column later
    // await db.orders.update(order.id, { stripe_session_id: session.id })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    return NextResponse.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      orderId: (session.metadata as any)?.orderId || null,
      userId: (session.metadata as any)?.userId || null,
    })
  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}