import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const [orders, total] = await Promise.all([
       prisma.order.findMany({
         where: { userId: session.user.id },
         include: {
           items: {
             include: {
               sequence: {
                 select: {
                   id: true,
                   title: true,
                   thumbnailUrl: true,
                   price: true,
                 },
               },
             },
           },
         },
         orderBy: { createdAt: 'desc' },
         skip: offset,
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
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}