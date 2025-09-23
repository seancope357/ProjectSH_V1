import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateCompatibilityScore, CompatibilityInput } from '@/lib/compatibility'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const {
      userInput,
      category,
      sort = 'compatibility',
      page = 1,
      limit = 12,
      minCompatibilityScore = 0
    }: {
      userInput: CompatibilityInput
      category?: string
      sort?: string
      page?: number
      limit?: number
      minCompatibilityScore?: number
    } = body

    if (!userInput) {
      return NextResponse.json(
        { error: 'User input required for compatibility filtering' },
        { status: 400 }
      )
    }

    // Build sequence query filters
    const sequenceWhere: any = {
      isActive: true
    }

    if (category && category !== 'all') {
      sequenceWhere.category = category
    }

    // Get sequences with their compatibility profiles
    const sequences = await prisma.sequence.findMany({
      where: sequenceWhere,
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        compatibilityProfiles: true,
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit * 3 // Get more to filter by compatibility
    })

    // Calculate compatibility scores for each sequence
    const sequencesWithCompatibility = sequences.map((sequence: any) => {
      let bestCompatibilityScore = 0
      let compatibilityDetails = null

      if (sequence.compatibilityProfiles.length > 0) {
        const scores = sequence.compatibilityProfiles.map((profile: any) => {
          const sequenceCompat = {
            propName: profile.propName,
            propCount: profile.propCount,
            pixelCount: profile.pixelCount,
            difficulty: profile.difficulty || undefined
          }

          return calculateCompatibilityScore(userInput, sequenceCompat)
        })

        const bestScore = scores.reduce((best: any, current: any) => 
          current.totalScore > best.totalScore ? current : best
        )

        bestCompatibilityScore = bestScore.totalScore
        compatibilityDetails = bestScore
      }

      // Calculate average rating
      const avgRating = sequence.reviews.length > 0
        ? sequence.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / sequence.reviews.length
        : 0

      return {
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        price: sequence.price,
        previewUrl: sequence.previewUrl,
        category: sequence.category,
        tags: sequence.tags,
        rating: Math.round(avgRating * 10) / 10,
        downloads: sequence._count.orders,
        createdAt: sequence.createdAt.toISOString(),
        seller: {
          name: sequence.seller.user.name || 'Unknown'
        },
        compatibilityScore: bestCompatibilityScore,
        compatibilityDetails,
        isCompatible: bestCompatibilityScore >= minCompatibilityScore
      }
    })

    // Filter by minimum compatibility score
    const compatibleSequences = sequencesWithCompatibility.filter(
      (seq: any) => seq.compatibilityScore >= minCompatibilityScore
    )

    // Sort sequences
    const sortedSequences = [...compatibleSequences]
    
    switch (sort) {
      case 'compatibility':
        sortedSequences.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        break
      case 'newest':
        sortedSequences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        sortedSequences.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'price-low':
        sortedSequences.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sortedSequences.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sortedSequences.sort((a, b) => b.rating - a.rating)
        break
      case 'downloads':
        sortedSequences.sort((a, b) => b.downloads - a.downloads)
        break
    }

    // Paginate results
    const startIndex = (page - 1) * limit
    const paginatedSequences = sortedSequences.slice(startIndex, startIndex + limit)

    // Get total count for pagination
    const totalCompatible = compatibleSequences.length
    const totalPages = Math.ceil(totalCompatible / limit)

    return NextResponse.json({
      sequences: paginatedSequences,
      total: totalCompatible,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
      filters: {
        category,
        sort,
        minCompatibilityScore
      }
    })

  } catch (error) {
    console.error('Failed to fetch compatible sequences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compatible sequences' },
      { status: 500 }
    )
  }
}