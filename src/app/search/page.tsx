'use client'

import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Search, Filter, Star, Download, Grid, List, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface SearchFilters {
  category: string
  priceRange: [number, number]
  rating: number
  tags: string[]
  sortBy: string
}

interface SearchResult {
  id: string
  title: string
  description: string
  price: number
  thumbnail: string
  rating: number
  downloads: number
  seller: string
  tags: string[]
  createdAt: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    priceRange: [0, 100],
    rating: 0,
    tags: [],
    sortBy: 'relevance'
  })

  // Mock search results
  const searchResults: SearchResult[] = [
    {
      id: '1',
      title: 'Christmas Magic Spectacular',
      description: 'A breathtaking Christmas light sequence featuring synchronized music and stunning visual effects.',
      price: 29.99,
      thumbnail: 'https://images.unsplash.com/photo-1545558014-8692c3eb5c50?q=80&w=400&auto=format&fit=crop',
      rating: 4.8,
      downloads: 2847,
      seller: 'LightMaster Pro',
      tags: ['Christmas', 'Holiday', 'Synchronized'],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Halloween Spooky Show',
      description: 'Spine-chilling Halloween sequence with eerie effects and perfectly timed scares.',
      price: 24.99,
      thumbnail: 'https://images.unsplash.com/photo-1509557965043-6b9f3d7beddd?q=80&w=400&auto=format&fit=crop',
      rating: 4.7,
      downloads: 1923,
      seller: 'SpookyLights',
      tags: ['Halloween', 'Spooky', 'Effects'],
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Summer Festival Lights',
      description: 'Vibrant summer sequence perfect for outdoor festivals and celebrations.',
      price: 19.99,
      thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop',
      rating: 4.6,
      downloads: 1456,
      seller: 'FestivalPro',
      tags: ['Summer', 'Festival', 'Colorful'],
      createdAt: '2024-01-05'
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'christmas', label: 'Christmas' },
    { value: 'halloween', label: 'Halloween' },
    { value: 'summer', label: 'Summer' },
    { value: 'winter', label: 'Winter' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'wedding', label: 'Wedding' }
  ]

  const availableTags = [
    'Christmas', 'Halloween', 'Summer', 'Winter', 'Holiday', 'Festive',
    'Synchronized', 'RGB', 'Pixel', 'Traditional', 'Music', 'Effects',
    'Colorful', 'Elegant', 'Fun', 'Professional'
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery, 'with filters:', filters)
    // Implement search functionality
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | string[] | [number, number]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 100],
      rating: 0,
      tags: [],
      sortBy: 'relevance'
    })
  }

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100,
    filters.rating > 0,
    filters.tags.length > 0
  ].filter(Boolean).length

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-white mb-6">
              {initialQuery ? `Search Results for "${initialQuery}"` : 'Search Sequences'}
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for light sequences..."
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
              <div className="bg-surface rounded-lg p-6 border border-white/10 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Button onClick={clearFilters} variant="ghost" size="sm">
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.priceRange[0]}
                        onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Minimum Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleFilterChange('rating', rating === filters.rating ? 0 : rating)}
                          className="p-1"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              rating <= filters.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Tags</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            filters.tags.includes(tag)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-background text-gray-300 border-white/20 hover:border-primary/50'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="text-gray-300">
                  Showing {searchResults.length} results
                  {searchQuery && ` for "${searchQuery}"`}
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="px-4 py-2 bg-surface border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  
                  <div className="flex border border-white/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:text-white'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:text-white'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full border border-primary/30">
                      Category: {categories.find(c => c.value === filters.category)?.label}
                      <button onClick={() => handleFilterChange('category', 'all')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full border border-primary/30">
                      Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      <button onClick={() => handleFilterChange('priceRange', [0, 100])}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.rating > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full border border-primary/30">
                      {filters.rating}+ Stars
                      <button onClick={() => handleFilterChange('rating', 0)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full border border-primary/30">
                      {tag}
                      <button onClick={() => toggleTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Results Grid/List */}
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No sequences found matching your criteria</div>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResults.map((result) => (
                    <Link key={result.id} href={`/sequence/${result.id}`}>
                      <div className="bg-surface rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group">
                        <div className="relative aspect-video">
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-semibold">
                            ${result.price}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors">
                            {result.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">by {result.seller}</p>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{result.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-white text-sm">{result.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Download className="w-4 h-4" />
                              <span>{result.downloads}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <Link key={result.id} href={`/sequence/${result.id}`}>
                      <div className="bg-surface rounded-lg p-4 border border-white/10 hover:border-primary/50 transition-colors group">
                        <div className="flex gap-4">
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-white font-semibold group-hover:text-primary transition-colors">
                                  {result.title}
                                </h3>
                                <p className="text-gray-400 text-sm">by {result.seller}</p>
                              </div>
                              <div className="text-xl font-bold text-accent">${result.price}</div>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{result.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-white text-sm">{result.rating}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                  <Download className="w-4 h-4" />
                                  <span>{result.downloads}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {result.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
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
        </div>
      </div>
    </Layout>
  )
}