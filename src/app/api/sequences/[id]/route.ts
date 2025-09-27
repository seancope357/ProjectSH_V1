import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        storefront: {
          select: {
            id: true,
            name: true,
            sellerProfile: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: {
            id: true,
            version: true,
            fileUrl: true,
            fileSize: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    // Format the response
    const formattedSequence = {
      id: sequence.id,
      title: sequence.title,
      description: sequence.description,
      price: sequence.price,
      thumbnailUrl: sequence.thumbnailUrl,
      previewUrl: sequence.previewUrl,
      category: sequence.category,
      tags: sequence.tags,
      isActive: sequence.isActive,
      createdAt: sequence.createdAt,
      updatedAt: sequence.updatedAt,
      storefront: sequence.storefront,
      latestVersion: sequence.versions[0] || null,
      stats: {
        purchases: sequence._count.orderItems,
        reviews: sequence._count.reviews,
      },
    }

    return NextResponse.json(formattedSequence)
  } catch (error) {
    console.error('Get sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sequence' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Try Prisma first, fallback to Supabase
    const sequence = await prisma.sequence.update({
      where: {
        id,
        storefront: {
          sellerProfile: {
            userId: session.user.id,
          },
        },
      },
      data: {
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        price: body.price,
        category: body.category,
        tags: body.tags,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(sequence)
  } catch (error) {
    console.error('Update sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Try Prisma first, fallback to Supabase
    await prisma.sequence.delete({
      where: {
        id,
        storefront: {
          sellerProfile: {
            userId: session.user.id,
          },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    )
  }
}