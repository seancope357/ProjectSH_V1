'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ArrowRight, TrendingUp, Star } from 'lucide-react'
import { MarketInsights } from '@/lib/market-service'

interface MarketplaceHomeProps {
  initialInsights: MarketInsights
}

export function MarketplaceHome({ initialInsights }: MarketplaceHomeProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const insights = initialInsights
  const loading = false // Data is now passed from server
  const defaultCats = [
    'Holiday & Seasonal',
    'Music Sync',
    'Mega Tree',
    'House Outline',
    'RGB Effects',
    'Props & Elements',
  ]

  // removed useEffect fetch

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/sequences?q=${encodeURIComponent(q)}&sort=newest`)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden bg-white border-b border-gray-200"
        aria-label="Marketplace Hero"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),white)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-blue-600/10 ring-1 ring-blue-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <header className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
              Create show‑stopping <span className="text-blue-600">xLights</span> displays
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Shop high‑quality, ready‑to‑run sequences from verified creators.
              Instant downloads, fair pricing, and commercial‑ready options.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/sequences"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-blue-500/30 shadow-md"
              >
                Browse All Sequences
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/seller/onboarding"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm"
              >
                Sell Your Work
              </Link>
            </div>

            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                aria-label="Search sequences"
                placeholder="Search sequences, tags, effects…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-lg"
              />
            </form>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium text-gray-700">
                  {loading
                    ? 'Loading...'
                    : `${insights?.totalSequences || 0} sequences`}
                </span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div>Verified Creators</div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div>Instant Delivery</div>
            </div>
          </header>
        </div>
      </section>

      {/* Shop by Category (chips) */}
      <section className="py-6" aria-label="Shop by Category">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <Link
              href="/categories"
              className="text-blue-700 hover:underline text-sm"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(loading
              ? defaultCats
              : insights?.topCategories?.map(c => c.name) || defaultCats
            )
              .slice(0, 12)
              .map(name => (
                <Link
                  key={name}
                  href={`/search?category=${encodeURIComponent(name)}&sort=popular`}
                  className="mi-surface rounded-full px-4 py-2 whitespace-nowrap hover:shadow-sm"
                >
                  {name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12" aria-label="Featured Categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Categories
            </h2>
            <Link
              href="/categories"
              className="mi-cta-secondary border px-4 py-2"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : (insights?.topCategories?.length || 0) === 0 ? (
            <div className="text-gray-600">No categories available.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {insights!.topCategories.slice(0, 6).map(cat => (
                <Link
                  key={cat.name}
                  href={`/search?category=${encodeURIComponent(cat.name)}&sort=downloads`}
                  className="mi-card mi-surface p-4 text-center hover:shadow-md"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {cat.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {cat.count} sequences
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Sequences */}
      <section className="py-6" aria-label="Trending Sequences">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Trending Now
            </h2>
            <Link
              href="/sequences"
              className="mi-cta-secondary border px-4 py-2"
            >
              Browse All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mi-card mi-surface h-64" />
              ))}
            </div>
          ) : (insights?.topByDownloads?.length || 0) === 0 ? (
            <div className="text-gray-600">
              No trending sequences available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insights!.topByDownloads.slice(0, 8).map(seq => (
                <Link
                  key={seq.id}
                  href={`/sequence/${seq.id}`}
                  className="mi-card mi-surface overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 bg-gray-200">
                    {seq.previewUrl ? (
                      <Image
                        src={seq.previewUrl}
                        alt={seq.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                        unoptimized={seq.previewUrl.startsWith('data:')}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {seq.title}
                      </h3>
                      <span className="text-blue-700 font-bold">
                        ${seq.price?.toFixed?.(2) || seq.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {seq.rating || 0}
                      </span>
                      <span>{seq.downloads} downloads</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Editors' Picks */}
      <section className="py-6" aria-label="Editors' Picks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Editors' Picks
            </h2>
            <Link
              href="/sequences?sort=rating"
              className="mi-cta-secondary border px-4 py-2"
            >
              Top Rated
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mi-card mi-surface h-64" />
              ))}
            </div>
          ) : (insights?.topByDownloads?.length || 0) === 0 ? (
            <div className="text-gray-600">No picks available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...insights!.topByDownloads]
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 8)
                .map(seq => (
                  <Link
                    key={seq.id}
                    href={`/sequence/${seq.id}`}
                    className="mi-card mi-surface overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-40 bg-gray-200">
                      {seq.previewUrl ? (
                        <Image
                          src={seq.previewUrl}
                          alt={seq.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover"
                          unoptimized={seq.previewUrl.startsWith('data:')}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                          <Search className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {seq.title}
                        </h3>
                        <span className="text-blue-700 font-bold">
                          ${seq.price?.toFixed?.(2) || seq.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {seq.rating || 0}
                        </span>
                        <span>{seq.downloads} downloads</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Seller Acquisition */}
      <section
        className="py-20 relative overflow-hidden bg-gray-900 text-white"
        aria-label="Sell on SequenceHUB"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('/images/sequence-preview-default.jpg')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Turn Your Light Shows Into Income
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Join the fastest-growing marketplace for xLights creators. Earn 85%
            commissions, get paid instantly, and reach thousands of display
            enthusiasts worldwide.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12 text-left max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-lg mb-2">High Commissions</h3>
              <p className="text-blue-100 text-sm">
                Keep 85% of every sale. We handle the hosting, payments, and
                delivery so you can focus on sequencing.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-lg mb-2">Instant Exposure</h3>
              <p className="text-blue-100 text-sm">
                Your sequences are instantly searchable and indexable. Get
                featured in our "Editors' Picks" and newsletters.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-bold text-lg mb-2">Secure & Simple</h3>
              <p className="text-blue-100 text-sm">
                Automated file delivery and secure Stripe payouts. Dashboard analytics
                track your sales in real-time.
              </p>
            </div>
          </div>

          <Link
            href="/seller/onboarding"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-900 transition-all duration-200 bg-white rounded-full hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Start Selling Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-blue-200">
            No listing fees. No monthly costs.
          </p>
        </div>
      </section>

      {/* Licensing & Quality Callout */}
      <section className="py-6" aria-label="Quality and Licensing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mi-card mi-surface p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Curated Quality & Clear Licensing
              </h3>
              <p className="text-gray-600 mt-2">
                Every sequence is reviewed for compatibility and visual quality.
                Learn how licensing works to use music and assets correctly.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/licensing" className="mi-cta bg-blue-600 text-white">
                Licensing Guide
              </Link>
              <Link
                href="/creator"
                className="mi-cta-secondary border px-4 py-2"
              >
                Meet Creators
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
