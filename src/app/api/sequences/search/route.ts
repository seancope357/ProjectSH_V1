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

    // Return mock data for now while database connection is being fixed
    const mockSequences = [
      {
        id: '1',
        title: 'Sample LED Sequence',
        description: 'A beautiful LED light sequence for your project',
        price: 9.99,
        category: 'Entertainment',
        tags: ['led', 'lights', 'animation'],
        rating: 4.5,
        downloads: 150,
        createdAt: new Date().toISOString(),
        previewUrl: '/images/sequence-preview-default.jpg',
        seller: {
          name: 'Demo Seller',
        },
        reviewCount: 12,
      },
      {
        id: '2',
        title: 'Holiday Light Show',
        description: 'Perfect for holiday decorations and celebrations',
        price: 14.99,
        category: 'Holiday',
        tags: ['holiday', 'christmas', 'celebration'],
        rating: 4.8,
        downloads: 89,
        createdAt: new Date().toISOString(),
        previewUrl: '/images/sequence-preview-default.jpg',
        seller: {
          name: 'Holiday Lights Pro',
        },
        reviewCount: 8,
      },
    ]

    // Filter by query if provided
    let filteredSequences = mockSequences
    if (query) {
      filteredSequences = mockSequences.filter(seq => 
        seq.title.toLowerCase().includes(query.toLowerCase()) ||
        seq.description.toLowerCase().includes(query.toLowerCase()) ||
        seq.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }

    // Filter by category if provided
    if (category) {
      filteredSequences = filteredSequences.filter(seq => seq.category === category)
    }

    // Sort sequences
    switch (sort) {
      case 'price-low':
        filteredSequences.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filteredSequences.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filteredSequences.sort((a, b) => b.rating - a.rating)
        break
      case 'downloads':
        filteredSequences.sort((a, b) => b.downloads - a.downloads)
        break
      default:
        filteredSequences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    // Paginate
    const startIndex = (page - 1) * limit
    const paginatedSequences = filteredSequences.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      sequences: paginatedSequences,
      total: filteredSequences.length,
      page,
      totalPages: Math.ceil(filteredSequences.length / limit),
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search sequences' },
      { status: 500 }
    )
  }
}