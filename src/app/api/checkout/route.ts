import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { calcOrderFees } from '@/lib/fees'

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
    const sequences = await prisma.sequence.findMany({
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

    if (sequences.length !== items.length) {
      return NextResponse.json({ error: 'Some sequences not found or inactive' }, { status: 400 })
    }

    // Calculate fees
    const feeCalculation = calcOrderFees(items)

    // Create order in database
    const order = await prisma.order.create({
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
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id },
    })

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