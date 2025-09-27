import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SupabaseDB } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
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
      console.error('Prisma search error, falling back to Supabase:', prismaError)
      
      // Fallback to Supabase
      const sequences = await SupabaseDB.searchSequences(query, {
        category: category || undefined,
        limit,
      })

      // Format sequences for response (simplified for Supabase)
      const formattedSequences = sequences.map(sequence => ({
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        price: sequence.price,
        category: sequence.category,
        tags: sequence.tags,
        rating: sequence.rating || 0,
        downloads: sequence.downloadCount || 0,
        reviewCount: 0, // Not available in simple Supabase query
        createdAt: sequence.createdAt,
        updatedAt: sequence.updatedAt,
        previewUrl: sequence.previewUrl,
        seller: {
          name: 'Seller', // Simplified for fallback
          storefront: 'Store',
        },
      }))

      return NextResponse.json({
        sequences: formattedSequences,
        pagination: {
          page,
          limit,
          total: sequences.length,
          pages: Math.ceil(sequences.length / limit),
        },
      })
    }
  } catch (error) {
    console.error('Search sequences error:', error)
    return NextResponse.json(
      { error: 'Failed to search sequences' },
      { status: 500 }
    )
  }
}