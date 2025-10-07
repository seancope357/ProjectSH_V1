'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/session-provider'
import { Navigation } from '@/components/ui/navigation'
import { Zap, TrendingUp, Info, Lightbulb, Music, ShieldCheck } from 'lucide-react'
import RevenueChart from '@/components/ui/revenue-chart'

type MarketInsights = {
  topByDownloads: Array<{
    id: string
    title: string
    downloads: number
    revenue: number
    category: string
    previewUrl: string | null
    thumbnailUrl: string | null
  }>
  topByRevenue: Array<{
    id: string
    title: string
    downloads: number
    revenue: number
    category: string
    previewUrl: string | null
    thumbnailUrl: string | null
  }>
  topCategories: Array<{ name: string; count: number }>
  hotTags: Array<{ name: string; count: number }>
  totalSequences: number
  generatedAt: string
}

type CreatorInsights = {
  range: string
  period: { start: string; end: string }
  totals: { sequences: number; revenue: number; sales: number; estimated: boolean }
  recent: { revenue: number; sales: number; estimated: boolean }
  topSequences: Array<{ id: string; title: string; revenue: number; downloads: number; price: number; category: string; tags: string[] }>
  breakdown: { categories: Array<{ name: string; count: number }>; tags: Array<{ name: string; count: number }> }
  timeseries?: { granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly'; points: Array<{ date: string; revenue: number; sales: number }> }
}

export default function CreatorHubPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<MarketInsights | null>(null)
  const [creator, setCreator] = useState<CreatorInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('weekly')

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [marketRes, creatorRes] = await Promise.all([
          fetch('/api/market/trending'),
          fetch(`/api/creator/insights?range=30d&granularity=${granularity}`),
        ])
        const [marketData, creatorData] = await Promise.all([
          marketRes.json(),
          creatorRes.json(),
        ])
        setInsights(marketData)
        if (!('error' in creatorData)) setCreator(creatorData)
      } catch (e) {
        console.error('Failed to load market insights', e)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [granularity])

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    (user?.email ? user.email.split('@')[0] : 'Creator')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creator Hub</h1>
            <p className="mt-2 text-gray-600">Personalized tips, trends, and tools for Xlights creators</p>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="font-medium">Welcome, {displayName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Your Performance */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Performance (30 days)</h2>
          </div>
          {/* Granularity switch */}
          <div className="mb-3">
            <div className="inline-flex rounded border overflow-hidden">
              {(['daily','weekly','monthly','quarterly'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-1 text-sm ${granularity === g ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r last:border-r-0`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading your metrics…</div>
          ) : creator ? (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <div className="text-sm text-gray-600">Revenue</div>
                  <div className="text-2xl font-semibold text-gray-900">${creator.totals.revenue.toFixed(2)}</div>
                  {creator.totals.estimated && (
                    <div className="text-xs text-gray-500">Estimated based on downloads</div>
                  )}
                </div>
                <div className="p-4 border rounded">
                  <div className="text-sm text-gray-600">Sales</div>
                  <div className="text-2xl font-semibold text-gray-900">{creator.totals.sales}</div>
                  {creator.totals.estimated && (
                    <div className="text-xs text-gray-500">Estimated based on downloads</div>
                  )}
                </div>
                <div className="p-4 border rounded">
                  <div className="text-sm text-gray-600">Active Sequences</div>
                  <div className="text-2xl font-semibold text-gray-900">{creator.totals.sequences}</div>
                </div>
              </div>

              {/* Revenue Trend Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Trend</h3>
                <RevenueChart
                  primary={{
                    label: 'Revenue',
                    points: (creator.timeseries?.points || []).map(p => ({ date: p.date, value: p.revenue })),
                    color: '#2563EB',
                  }}
                  granularity={creator.timeseries?.granularity || granularity}
                  currency="USD"
                  height={140}
                  xLabel="Date"
                  yLabel="Revenue"
                />
              </div>

              {/* Top performing sequences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Sequences</h3>
                {creator.topSequences.length === 0 ? (
                  <div className="text-gray-600">No sales data yet.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {creator.topSequences.map((s) => (
                      <Link key={s.id} href={`/sequence/${s.id}`} className="block">
                        <div className="p-4 border rounded hover:border-blue-400 transition">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{s.title}</div>
                              <div className="text-sm text-gray-600">{s.category}</div>
                              {s.tags && s.tags.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500">#{s.tags.slice(0, 3).join(' #')}</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-700 text-right">
                              <div>
                                <span className="font-semibold">${s.revenue.toFixed(2)}</span> revenue
                              </div>
                              <div>
                                <span className="font-semibold">{s.downloads}</span> downloads
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No metrics available.</div>
          )}
        </section>

        {/* Tips & Guidance */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Tips</h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
            <li className="p-4 bg-amber-50 rounded">
              <span className="font-medium">Lean into seasonal demand:</span> Christmas, Halloween, and New Year themes dominate downloads.
            </li>
            <li className="p-4 bg-amber-50 rounded">
              <span className="font-medium">Optimize previews:</span> High-quality audio/visual previews significantly boost conversion.
            </li>
            <li className="p-4 bg-amber-50 rounded">
              <span className="font-medium">Tag smartly:</span> Use descriptive tags like "fast", "epic", "synth", "chorus" to improve discovery.
            </li>
            <li className="p-4 bg-amber-50 rounded">
              <span className="font-medium">Price with intent:</span> Balance price vs. downloads; consider $9.99–$14.99 for mainstream tracks.
            </li>
          </ul>
        </section>

        {/* Market Insights */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">What’s Hot</h2>
          </div>

          {loading ? (
            <div className="text-gray-500">Loading market insights…</div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Top Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Categories</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {insights.topCategories.map((c) => (
                    <div key={c.name} className="p-4 border rounded">
                      <div className="text-gray-900 font-medium">{c.name}</div>
                      <div className="text-gray-600 text-sm">{c.count} sequences</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Sequences by Downloads */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bestsellers</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {insights.topByDownloads.slice(0, 6).map((s) => (
                    <Link key={s.id} href={`/sequence/${s.id}`} className="block">
                      <div className="p-4 border rounded hover:border-blue-400 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{s.title}</div>
                            <div className="text-sm text-gray-600">{s.category}</div>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">{s.downloads}</span> downloads
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Hot Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hot Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.hotTags.map((t) => (
                    <span key={t.name} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-800">
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No insights available.</div>
          )}
        </section>

        {/* Licensing CTA */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Song Licensing</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Want to use commercial tracks in your Xlights sequences? Ensure you have proper rights.
            Explore licensing partners and pick a plan that fits your use.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/licensing" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Explore Licensing Options</Link>
            <div className="flex items-center text-gray-600 text-sm gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Stay compliant with usage rights</span>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              Insights are based on marketplace activity and may update periodically.
              For more detailed analytics, use the Seller Dashboard.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}