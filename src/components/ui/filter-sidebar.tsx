'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X, Check } from 'lucide-react'

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  // Categories
  const categories = [
    'Holiday & Seasonal',
    'Music Sync',
    'Mega Tree',
    'House Outline',
    'RGB Effects',
    'Props & Elements',
  ]

  // Formats
  const formats = ['FSEQ', 'MP4', 'ZIP', 'XSQ']

  // Update URL helper
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset page on filter change
    router.push(`/sequences?${params.toString()}`)
  }

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')
    
    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')
    
    params.set('page', '1')
    router.push(`/sequences?${params.toString()}`)
  }

  const currentCategory = searchParams.get('category')
  const currentFormat = searchParams.get('format')
  const currentSort = searchParams.get('sort') || 'newest'

  return (
    <div className="space-y-8">
      {/* Search within results */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          Keywords
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Filter..."
            defaultValue={searchParams.get('q') || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilter('q', e.currentTarget.value)
              }
            }}
            className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          Sort By
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-900">
            Category
          </label>
          {currentCategory && (
            <button
              onClick={() => updateFilter('category', null)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                currentCategory === cat 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300 group-hover:border-blue-400'
              }`}>
                {currentCategory === cat && <Check className="w-3 h-3 text-white" />}
              </div>
              <input
                type="radio"
                name="category"
                className="hidden"
                checked={currentCategory === cat}
                onChange={() => updateFilter('category', cat)}
              />
              <span className={`text-sm ${currentCategory === cat ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-2">
          Price Range
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="w-full py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Apply
        </button>
      </div>

      {/* Formats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-900">
            Format
          </label>
          {currentFormat && (
            <button
              onClick={() => updateFilter('format', null)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {formats.map((fmt) => (
            <label key={fmt} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                currentFormat === fmt
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300 group-hover:border-blue-400'
              }`}>
                {currentFormat === fmt && <Check className="w-3 h-3 text-white" />}
              </div>
              <input
                type="radio"
                name="format"
                className="hidden"
                checked={currentFormat === fmt}
                onChange={() => updateFilter('format', fmt)}
              />
              <span className={`text-sm ${currentFormat === fmt ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                {fmt}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
