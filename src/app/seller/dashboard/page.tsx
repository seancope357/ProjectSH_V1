'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navigation } from '@/components/ui/navigation'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Star,
  Upload,
  BarChart3
} from 'lucide-react'

interface SellerStats {
  totalRevenue: number
  totalSales: number
  totalSequences: number
  averageRating: number
  monthlyRevenue: number[]
  recentSales: Array<{
    id: string
    sequenceTitle: string
    amount: number
    buyerUsername: string
    createdAt: string
  }>
}

interface Sequence {
  id: string
  title: string
  description: string
  price: number
  previewUrl: string | null
  category: string
  status: 'draft' | 'published' | 'suspended'
  rating: number
  downloadCount: number
  revenue: number
  createdAt: string
  updatedAt: string
}

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'sequences' | 'analytics'>('overview')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'suspended'>('all')

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/auth/signin')
      return
    }

    // Note: Role checking would need to be implemented with Supabase user metadata
    // For now, we'll allow access and implement role checking later
    // if (user?.user_metadata?.role !== 'SELLER' && user?.user_metadata?.role !== 'ADMIN') {
    //   router.push('/')
    //   return
    // }

    if (user) {
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, sequencesResponse] = await Promise.all([
        fetch('/api/seller/stats'),
        fetch('/api/seller/sequences')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (sequencesResponse.ok) {
        const sequencesData = await sequencesResponse.json()
        setSequences(sequencesData.sequences)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSequence = async (sequenceId: string) => {
    if (!confirm('Are you sure you want to delete this sequence?')) return

    try {
      const response = await fetch(`/api/sequences/${sequenceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSequences(sequences.filter(seq => seq.id !== sequenceId))
      }
    } catch (error) {
      console.error('Failed to delete sequence:', error)
    }
  }

  const handleStatusChange = async (sequenceId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sequences/${sequenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setSequences(sequences.map(seq => 
          seq.id === sequenceId ? { ...seq, status: newStatus as 'draft' | 'published' | 'suspended' } : seq
        ))
      }
    } catch (error) {
      console.error('Failed to update sequence status:', error)
    }
  }

  const filteredSequences = sequences.filter(seq => 
    filterStatus === 'all' || seq.status === filterStatus
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your sequences and track your performance
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'sequences', label: 'My Sequences', icon: Upload },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'sequences' | 'analytics')}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalSales}
                    </p>
                  </div>
                  <Download className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Sequences</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalSequences}
                    </p>
                  </div>
                  <Upload className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Sales
              </h2>
              
              {stats.recentSales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-500">
                          Sequence
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500">
                          Buyer
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500">
                          Amount
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-500">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSales.map((sale) => (
                        <tr key={sale.id} className="border-b border-gray-100">
                          <td className="py-3 text-sm text-gray-900">
                            {sale.sequenceTitle}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {sale.buyerUsername}
                          </td>
                          <td className="py-3 text-sm font-medium text-green-600">
                            ${sale.amount.toFixed(2)}
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No sales yet. Upload your first sequence to get started!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sequences Tab */}
        {activeTab === 'sequences' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'published' | 'suspended')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <button
                onClick={() => router.push('/seller/upload')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload New Sequence
              </button>
            </div>

            {/* Sequences Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSequences.map((sequence) => (
                <div key={sequence.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Preview */}
                  <div className="aspect-video bg-gray-200">
                    {sequence.previewUrl ? (
                      <Image
                        src={sequence.previewUrl}
                        alt={sequence.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {sequence.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sequence.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : sequence.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sequence.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {sequence.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          ${sequence.price.toFixed(2)}
                        </p>
                        <p className="text-gray-500">Price</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {sequence.downloadCount}
                        </p>
                        <p className="text-gray-500">Downloads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          ${sequence.revenue.toFixed(2)}
                        </p>
                        <p className="text-gray-500">Revenue</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/sequence/${sequence.id}`)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/seller/edit/${sequence.id}`)}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSequence(sequence.id)}
                        className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status Actions */}
                    {sequence.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(sequence.id, 'published')}
                        className="w-full mt-2 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredSequences.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No sequences found
                </h2>
                <p className="text-gray-600 mb-6">
                  {filterStatus === 'all' 
                    ? "You haven't uploaded any sequences yet."
                    : `No sequences with status "${filterStatus}".`
                  }
                </p>
                <button
                  onClick={() => router.push('/seller/upload')}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload Your First Sequence
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Revenue Trend
              </h2>
              
              {/* Simple bar chart representation */}
              <div className="space-y-2">
                {stats.monthlyRevenue.map((revenue, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-16 text-sm text-gray-500">
                      Month {index + 1}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${Math.max(5, (revenue / Math.max(...stats.monthlyRevenue)) * 100)}%`
                        }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        ${revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-medium">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Order Value</span>
                    <span className="font-medium">
                      ${stats.totalSales > 0 ? (stats.totalRevenue / stats.totalSales).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Customer Rate</span>
                    <span className="font-medium">8.3%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Categories
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Christmas</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Music Sync</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Abstract</span>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other</span>
                    <span className="font-medium">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}