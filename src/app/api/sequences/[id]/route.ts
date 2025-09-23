import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const sequence = await prisma.sequence.findUnique({
      where: { 
        id,
        isActive: true,
        isApproved: true,
      },
      include: {
        storefront: {
          include: {
            sellerProfile: {
              select: {
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        compatibilityProfiles: true,
        _count: {
          select: {
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
      category: sequence.category,
      tags: sequence.tags,
      rating: sequence.rating || 0,
      downloads: sequence.downloadCount || 0,
      createdAt: sequence.createdAt.toISOString(),
      updatedAt: sequence.updatedAt.toISOString(),
      previewUrl: sequence.previewUrl,
      seller: {
        name: sequence.storefront.sellerProfile?.displayName || 
              sequence.storefront.sellerProfile?.displayName || 
              'Unknown Seller',
        avatar: sequence.storefront.sellerProfile?.avatar,
      },
      reviews: sequence.reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: {
          name: review.user.name,
          image: review.user.image,
        },
      })),
      reviewCount: sequence._count.reviews,
      compatibilityProfiles: sequence.compatibilityProfiles,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Check if user owns this sequence or is admin
    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        storefront: {
          include: {
            sellerProfile: true,
          },
        },
      },
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    const isOwner = sequence.storefront.sellerProfile?.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update sequence
    const updatedSequence = await prisma.sequence.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedSequence)
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if user owns this sequence or is admin
    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        storefront: {
          include: {
            sellerProfile: true,
          },
        },
      },
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    const isOwner = sequence.storefront.sellerProfile?.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete by setting isActive to false
    await prisma.sequence.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
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