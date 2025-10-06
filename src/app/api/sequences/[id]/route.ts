import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Try real DB first
    try {
      const sequence = await db.sequences.findById(id)
      if (!sequence) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      const formatted = {
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        instructions: sequence.instructions || '',
        price: sequence.price || 0,
        previewUrl: sequence.preview_url || sequence.thumbnail_url || null,
        category: sequence.category?.name || 'Uncategorized',
        tags: sequence.tags || [],
        rating: sequence.rating || 0,
        downloadCount: sequence.download_count || 0,
        seller: {
          id: sequence.seller_id,
          username: sequence.seller?.username || 'Unknown',
          isVerified: true,
          totalSales: sequence.download_count || 0,
          memberSince: sequence.created_at,
        },
        createdAt: sequence.created_at,
        updatedAt: sequence.updated_at,
        specifications: {
          duration: sequence.duration || 120,
          frameRate: sequence.frame_rate || 30,
          resolution: sequence.resolution || '1920x1080',
          fileSize: sequence.file_size || '120MB',
          format: sequence.format || 'MP4',
        },
      }

      return NextResponse.json(formatted)
    } catch (dbError) {
      console.warn('Supabase sequence unavailable, serving mock sequence:', dbError)
      // Mock sequence fallback to keep UI functional
      const mock = {
        id: '00000000-0000-4000-8000-000000000001',
        title: 'Christmas Wonderland',
        description:
          'A magical Christmas light sequence with twinkling effects and smooth transitions.',
        instructions:
          'Import into xLights, map models appropriately, then render and save.',
        price: 12.99,
        previewUrl: '/images/sequence-preview-default.jpg',
        category: 'Holiday & Seasonal',
        tags: ['christmas', 'twinkling', 'festive'],
        rating: 4.8,
        downloadCount: 1250,
        seller: {
          id: 'seller-001',
          username: 'lightmaster',
          isVerified: true,
          totalSales: 2500,
          memberSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 3).toISOString(),
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
        updatedAt: new Date().toISOString(),
        specifications: {
          duration: 180,
          frameRate: 30,
          resolution: '1920x1080',
          fileSize: '200MB',
          format: 'MP4',
        },
      }

      return NextResponse.json(mock)
    }
  } catch (error) {
    console.error('Sequence retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sequence' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement sequence deletion with Supabase
    return NextResponse.json(
      { error: 'Sequence deletion functionality temporarily unavailable' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Sequence deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    )
  }
}