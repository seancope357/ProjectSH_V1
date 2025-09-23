'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navigation } from '@/components/ui/navigation'
import { Search, Filter, Grid, List, Eye, Heart, Star, Download } from 'lucide-react'

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
    avatar?: string
  }
}

export default function SequencesPage() {
  const router = useRouter()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [category, setCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = [
    'all', 'christmas', 'halloween', 'music', 'abstract', 'nature', 'geometric', 'other'
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' }
  ]

  const fetchSequences = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        category: category === 'all' ? '' : category,
        sort: sortBy,
        page: currentPage.toString(),
        limit: '12'
      })

      const response = await fetch(`/api/sequences?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSequences(data.sequences || [])
        setTotalPages(Math.ceil((data.total || 0) / 12))
      } else {
        // Fallback with mock data for now
        setSequences([
          {
            id: '1',
            title: 'Christmas Sparkle',
            description: 'Beautiful twinkling Christmas lights sequence',
            price: 9.99,
            category: 'christmas',
            tags: ['christmas', 'sparkle', 'festive'],
            rating: 4.8,
            downloads: 1250,
            createdAt: '2024-01-15',
            seller: {
              name: 'LightMaster',
              avatar: '/avatars/lightmaster.jpg'
            }
          }
        ])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Failed to fetch sequences:', error)
      setSequences([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSequences()
  }, [sortBy, category, currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSequenceClick = (sequenceId: string) => {
    router.push(`/sequence/${sequenceId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse LED Sequences
          </h1>
          <p className="text-gray-600">
            Discover thousands of high-quality LED sequences from talented creators
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left side filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Results count */}
              <p className="text-gray-600 text-sm">
                {sequences.length} sequences found
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Sequences Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8' 
              : 'space-y-4 mb-8'
            }>
              {sequences.map((sequence) => (
                <div
                  key={sequence.id}
                  onClick={() => handleSequenceClick(sequence.id)}
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Preview Image */}
                  <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'}>
                    {sequence.previewUrl ? (
                      <Image
                        src={sequence.previewUrl}
                        alt={sequence.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1">
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
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {sequence.category}
                      </span>
                      {sequence.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Seller */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {sequence.seller.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {sequence.seller.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle favorite toggle
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sequences.length === 0 && !loading && (
              <div className="text-center py-20">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No sequences found
                </h2>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new sequences.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                        className={`px-3 py-2 rounded-lg ${
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}