import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase-db'

export async function GET() {
  try {
    // Fetch all published/active/approved sequences (no mock fallback)
    const sequences: any[] = await db.sequences.findMany({})

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
      tags.forEach(t => {
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
