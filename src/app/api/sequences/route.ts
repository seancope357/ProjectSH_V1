import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Try Prisma first, fallback to Supabase
    try {
      // Build where clause
      const where: any = {
        isActive: true,
        isApproved: true,
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

      // Format sequences for response
      const formattedSequences = sequences.map(sequence => ({
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        price: sequence.price,
        category: sequence.category,
        tags: sequence.tags,
        rating: sequence.rating || 0,
        downloads: sequence.downloadCount || 0,
        reviewCount: sequence._count.reviews,
        createdAt: sequence.createdAt.toISOString(),
        updatedAt: sequence.updatedAt.toISOString(),
        previewUrl: sequence.previewUrl,
        seller: {
          name: sequence.storefront?.sellerProfile?.displayName || 'Unknown Seller',
          storefront: sequence.storefront?.name || 'Unknown Store',
        },
      }))

      return NextResponse.json({
        sequences: formattedSequences,
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
      const sequences = await SupabaseDB.getSequences({
        category: category || undefined,
        page,
        limit,
      })

      // Format sequences for response
      const formattedSequences = sequences.map((sequence: any) => ({
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        category: sequence.category,
        price: sequence.price,
        rating: sequence.rating || 0,
        downloads: sequence.downloads || 0,
        reviewCount: sequence.reviewCount || 0,
        imageUrl: sequence.imageUrl,
        createdAt: sequence.createdAt,
        updatedAt: sequence.updatedAt,
        storefront: {
          id: sequence.userId,
          name: sequence.userName || 'Unknown',
          image: sequence.userImage || null,
        },
      }))

      const total = sequences.length // This is an approximation since we don't have total count from Supabase
      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        sequences: formattedSequences,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      })
    }
  } catch (error) {
    console.error('Get sequences error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sequences' },
      { status: 500 }
    )
  }
}