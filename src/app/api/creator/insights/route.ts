import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-db'
import { createClient } from '@/lib/supabase-server'

type RangeKey = '7d' | '30d' | '90d' | 'all'
type Granularity = 'daily' | 'weekly' | 'monthly' | 'quarterly'

function getRangeDates(range: RangeKey) {
  const end = new Date()
  let start = new Date(0)
  switch (range) {
    case '7d':
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'all':
    default:
      start = new Date(0)
  }
  return { start, end }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rangeParam = (searchParams.get('range') as RangeKey) || '30d'
    const granularity: Granularity = (searchParams.get('granularity') as Granularity) || 'daily'
    const { start, end } = getRangeDates(rangeParam)

    // Fetch seller's sequences
    let sequences: any[] = []
    try {
      const { data: seqData, error: seqError } = await supabaseAdmin
        .from('sequences')
        .select(`
          id,
          title,
          price,
          download_count,
          tags,
          category:categories(name)
        `)
        .eq('seller_id', user.id)

      if (seqError) throw seqError
      sequences = seqData || []
    } catch (e) {
      sequences = []
    }

    // Fetch seller's order items joined with orders (completed only)
    let orderItems: any[] = []
    try {
      let query = supabaseAdmin
        .from('order_items')
        .select(`
          order_id,
          sequence_id,
          price,
          seller_payout,
          created_at,
          orders!inner(status, created_at)
        `)
        .eq('seller_id', user.id)
        .eq('orders.status', 'completed')

      // Apply date range filter on order_items.created_at
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())

      const { data: oiData, error: oiError } = await query
      if (oiError) throw oiError
      orderItems = oiData || []
    } catch (e) {
      orderItems = []
    }

    // Aggregate metrics
    const totalSequences = sequences.length

    // Revenue and sales from orders (authoritative if available)
    const revenueFromOrders = orderItems.reduce((sum, i) => sum + Number(i.seller_payout || 0), 0)
    const salesFromOrders = orderItems.length

    // Fallback estimates from sequence downloads if orders are empty
    const estimatedRevenueFromDownloads = sequences.reduce((sum, s) => sum + Number((s.price || 0) * (s.download_count || 0) * 0.85), 0)
    const estimatedSalesFromDownloads = sequences.reduce((sum, s) => sum + Number(s.download_count || 0), 0)

    const useEstimates = revenueFromOrders === 0 && salesFromOrders === 0
    const totalRevenue = useEstimates ? estimatedRevenueFromDownloads : revenueFromOrders
    const totalSales = useEstimates ? estimatedSalesFromDownloads : salesFromOrders

    // Top sequences by revenue or downloads
    const revenueBySequence: Record<string, number> = {}
    if (!useEstimates) {
      for (const item of orderItems) {
        const key = item.sequence_id
        revenueBySequence[key] = (revenueBySequence[key] || 0) + Number(item.seller_payout || 0)
      }
    } else {
      for (const s of sequences) {
        revenueBySequence[s.id] = Number((s.price || 0) * (s.download_count || 0) * 0.85)
      }
    }

    const sequencesById: Record<string, any> = {}
    for (const s of sequences) sequencesById[s.id] = s

    const topSequences = Object.entries(revenueBySequence)
      .map(([sequenceId, revenue]) => {
        const s = sequencesById[sequenceId] || { id: sequenceId, title: 'Unknown', price: 0, download_count: 0 }
        return {
          id: sequenceId,
          title: s.title,
          revenue: Number(revenue.toFixed(2)),
          downloads: s.download_count || 0,
          price: s.price || 0,
          category: s.category?.name || 'Uncategorized',
          tags: s.tags || [],
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Breakdown: categories and tags from sequences
    const categoryCounts: Record<string, number> = {}
    const tagCounts: Record<string, number> = {}
    for (const s of sequences) {
      const cat = s.category?.name || 'Uncategorized'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      const tags: string[] = Array.isArray(s.tags) ? s.tags : []
      for (const t of tags) tagCounts[t] = (tagCounts[t] || 0) + 1
    }

    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent performance (range)
    const recentRevenue = revenueFromOrders
    const recentSales = salesFromOrders

    // Build revenue timeseries buckets
    function bucketStart(date: Date, g: Granularity): Date {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      if (g === 'daily') return d
      if (g === 'weekly') {
        const day = d.getDay() // 0 Sun
        const diff = (day + 6) % 7 // make Monday start
        d.setDate(d.getDate() - diff)
        return d
      }
      if (g === 'monthly') {
        d.setDate(1)
        return d
      }
      // quarterly
      const month = d.getMonth() // 0-11
      const qStartMonth = Math.floor(month / 3) * 3
      d.setMonth(qStartMonth, 1)
      return d
    }

    const timeseriesBuckets: Record<string, { revenue: number; sales: number }> = {}
    if (!useEstimates) {
      for (const item of orderItems) {
        const dt = new Date(item.created_at || item.orders?.created_at || Date.now())
        const b = bucketStart(dt, granularity).toISOString()
        const entry = timeseriesBuckets[b] || { revenue: 0, sales: 0 }
        entry.revenue += Number(item.seller_payout || 0)
        entry.sales += 1
        timeseriesBuckets[b] = entry
      }
    }

    const timeseriesPoints = Object.keys(timeseriesBuckets)
      .sort()
      .map((iso) => ({ date: iso, revenue: Number(timeseriesBuckets[iso].revenue.toFixed(2)), sales: timeseriesBuckets[iso].sales }))

    return NextResponse.json({
      range: rangeParam,
      period: { start: start.toISOString(), end: end.toISOString() },
      totals: {
        sequences: totalSequences,
        revenue: Number(totalRevenue.toFixed(2)),
        sales: totalSales,
        estimated: useEstimates,
      },
      recent: {
        revenue: Number(recentRevenue.toFixed(2)),
        sales: recentSales,
        estimated: useEstimates,
      },
      topSequences,
      breakdown: {
        categories,
        tags,
      },
      timeseries: {
        granularity,
        points: timeseriesPoints,
      },
    })
  } catch (error) {
    console.error('Creator insights error:', error)
    return NextResponse.json(
      { error: 'Failed to compute creator insights' },
      { status: 500 }
    )
  }
}