import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const sort = searchParams.get('sort') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    if (!query.trim()) {
      return NextResponse.json({
        sequences: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      })
    }

    // Get all sequences and filter in memory for now
    // TODO: Implement full-text search in Supabase
    const allSequences = await db.sequences.findMany({})
    
    // Filter sequences based on search criteria
    const filteredSequences = allSequences.filter((sequence: any) => {
      const matchesQuery = 
        sequence.title?.toLowerCase().includes(query.toLowerCase()) ||
        sequence.description?.toLowerCase().includes(query.toLowerCase()) ||
        sequence.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      
      const matchesCategory = !category || sequence.category?.name === category
      const matchesPrice = sequence.price >= minPrice && sequence.price <= maxPrice
      
      return matchesQuery && matchesCategory && matchesPrice
    })

    // Apply sorting
    let sortedSequences = [...filteredSequences]
    
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
      case 'newest':
        sortedSequences.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default: // relevance
        // For now, just sort by newest as a fallback
        sortedSequences.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    // Apply pagination
    const skip = (page - 1) * limit
    const paginatedSequences = sortedSequences.slice(skip, skip + limit)
    const total = sortedSequences.length

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
      },
      searchQuery: query
    })
  } catch (error) {
    console.error('Error searching sequences:', error)
    return NextResponse.json(
      { error: 'Failed to search sequences' },
      { status: 500 }
    )
  }
}