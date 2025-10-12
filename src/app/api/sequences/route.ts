import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'

function isUUID(value: string) {
  // Simple UUID v4 check
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const formatParam = (searchParams.get('format') || '').trim().toUpperCase()
    const controllerParam = (searchParams.get('controller') || '')
      .trim()
      .toLowerCase()

    // Build filters — only pass category if it looks like a UUID (DB ID)
    const filters: any = {}
    if (categoryParam && isUUID(categoryParam)) {
      filters.category = categoryParam
    }

    // Try fetching from DB, fall back to mock if env/config issues
    let sequences: any[] = []
    try {
      sequences = await db.sequences.findMany(filters)
    } catch (dbError) {
      console.warn('Supabase unavailable, serving mock sequences:', dbError)
      sequences = [
        {
          id: '00000000-0000-4000-8000-000000000001',
          title: 'Christmas Wonderland',
          description:
            'A magical Christmas light sequence with twinkling effects and smooth transitions.',
          price: 12.99,
          category: { name: 'Holiday & Seasonal' },
          tags: ['christmas', 'twinkling', 'festive'],
          rating: 4.8,
          rating_count: 128,
          download_count: 1250,
          preview_url: '/images/sequence-preview-default.jpg',
          thumbnail_url: '/images/sequence-preview-default.jpg',
          seller: { username: 'lightmaster', full_name: 'LightMaster Pro' },
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z',
          format: 'MP4',
          frame_rate: 30,
          duration: 180,
          file_size: '200MB',
          controllers: ['Falcon'],
        },
        {
          id: '00000000-0000-4000-8000-000000000002',
          title: 'Halloween Spooktacular',
          description: 'Spooky sequence with eerie fades and strobe bursts.',
          price: 9.99,
          category: { name: 'Holiday & Seasonal' },
          tags: ['halloween', 'strobe', 'spooky'],
          rating: 4.6,
          rating_count: 84,
          download_count: 870,
          preview_url: '/images/sequence-preview-default.jpg',
          thumbnail_url: '/images/sequence-preview-default.jpg',
          seller: { username: 'spookylights', full_name: 'Spooky Lights Co.' },
          created_at: '2024-02-10T00:00:00.000Z',
          updated_at: '2024-02-10T00:00:00.000Z',
          format: 'FSEQ',
          frame_rate: 40,
          duration: 150,
          file_size: '120MB',
          controllers: ['Kulp'],
        },
      ]
    }

    // Apply filtering, sorting and pagination in memory for now
    // TODO: Move sorting to database level for better performance
    let filteredSequences = [...sequences]

    // Format filter
    if (formatParam) {
      filteredSequences = filteredSequences.filter((s: any) => {
        const fmt = (s.format || '').toString().toUpperCase()
        return fmt === formatParam
      })
    }

    // Controller filter (match controllers array or tags/description)
    if (controllerParam) {
      filteredSequences = filteredSequences.filter((s: any) => {
        const controllers = Array.isArray(s.controllers)
          ? s.controllers.map((c: any) => String(c).toLowerCase())
          : []
        const tags = Array.isArray(s.tags)
          ? s.tags.map((t: any) => String(t).toLowerCase())
          : []
        const desc = (s.description || '').toLowerCase()
        return (
          controllers.includes(controllerParam) ||
          tags.includes(controllerParam) ||
          desc.includes(controllerParam)
        )
      })
    }

    const sortedSequences = [...filteredSequences]

    switch (sort) {
      case 'price-low':
        sortedSequences.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        sortedSequences.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'popular':
      case 'downloads':
        sortedSequences.sort(
          (a, b) => (b.download_count || 0) - (a.download_count || 0)
        )
        break
      case 'rating':
        sortedSequences.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'oldest':
        sortedSequences.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        break
      default:
        sortedSequences.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }

    const skip = (page - 1) * limit
    const paginatedSequences = sortedSequences.slice(skip, skip + limit)
    const total = filteredSequences.length

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
      format: sequence.format || null,
      frameRate: sequence.frame_rate || null,
      duration: sequence.duration || null,
      fileSize: sequence.file_size || null,
      seller: {
        username: sequence.seller?.username || 'Unknown',
        displayName:
          sequence.seller?.full_name || sequence.seller?.username || 'Unknown',
      },
      createdAt: sequence.created_at,
      updatedAt: sequence.updated_at,
    }))

    return NextResponse.json({
      sequences: formattedSequences,
      total, // Frontend expects top-level total for pagination
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
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
