'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
// Removed page-level Navigation; global header renders in layout
import { Search, Grid, List, Star, Download, Eye, Zap } from 'lucide-react'

interface Sequence {
  id: string
  title: string
  description: string
  price: number
  previewUrl?: string
  category: string
  tags: string[]
  rating: number
  downloads: number
  createdAt: string
  seller: {
    name: string
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = [
    'all',
    'christmas',
    'halloween',
    'music',
    'effects',
    'patterns',
  ]
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' },
  ]

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      setLoading(true)

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          category: category !== 'all' ? category : '',
          sort: sortBy,
          page: currentPage.toString(),
        })

        const response = await fetch(`/api/sequences/search?${params}`)
        const data = await response.json()

        setSequences(data.sequences || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    },
    [searchQuery, category, sortBy, currentPage]
  )

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Sequences
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Find the perfect light sequence for your display
          </p>
          {searchQuery && (
            <p className="text-lg text-gray-700">
              Showing results for "{searchQuery}"
            </p>
          )}
        </header>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search sequences..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all'
                    ? 'All Categories'
                    : cat.charAt(0).toUpperCase() +
                      cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Found {sequences.length} sequences
              </p>
            </div>

            {/* Sequences Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {sequences.map(sequence => (
                  <div
                    key={sequence.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {sequence.previewUrl ? (
                        <Image
                          src={sequence.previewUrl}
                          alt={sequence.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Zap className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 truncate">
                        {sequence.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {sequence.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-blue-600">
                          ${sequence.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {sequence.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {sequence.downloads}
                        </span>
                        <span>by {sequence.seller.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                          View Details
                        </button>
                        <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {sequences.map(sequence => (
                  <div
                    key={sequence.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                        {sequence.previewUrl ? (
                          <Image
                            src={sequence.previewUrl}
                            alt={sequence.title}
                            width={96}
                            height={96}
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Zap className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-xl">
                            {sequence.title}
                          </h3>
                          <span className="text-2xl font-bold text-blue-600">
                            ${sequence.price}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {sequence.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              {sequence.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {sequence.downloads}
                            </span>
                            <span>by {sequence.seller.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                              View Details
                            </button>
                            <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
