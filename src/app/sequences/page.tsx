'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
// Removed page-level Navigation; global header renders in layout
import {
  Grid,
  List,
  Eye,
  Heart,
  Star,
  Download,
  Filter,
  Cpu,
  Gauge,
  Clock,
} from 'lucide-react'
import { SequenceCardSkeleton, ListRowSkeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/providers/session-provider'

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
    name?: string
    displayName?: string
    username?: string
  }
  // Tech attributes for badges (optional)
  format?: string | null
  frameRate?: number | null
  duration?: number | null
  fileSize?: string | number | null
}

function SequencesContent() {
  const router = useRouter()
  const { user } = useAuth()

  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [controllerFilter, setControllerFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('newest')

  // Helper functions for localStorage
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error)
        return null
      }
    }
    return null
  }

  const saveToLocalStorage = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
      }
    }
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'christmas', label: 'Christmas' },
    { value: 'halloween', label: 'Halloween' },
    { value: 'music', label: 'Music Sync' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'nature', label: 'Nature' },
    { value: 'geometric', label: 'Geometric' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' },
  ]

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = getFromLocalStorage('favorites')
    if (savedFavorites && Array.isArray(savedFavorites)) {
      setFavorites(new Set(savedFavorites))
    }
  }, [])

  const fetchSequences = useCallback(async () => {
    setLoading(true)
    try {
      // Regular API call
      const params = new URLSearchParams({
        category: selectedCategory === 'all' ? '' : selectedCategory,
        sort: sortBy,
        page: currentPage.toString(),
        limit: '12',
      })
      if (formatFilter !== 'all') params.set('format', formatFilter)
      if (controllerFilter !== 'all') params.set('controller', controllerFilter)

      const response = await fetch(`/api/sequences?${params}`)

      if (response.ok) {
        const data = await response.json()
        setSequences(data.sequences || [])
        setTotalPages(Math.ceil((data.total || 0) / 12))
      } else {
        throw new Error('Failed to fetch sequences')
      }
    } catch (error) {
      console.error('Error fetching sequences:', error)
      // Fallback to mock data
      const mockSequences: Sequence[] = [
        {
          id: '1',
          title: 'Christmas Wonderland',
          description:
            'A magical Christmas light sequence with twinkling effects and smooth transitions.',
          price: 12.99,
          previewUrl: '/images/sequence-preview-default.jpg',
          category: 'christmas',
          tags: ['christmas', 'twinkling', 'festive'],
          rating: 4.8,
          downloads: 1250,
          createdAt: '2024-01-15',
          seller: { name: 'LightMaster Pro' },
        },
      ]
      setSequences(mockSequences)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, sortBy, currentPage, formatFilter, controllerFilter])

  useEffect(() => {
    fetchSequences()
  }, [fetchSequences])

  // Toggle favorite function
  const toggleFavorite = async (sequenceId: string) => {
    const newFavorites = new Set(favorites)

    if (favorites.has(sequenceId)) {
      newFavorites.delete(sequenceId)
    } else {
      newFavorites.add(sequenceId)
    }

    setFavorites(newFavorites)

    // Save to localStorage for non-authenticated users or as backup
    saveToLocalStorage('favorites', Array.from(newFavorites))

    // If user is authenticated, also sync with server
    if (user) {
      try {
        const method = favorites.has(sequenceId) ? 'DELETE' : 'POST'
        await fetch(`/api/user/favorites/${sequenceId}`, { method })
      } catch (error) {
        console.error('Failed to sync favorite with server:', error)
      }
    }
  }

  const handleSequenceClick = (sequenceId: string) => {
    router.push(`/sequence/${sequenceId}`)
  }

  return (
    <div className="min-h-screen">
      {/* Global header handled by RootLayout */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse LED Sequences
          </h1>
          <p className="text-gray-600">
            Discover thousands of high-quality LED sequences from talented
            creators
          </p>
        </header>

        {/* Filters and Controls */}
        <section
          aria-label="Search Filters and Controls"
          className="mi-surface mi-card p-6 mb-8 mi-fade-in"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left side filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="mi-input"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={formatFilter}
                  onChange={e => setFormatFilter(e.target.value)}
                  className="mi-input"
                >
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'FSEQ', label: 'FSEQ' },
                    { value: 'MP4', label: 'MP4' },
                    { value: 'ZIP', label: 'ZIP' },
                  ].map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Controller Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Controller
                </label>
                <select
                  value={controllerFilter}
                  onChange={e => setControllerFilter(e.target.value)}
                  className="mi-input"
                >
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'falcon', label: 'Falcon' },
                    { value: 'kulp', label: 'Kulp' },
                    { value: 'pixlite', label: 'PixLite' },
                    { value: 'wled', label: 'WLED' },
                  ].map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="mi-input"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`mi-cta-secondary px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`mi-cta-secondary px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SequenceCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <ListRowSkeleton />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Sequences Grid/List */}
        {!loading && (
          <>
            {viewMode === 'grid' ? (
              <section
                aria-label="Sequences Results"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
              >
                {sequences.map(sequence => (
                  <div
                    key={sequence.id}
                    className="mi-card mi-surface hover:shadow-md transition-shadow cursor-pointer overflow-hidden mi-fade-in"
                    onClick={() => handleSequenceClick(sequence.id)}
                  >
                    {/* Image */}
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
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          toggleFavorite(sequence.id)
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors mi-cta-secondary"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(sequence.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {sequence.title}
                        </h3>
                        <span className="text-lg font-bold text-blue-600">
                          ${sequence.price}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {sequence.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{sequence.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{sequence.downloads}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="mi-badge bg-blue-100 text-blue-800">
                          {sequence.category}
                        </span>
                        {sequence.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="mi-badge bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {/* Tech badges */}
                        {sequence.format && (
                          <span className="inline-flex items-center gap-1 mi-badge bg-indigo-100 text-indigo-700">
                            <Cpu className="w-3 h-3" /> {sequence.format}
                          </span>
                        )}
                        {sequence.frameRate && (
                          <span className="inline-flex items-center gap-1 mi-badge bg-green-100 text-green-700">
                            <Gauge className="w-3 h-3" /> {sequence.frameRate}{' '}
                            fps
                          </span>
                        )}
                        {sequence.duration && (
                          <span className="inline-flex items-center gap-1 mi-badge bg-yellow-100 text-yellow-700">
                            <Clock className="w-3 h-3" /> {sequence.duration}s
                          </span>
                        )}
                      </div>

                      {/* Seller */}
                      <div className="text-xs text-gray-500">
                        by{' '}
                        {sequence.seller.name ||
                          sequence.seller.displayName ||
                          sequence.seller.username ||
                          'Unknown'}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <div className="space-y-4 mb-8">
                {sequences.map(sequence => (
                  <div
                    key={sequence.id}
                    className="mi-card mi-surface hover:shadow-md transition-shadow cursor-pointer p-6 flex gap-6 mi-fade-in"
                    onClick={() => handleSequenceClick(sequence.id)}
                  >
                    {/* Image */}
                    <div className="relative w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                      {sequence.previewUrl ? (
                        <Image
                          src={sequence.previewUrl}
                          alt={sequence.title}
                          fill
                          className="object-cover rounded-lg"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center rounded-lg">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-xl">
                          {sequence.title}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-blue-600">
                            ${sequence.price}
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              toggleFavorite(sequence.id)
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors mi-cta-secondary"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                favorites.has(sequence.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">
                        {sequence.description}
                      </p>

                      {/* Stats and Tags */}
                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{sequence.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{sequence.downloads}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          by{' '}
                          {sequence.seller.name ||
                            sequence.seller.displayName ||
                            sequence.seller.username ||
                            'Unknown'}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        <span className="mi-badge bg-blue-100 text-blue-800">
                          {sequence.category}
                        </span>
                        {sequence.tags.map(tag => (
                          <span
                            key={tag}
                            className="mi-badge bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {/* Tech badges */}
                        {sequence.format && (
                          <span className="inline-flex items-center gap-1 mi-badge bg-indigo-100 text-indigo-700">
                            <Cpu className="w-3 h-3" /> {sequence.format}
                          </span>
                        )}
                        {sequence.frameRate && (
                          <span className="inline-flex items-center gap-1 mi-badge bg-green-100 text-green-700">
                            <Gauge className="w-3 h-3" /> {sequence.frameRate}{' '}
                            fps
                          </span>
                        )}
                        {sequence.duration && (
                          <span className="inline-flex items-center gap-1 mi-badge bg-yellow-100 text-yellow-700">
                            <Clock className="w-3 h-3" /> {sequence.duration}s
                          </span>
                        )}
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="mi-cta-secondary px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`mi-cta-secondary px-3 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="mi-cta-secondary px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && sequences.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sequences found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or browse all categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSortBy('newest')
                setCurrentPage(1)
              }}
              className="mi-cta bg-blue-500 text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SequencesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          {/* Global header handled by RootLayout */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SequenceCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SequencesContent />
    </Suspense>
  )
}
