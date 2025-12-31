'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, Heart, Star, Download, Cpu, Gauge, Clock, Grid, List } from 'lucide-react'
import { TrendingSequence } from '@/lib/market-service'
import { useAuth } from '@/components/providers/session-provider'

interface SequenceGridProps {
  sequences: TrendingSequence[]
}

export function SequenceGrid({ sequences }: SequenceGridProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('favorites')
        return saved ? new Set(JSON.parse(saved)) : new Set()
      } catch {
        return new Set()
      }
    }
    return new Set()
  })

  const toggleFavorite = async (e: React.MouseEvent, sequenceId: string) => {
    e.stopPropagation()
    const newFavorites = new Set(favorites)
    if (favorites.has(sequenceId)) {
      newFavorites.delete(sequenceId)
    } else {
      newFavorites.add(sequenceId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)))

    if (user) {
      try {
        const method = favorites.has(sequenceId) ? 'DELETE' : 'POST'
        await fetch(`/api/user/favorites/${sequenceId}`, { method })
      } catch (err) {
        console.error('Failed to sync favorite:', err)
      }
    }
  }

  if (sequences.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
          <Grid className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No sequences found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn't find any sequences matching your criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sequences.map(seq => (
            <div
              key={seq.id}
              onClick={() => router.push(`/sequence/${seq.id}`)}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
            >
              {/* Preview */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {seq.previewUrl || seq.thumbnailUrl ? (
                  <Image
                    src={seq.previewUrl || seq.thumbnailUrl || ''}
                    alt={seq.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={seq.previewUrl?.startsWith('data:')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                    <Eye className="w-8 h-8" />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => toggleFavorite(e, seq.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(seq.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {seq.title}
                  </h3>
                  <span className="font-bold text-blue-600 whitespace-nowrap">
                    ${seq.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-50">
                   <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      <span>{seq.rating.toFixed(1)}</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>{seq.downloads}</span>
                   </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    {seq.category || 'Uncategorized'}
                  </span>
                  <span>{seq.seller?.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {sequences.map(seq => (
            <div
              key={seq.id}
              onClick={() => router.push(`/sequence/${seq.id}`)}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex gap-6 p-4"
            >
              <div className="relative w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {seq.previewUrl || seq.thumbnailUrl ? (
                  <Image
                    src={seq.previewUrl || seq.thumbnailUrl || ''}
                    alt={seq.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={seq.previewUrl?.startsWith('data:')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                    <Eye className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {seq.title}
                    </h3>
                    <span className="text-lg font-bold text-blue-600">
                      ${seq.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    by {seq.seller?.displayName || seq.seller?.username}
                  </p>
                  <div className="flex gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                      {seq.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{seq.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{seq.downloads} downloads</span>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={(e) => toggleFavorite(e, seq.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(seq.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
