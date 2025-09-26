import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build where clause
    const where: any = {
      isActive: true,
      isApproved: true,
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ]
    }

    if (category) {
      where.category = category
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { downloadCount: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const skip = (page - 1) * limit

    const [sequences, total] = await Promise.all([
      prisma.sequence.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.sequence.count({ where }),
    ])

    // Format the response
    const formattedSequences = sequences.map((sequence) => ({
      id: sequence.id,
      title: sequence.title,
      description: sequence.description,
      price: sequence.price / 100, // Convert from cents
      category: sequence.category,
      tags: sequence.tags,
      rating: sequence.rating || 0,
      downloads: sequence.downloadCount || 0,
      createdAt: sequence.createdAt.toISOString(),
      previewUrl: sequence.previewUrl,
      seller: {
        name: sequence.storefront.sellerProfile.displayName,
      },
      reviewCount: sequence._count.reviews,
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
    console.error('Search sequences error:', error)
    return NextResponse.json(
      { error: 'Failed to search sequences' },
      { status: 500 }
    )
  }
}