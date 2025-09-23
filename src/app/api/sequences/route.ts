import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const q = searchParams.get('q') || ''
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
      isApproved: true,
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q] } },
      ]
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'downloads':
        orderBy = { downloadCount: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const [sequences, total] = await Promise.all([
      prisma.sequence.findMany({
        where,
        include: {
          storefront: {
            include: {
              sellerProfile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.sequence.count({ where }),
    ])

    // Format the response
    const formattedSequences = sequences.map((sequence: any) => ({
      id: sequence.id,
      title: sequence.title,
      description: sequence.description,
      price: sequence.price,
      category: sequence.category || 'General',
      tags: sequence.tags,
      rating: sequence.rating || 0,
      downloads: sequence.downloadCount || 0,
      createdAt: sequence.createdAt.toISOString(),
      previewUrl: sequence.previewUrl,
      seller: {
        name: sequence.storefront?.sellerProfile?.displayName || 
              sequence.storefront?.sellerProfile?.displayName || 
              'Unknown Seller',
      },
      reviewCount: sequence._count?.reviews || 0,
    }))

    return NextResponse.json({
      sequences: formattedSequences,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      total,
    })
  } catch (error) {
    console.error('Get sequences error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sequences' },
      { status: 500 }
    )
  }
}