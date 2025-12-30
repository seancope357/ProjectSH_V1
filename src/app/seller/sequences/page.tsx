'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Search,
} from 'lucide-react'
import { useAuth } from '@/components/providers/session-provider'

interface Sequence {
  id: string
  title: string
  description: string
  price: number
  previewUrl: string | null
  thumbnailUrl: string | null
  category: string
  status: 'draft' | 'published' | 'suspended'
  downloads: number
  revenue: number
  rating: number
  createdAt: string
}

export default function SellerSequencesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchSequences()
    }
  }, [user])

  const fetchSequences = async () => {
    try {
      const res = await fetch('/api/creator/insights?range=30d')
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data?.topSequences) ? data.topSequences : []
        setSequences(
          items.map((s: any) => ({
            id: s.id,
            title: s.title || 'Untitled',
            description: s.description || '',
            price: Number(s.price || 0),
            previewUrl: s.preview_url,
            thumbnailUrl: s.thumbnail_url,
            category: s.category || 'Uncategorized',
            status: 'published', // Mock status for now as insights API might not return it
            downloads: Number(s.downloads || 0),
            revenue: Number(s.revenue || 0),
            rating: Number(s.rating || 0),
            createdAt: s.created_at,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to load sequences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sequence?')) return
    try {
      const res = await fetch(`/api/sequences/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSequences(prev => prev.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const filteredSequences = sequences.filter(seq => {
    const matchesSearch = seq.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' || seq.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Sequences</h1>
              <p className="mt-2 text-gray-600">
                Manage your portfolio, track performance, and edit listings.
              </p>
            </div>
            <button
              onClick={() => router.push('/seller/upload')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Upload New Sequence
            </button>
          </div>

          {/* Filters & Search */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sequences..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSequences.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No sequences found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters, or upload a new sequence.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSequences.map(seq => (
              <div
                key={seq.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Preview Image */}
                <div className="relative aspect-video bg-gray-100">
                  {seq.thumbnailUrl || seq.previewUrl ? (
                    <Image
                      src={seq.thumbnailUrl || seq.previewUrl!}
                      alt={seq.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        seq.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : seq.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {seq.status.charAt(0).toUpperCase() + seq.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {seq.title}
                    </h3>
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 my-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Price
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${seq.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center border-l border-gray-100">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Sales
                      </div>
                      <div className="font-semibold text-gray-900">
                        {seq.downloads}
                      </div>
                    </div>
                    <div className="text-center border-l border-gray-100">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Revenue
                      </div>
                      <div className="font-semibold text-green-600">
                        ${seq.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => router.push(`/seller/edit/${seq.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/sequence/${seq.id}`)}
                      className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Public Page"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(seq.id)}
                      className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Sequence"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
