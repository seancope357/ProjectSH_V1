'use client'

import { useEffect, useMemo, useState } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { Download, Search, Calendar, FileDown } from 'lucide-react'

type DownloadItem = {
  id: string
  user_id: string
  sequence_id: string
  created_at: string
  download_count?: number
  sequences?: {
    id: string
    title: string
    thumbnail_url?: string | null
    file_url?: string | null
  }
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/downloads')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || `Failed to load downloads (${res.status})`)
        }
        const data = await res.json()
        setDownloads(data.downloads || [])
      } catch (e: any) {
        setError(e.message || 'Failed to load downloads')
      } finally {
        setLoading(false)
      }
    }
    fetchDownloads()
  }, [])

  const filtered = useMemo(() => {
    return downloads.filter(d =>
      (d.sequences?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sequence_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [downloads, searchTerm])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Downloads</h1>
          <p className="mt-2 text-gray-600">Access purchased sequences and download files</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Downloads</h2>
          </div>

          {loading && <div className="p-6 text-gray-600">Loading downloads...</div>}
          {error && <div className="p-6 text-red-600">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="p-12 text-center">
              <FileDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads found</h3>
              <p className="text-gray-600">Your purchased items will appear here</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="divide-y divide-gray-200">
              {filtered.map((d) => (
                <div key={d.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {d.sequences?.thumbnail_url && (
                        <img
                          src={d.sequences.thumbnail_url}
                          alt={d.sequences.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {d.sequences?.title || 'Sequence'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Sequence #{d.sequence_id}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(d.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <a
                        href={`/api/download/${d.sequence_id}`}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}