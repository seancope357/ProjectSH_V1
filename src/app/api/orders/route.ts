import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Try Prisma first, fallback to Supabase
    try {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId: session.user.id },
          include: {
            items: {
              include: {
                sequence: {
                  select: {
                    title: true,
                    previewUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({
          where: { userId: session.user.id },
        }),
      ])

      return NextResponse.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (prismaError) {
      console.error('Prisma error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      const orders = await SupabaseDB.getUserOrders(session.user.id)
      
      // Simple pagination for Supabase fallback
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedOrders = orders.slice(startIndex, endIndex)

      return NextResponse.json({
        orders: paginatedOrders,
        pagination: {
          page,
          limit,
          total: orders.length,
          pages: Math.ceil(orders.length / limit),
        },
      })
    }
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    )
  }
}