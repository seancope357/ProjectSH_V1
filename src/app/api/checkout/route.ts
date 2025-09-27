import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { calcOrderFees } from '@/lib/fees'
import { SupabaseDB } from '@/lib/supabase-db'

interface CheckoutItem {
  sequenceId: string
  price: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items }: { items: CheckoutItem[] } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Validate sequences exist and are active
    let sequences
    try {
      sequences = await prisma.sequence.findMany({
        where: {
          id: { in: items.map(item => item.sequenceId) },
          isActive: true,
          isApproved: true,
        },
        include: {
          storefront: {
            include: {
              sellerProfile: true,
            },
          },
        },
      })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - get sequences by IDs
      const sequenceIds = items.map(item => item.sequenceId)
      const supabaseSequences = []
      
      for (const sequenceId of sequenceIds) {
        const sequence = await SupabaseDB.getSequenceById(sequenceId)
        if (sequence && sequence.isActive && sequence.isApproved) {
          supabaseSequences.push(sequence)
        }
      }
      
      sequences = supabaseSequences
    }

    if (sequences.length !== items.length) {
      return NextResponse.json({ error: 'Some sequences not found or inactive' }, { status: 400 })
    }

    // Calculate fees
    const feeCalculation = calcOrderFees(items)

    // Create order in database
    let order
    try {
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: 'PENDING',
          subtotal: feeCalculation.subtotal,
          platformFee: feeCalculation.totalPlatformFee,
          total: feeCalculation.subtotal + feeCalculation.totalPlatformFee,
          items: {
            create: items.map((item, index) => ({
              sequenceId: item.sequenceId,
              price: item.price,
              platformFee: feeCalculation.itemFees[index].platformFeeTotal,
            })),
          },
        },
      })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - create order
      order = await SupabaseDB.createOrder({
        userId: session.user.id,
        status: 'PENDING',
        subtotal: feeCalculation.subtotal,
        platformFee: feeCalculation.totalPlatformFee,
        total: feeCalculation.subtotal + feeCalculation.totalPlatformFee,
        items: items.map((item, index) => ({
          sequenceId: item.sequenceId,
          price: item.price,
          platformFee: feeCalculation.itemFees[index].platformFeeTotal,
        })),
      })
      
      if (!order) {
        return NextResponse.json(
          { error: 'Failed to create order' },
          { status: 500 }
        )
      }
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update order with Stripe payment ID
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentId: paymentIntent.id },
      })
    } catch (prismaError) {
      console.error('Prisma error updating order, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase - update order
      await SupabaseDB.updateOrder(order.id, {
        stripePaymentId: paymentIntent.id,
      })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      total: order.total,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}