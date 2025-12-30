import { db } from '@/lib/supabase-db'

export type TrendingSequence = {
  id: string
  title: string
  price: number
  downloads: number
  rating: number
  previewUrl?: string | null
  thumbnailUrl?: string | null
  seller?: { username: string; displayName: string }
}

export type MarketInsights = {
  topByDownloads: TrendingSequence[]
  topByRevenue?: TrendingSequence[]
  topCategories: { name: string; count: number }[]
  hotTags?: { name: string; count: number }[]
  totalSequences: number
  generatedAt?: string
}

export async function getMarketInsights(): Promise<MarketInsights> {
  try {
    // Fetch sequences using relationship-free query to avoid FK dependency
    const sequences: any[] = await db.sequences.findManySimple({})

    // Load categories for id->name mapping (graceful if table missing)
    const categoryMap = new Map<string, string>()
    try {
      const categories = await db.categories.findMany()
      categories.forEach((c: any) => {
        if (c?.id) categoryMap.set(String(c.id), c.name || 'Uncategorized')
      })
    } catch {
      // If categories table/relationship is unavailable, fall back to 'Uncategorized'
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

      const categoryId = s?.category_id ? String(s.category_id) : ''
      const categoryName =
        (categoryId && categoryMap.get(categoryId)) || 'Uncategorized'
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
          username: 'Unknown',
          displayName: 'Unknown',
        },
        createdAt: s.created_at,
      }
    })

    // Top sequences by downloads
    const topByDownloads = [...enriched]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10)

    // Top sequences by revenue
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

    return {
      topByDownloads,
      topByRevenue,
      topCategories,
      hotTags,
      totalSequences: sequences.length,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to compute market insights:', error)
    return {
      topByDownloads: [],
      topCategories: [],
      totalSequences: 0,
    }
  }
}
