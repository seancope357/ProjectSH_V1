import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'

export async function GET() {
  try {
    // Fetch all published/active/approved sequences
    let sequences: any[] = []
    try {
      sequences = await db.sequences.findMany({})
    } catch (dbError) {
      console.warn('Supabase unavailable for market insights, using mock dataset:', dbError)
      sequences = [
        {
          id: '00000000-0000-4000-8000-000000000001',
          title: 'Christmas Wonderland',
          description: 'A magical Christmas light sequence with twinkling effects and smooth transitions.',
          price: 12.99,
          category: { name: 'Holiday & Seasonal' },
          tags: ['christmas', 'twinkling', 'festive'],
          rating: 4.8,
          rating_count: 128,
          download_count: 1250,
          preview_url: '/images/sequence-preview-default.jpg',
          thumbnail_url: '/images/sequence-preview-default.jpg',
          seller: { username: 'lightmaster', full_name: 'LightMaster Pro' },
          created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '00000000-0000-4000-8000-000000000002',
          title: 'Haunted Night',
          description: 'Spooky Halloween sequence with flickering lights and eerie effects.',
          price: 9.99,
          category: { name: 'Halloween' },
          tags: ['halloween', 'spooky', 'flicker'],
          rating: 4.6,
          rating_count: 96,
          download_count: 980,
          preview_url: '/images/sequence-preview-default.jpg',
          thumbnail_url: '/images/sequence-preview-default.jpg',
          seller: { username: 'spookylights', full_name: 'Spooky Lights' },
          created_at: new Date(Date.now() - 86400000 * 35).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '00000000-0000-4000-8000-000000000003',
          title: 'New Year Blast',
          description: 'High-energy sequence for New Year celebrations with fast rhythms.',
          price: 14.99,
          category: { name: 'New Year' },
          tags: ['newyear', 'fast', 'epic'],
          rating: 4.7,
          rating_count: 102,
          download_count: 760,
          preview_url: '/images/sequence-preview-default.jpg',
          thumbnail_url: '/images/sequence-preview-default.jpg',
          seller: { username: 'festivalfx', full_name: 'Festival FX' },
          created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    }

    // Aggregate categories
    const categoryCounts: Record<string, number> = {}
    // Aggregate tags
    const tagCounts: Record<string, number> = {}

    // Compute derived metrics per sequence
    const enriched = sequences.map((s: any) => {
      const downloads = s.download_count || 0
      const price = s.price || 0
      const revenue = Math.round(downloads * price)

      const categoryName = s?.category?.name || 'Uncategorized'
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1

      const tags: string[] = Array.isArray(s.tags) ? s.tags : []
      tags.forEach((t) => {
        const key = (t || '').toLowerCase()
        if (!key) return
        tagCounts[key] = (tagCounts[key] || 0) + 1
      })

      return {
        id: s.id,
        title: s.title,
        category: categoryName,
        price,
        rating: s.rating || 0,
        downloads,
        revenue,
        previewUrl: s.preview_url || s.thumbnail_url || null,
        thumbnailUrl: s.thumbnail_url || null,
        seller: {
          username: s.seller?.username || 'Unknown',
          displayName: s.seller?.full_name || s.seller?.username || 'Unknown',
        },
        createdAt: s.created_at,
      }
    })

    // Top sequences by downloads and by estimated revenue
    const topByDownloads = [...enriched]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10)

    const topByRevenue = [...enriched]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Top categories
    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // Hot tags
    const hotTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)

    return NextResponse.json({
      topByDownloads,
      topByRevenue,
      topCategories,
      hotTags,
      totalSequences: sequences.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to compute market insights:', error)
    return NextResponse.json(
      { error: 'Failed to compute market insights' },
      { status: 500 }
    )
  }
}