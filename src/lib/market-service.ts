import { db, supabaseAdmin } from '@/lib/supabase-db'

export type TrendingSequence = {
  id: string
  title: string
  price: number
  downloads: number
  rating: number
  previewUrl?: string | null
  thumbnailUrl?: string | null
  category?: string
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

export type SearchParams = {
  q?: string
  category?: string
  sort?: string
  page?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
}

export type SearchResult = {
  sequences: TrendingSequence[]
  total: number
  page: number
  totalPages: number
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

export async function searchSequences(params: SearchParams): Promise<SearchResult> {
  const page = params.page || 1
  const limit = params.limit || 12
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    let query = supabaseAdmin
      .from('sequences')
      .select(
        `
        *,
        category:categories(name),
        seller:profiles!seller_id(username, full_name)
      `,
        { count: 'exact' }
      )
      .eq('status', 'published') // Only show published sequences

    // Search
    if (params.q) {
      query = query.ilike('title', `%${params.q}%`)
    }

    // Category
    if (params.category && params.category !== 'all') {
      // If category is a name, we might need to join, but usually filters use ID or Name
      // Assuming params.category is the name for now as per previous code, 
      // but simpler to filter by ID if possible. 
      // If we only have name, we need to filter on the joined table which PostgREST supports via !inner
      // query = query.eq('categories.name', params.category) 
      // But simpler: let's assume the frontend passes the category name string matching our simple map
      // or we accept we might need to look up ID first.
      // For robustness with current "mock" style data, let's fetch all and filter in memory if needed,
      // but that's bad for perf.
      // Let's try to find the category ID if it's a string name
      
      // OPTION: Client passes ID. But URLs like /sequences?category=Christmas are nicer.
      // Let's rely on text search on the category name if possible, or fetch category ID first.
      
      // Quick lookup for category ID
      const { data: catData } = await supabaseAdmin
        .from('categories')
        .select('id')
        .ilike('name', params.category)
        .single()
        
      if (catData) {
        query = query.eq('category_id', catData.id)
      }
    }

    // Price
    if (params.minPrice !== undefined) {
      query = query.gte('price', params.minPrice)
    }
    if (params.maxPrice !== undefined) {
      query = query.lte('price', params.maxPrice)
    }

    // Sort
    switch (params.sort) {
      case 'price-low':
        query = query.order('price', { ascending: true })
        break
      case 'price-high':
        query = query.order('price', { ascending: false })
        break
      case 'downloads': // popular
        query = query.order('download_count', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Pagination
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.warn('Search query failed, falling back to simple search:', error)
      // Fallback to simple query without relations if relations fail
      // This is a safety net for the "mock" environment
      return await fallbackSearch(params)
    }

    const sequences = (data || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      price: s.price || 0,
      downloads: s.download_count || 0,
      rating: s.rating || 0,
      previewUrl: s.preview_url,
      thumbnailUrl: s.thumbnail_url,
      category: s.category?.name || 'Uncategorized',
      seller: {
        username: s.seller?.username || 'Unknown',
        displayName: s.seller?.full_name || s.seller?.username || 'Unknown',
      },
    }))

    return {
      sequences,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error) {
    console.error('Search sequences error:', error)
    return { sequences: [], total: 0, page: 1, totalPages: 0 }
  }
}

// Fallback for when relations don't exist
async function fallbackSearch(params: SearchParams): Promise<SearchResult> {
  const page = params.page || 1
  const limit = params.limit || 12
  
  let allSequences = await db.sequences.findManySimple({})
  
  // Filter
  if (params.q) {
    const q = params.q.toLowerCase()
    allSequences = allSequences.filter((s: any) => s.title?.toLowerCase().includes(q))
  }
  
  // Sort
  if (params.sort === 'price-low') {
    allSequences.sort((a: any, b: any) => (a.price || 0) - (b.price || 0))
  } else if (params.sort === 'price-high') {
    allSequences.sort((a: any, b: any) => (b.price || 0) - (a.price || 0))
  } else {
    // Default newest
    allSequences.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  
  const total = allSequences.length
  const start = (page - 1) * limit
  const paginated = allSequences.slice(start, start + limit)
  
  const sequences = paginated.map((s: any) => ({
      id: s.id,
      title: s.title,
      price: s.price || 0,
      downloads: s.download_count || 0,
      rating: s.rating || 0,
      previewUrl: s.preview_url,
      thumbnailUrl: s.thumbnail_url,
      category: 'Uncategorized', // Cannot resolve without relation in fallback
      seller: { username: 'Unknown', displayName: 'Unknown' },
  }))
  
  return {
    sequences,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}
