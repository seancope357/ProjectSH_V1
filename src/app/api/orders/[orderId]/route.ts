import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params

    // Try Prisma first, fallback to Supabase
    try {
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
                          displayName: true,
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
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      const order = await SupabaseDB.getOrderById(orderId)
      
      if (!order || order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json(order)
    }
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}