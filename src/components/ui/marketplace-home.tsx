'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ArrowRight, TrendingUp, Star } from 'lucide-react'
import { HeroAnimation } from './hero-animation'
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
    router.push(`/search?q=${encodeURIComponent(q)}&sort=newest`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden"
        aria-label="Marketplace Hero"
      >
        {/* Animated xLights-style preview */}
        <HeroAnimation className="absolute inset-0 -z-10 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/70 via-purple-700/60 to-indigo-900/70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <header className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs mb-4">
              <span className="font-semibold">SequenceHUB</span>
              <span>Curated by top creators</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Create show‑stopping xLights displays
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Shop high‑quality, ready‑to‑run sequences from verified creators.
              Instant downloads, fair pricing, and commercial‑ready options.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                href="/sequences?sort=popular"
                className="mi-cta bg-white text-blue-700 px-6 py-3"
              >
                Shop sequences
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/seller/onboarding"
                className="mi-cta-secondary border border-white/30 text-white px-6 py-3"
              >
                Become a seller
              </Link>
            </div>

            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto flex gap-3"
            >
              <input
                aria-label="Search sequences"
                placeholder="Search sequences, tags, effects…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="mi-input flex-1 bg-white/95"
              />
              <button type="submit" className="mi-cta bg-white text-blue-700">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>

            <div className="mt-6 text-blue-100 text-sm">
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {loading
                  ? 'Loading insights…'
                  : `${insights?.totalSequences || 0} sequences indexed`}
              </span>
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
