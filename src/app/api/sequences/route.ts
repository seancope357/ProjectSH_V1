import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build filters
    const filters: any = {}
    
    if (category) {
      filters.category = category
    }
    
    // Get sequences using Supabase
    const sequences = await db.sequences.findMany(filters)

    // Apply sorting and pagination in memory for now
    // TODO: Move sorting to database level for better performance
    let sortedSequences = [...sequences]
    
    switch (sort) {
      case 'price-low':
        sortedSequences.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sortedSequences.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        sortedSequences.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
        break
      case 'rating':
        sortedSequences.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        sortedSequences.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    const skip = (page - 1) * limit
    const paginatedSequences = sortedSequences.slice(skip, skip + limit)
    const total = sequences.length

    // Format sequences for response
    const formattedSequences = paginatedSequences.map((sequence: any) => ({
      id: sequence.id,
      title: sequence.title,
      description: sequence.description,
      price: sequence.price,
      category: sequence.category?.name || 'Uncategorized',
      tags: sequence.tags || [],
      rating: sequence.rating || 0,
      downloads: sequence.download_count || 0,
      reviewCount: sequence.rating_count || 0,
      previewUrl: sequence.preview_url,
      thumbnailUrl: sequence.thumbnail_url,
      seller: {
        username: sequence.seller?.username || 'Unknown',
        displayName: sequence.seller?.full_name || sequence.seller?.username || 'Unknown'
      },
      createdAt: sequence.created_at,
      updatedAt: sequence.updated_at
    }))

    return NextResponse.json({
      sequences: formattedSequences,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching sequences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement sequence creation with Supabase
    // This will handle file upload, metadata storage, and seller verification
    
    const body = await request.json()
    
    // For now, return a placeholder response
    return NextResponse.json(
      { error: 'Sequence creation not yet implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error creating sequence:', error)
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    )
  }
}