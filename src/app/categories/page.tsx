'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
// Removed page-level Navigation; global header renders in layout
import { Search, Grid, List } from 'lucide-react'

type Category = { id: string; name: string; description?: string | null }

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/categories')
        const json = await res.json()
        if (!res.ok) {
          setError(json?.error || 'Failed to load categories')
          setCategories([])
        } else {
          setCategories(Array.isArray(json.categories) ? json.categories : [])
        }
      } catch (e) {
        setError('Failed to load categories')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  const filteredCategories = categories.filter(
    category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'count':
        return b.count - a.count
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">Browse sequences by category</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="count">Sort by Count</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}
        {!loading && categories.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 text-gray-700">
            No categories yet.
          </div>
        )}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCategories.map(category => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  {category.description ? (
                    <p className="text-gray-600 mb-4">{category.description}</p>
                  ) : null}
                  <div className="flex items-center justify-end">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Browse
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map(category => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  {category.description ? (
                    <p className="text-gray-600 mb-2">{category.description}</p>
                  ) : null}
                </div>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Browse
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
