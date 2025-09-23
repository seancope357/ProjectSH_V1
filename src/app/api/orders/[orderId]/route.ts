import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = params

    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        userId: session.user.id, // Ensure user can only access their own orders
      },
      include: {
        items: {
          include: {
            sequence: {
              include: {
                storefront: {
                  select: {
                    name: true,
                    sellerProfile: {
                      select: {
                        businessName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    )
  }
}