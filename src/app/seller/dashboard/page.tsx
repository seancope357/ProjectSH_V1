'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
// Removed page-level Navigation; global header renders in layout
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
  BarChart3,
} from 'lucide-react'
import { SellerKpiStrip } from '@/components/ui/seller-kpi-strip'
import { SellerTopTasks } from '@/components/ui/seller-top-tasks'
import { OrdersQueue } from '@/components/ui/orders-queue'
import { ListingsHealth } from '@/components/ui/listings-health'
import { ShopAdvisor } from '@/components/ui/shop-advisor'
import { ActivityFeed } from '@/components/ui/activity-feed'
import { QuickActions } from '@/components/ui/quick-actions'
import type { KpiItem } from '@/components/ui/seller-kpi-strip'
import type { TopTask } from '@/components/ui/seller-top-tasks'
import type { OrderItem } from '@/components/ui/orders-queue'
import type { ActivityItem } from '@/components/ui/activity-feed'

interface SellerStats {
  totalRevenue: number
  totalSales: number
  totalSequences: number
  averageRating: number
  monthlyRevenue: number[]
}

interface SellerProfileSummary {
  full_name?: string
  username?: string
  avatar_url?: string | null
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
  const [sellerProfile, setSellerProfile] =
    useState<SellerProfileSummary | null>(null)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sequences' | 'analytics'
  >('overview')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'draft' | 'published' | 'suspended'
  >('all')

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/auth/signin')
      return
    }

    // Check if user has seller or admin role
    if (
      user &&
      user.user_metadata?.role !== 'SELLER' &&
      user.user_metadata?.role !== 'ADMIN'
    ) {
      router.push('/')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      const [profileRes, insightsRes] = await Promise.all([
        fetch('/api/user/setup-profile'),
        fetch('/api/creator/insights?range=30d&granularity=daily'),
      ])

      if (profileRes.ok) {
        const { profile } = await profileRes.json()
        setSellerProfile(profile)
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json()
        const totals = data?.totals || {}
        const points = data?.timeseries?.points || []
        setStats({
          totalRevenue: Number(totals.revenue || 0),
          totalSales: Number(totals.sales || 0),
          totalSequences: Number(totals.sequences || 0),
          averageRating: 0,
          monthlyRevenue: points.map((p: any) => Number(p.revenue || 0)),
        })

        const topSequences = Array.isArray(data?.topSequences)
          ? data.topSequences
          : []
        setSequences(
          topSequences.map((s: any) => ({
            id: s.id,
            title: s.title || 'Untitled',
            description: '',
            price: Number(s.price || 0),
            previewUrl: null,
            category: s.category || 'Uncategorized',
            status: 'published',
            rating: 0,
            downloadCount: Number(s.downloads || 0),
            revenue: Number(s.revenue || 0),
            createdAt: '',
            updatedAt: '',
          }))
        )
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
        method: 'DELETE',
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
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSequences(
          sequences.map(seq =>
            seq.id === sequenceId
              ? {
                  ...seq,
                  status: newStatus as 'draft' | 'published' | 'suspended',
                }
              : seq
          )
        )
      }
    } catch (error) {
      console.error('Failed to update sequence status:', error)
    }
  }

  const filteredSequences = sequences.filter(
    seq => filterStatus === 'all' || seq.status === filterStatus
  )

  // Dashboard mock data (to be wired to real endpoints)
  const kpiItems: KpiItem[] = stats
    ? [
        {
          label: 'Total Revenue',
          value: `$${stats.totalRevenue.toFixed(2)}`,
          accent: 'green',
        },
        { label: 'Total Sales', value: stats.totalSales, accent: 'blue' },
        {
          label: 'Sequences',
          value: stats.totalSequences,
          accent: 'purple',
        },
        {
          label: 'Avg. Rating',
          value: stats.averageRating.toFixed(1),
          accent: 'yellow',
        },
      ]
    : []

  const topTasks: TopTask[] = [
    {
      id: 'messages',
      label: 'Messages awaiting reply',
      count: 2,
      icon: 'messages',
    },
    {
      id: 'renewal',
      label: 'Drafts ready to publish',
      count: 1,
      icon: 'renewal',
    },
    { id: 'overdue', label: 'Overdue shipments', count: 0, icon: 'overdue' },
  ]

  const ordersQueue: OrderItem[] = [
    { id: '1024', buyer: 'jamie', items: 3, ageLabel: '2h', status: 'open' },
    { id: '1023', buyer: 'alex', items: 1, ageLabel: '1d', status: 'open' },
    {
      id: '1022',
      buyer: 'mira',
      items: 2,
      ageLabel: '3d',
      status: 'completed',
    },
  ]

  const listingsHealth = sequences.slice(0, 5).map(seq => ({
    id: seq.id,
    title: seq.title,
    status: seq.status,
    views: undefined,
    rating: seq.rating,
  }))

  const advisorTips = [
    {
      id: 'tip-1',
      title: 'Add a short demo video',
      description: 'Listings with demos convert 18% better on average.',
      ctaLabel: 'Upload demo',
    },
    {
      id: 'tip-2',
      title: 'Enable bundle pricing',
      description: 'Offer a multi-sequence bundle to increase AOV.',
      ctaLabel: 'Create bundle',
    },
  ]

  const activityItems: ActivityItem[] = [
    {
      id: 'act-1',
      ts: 'Today 10:24',
      kind: 'sale',
      summary: 'Sold “Christmas Wonderland” for $12.99',
    },
    {
      id: 'act-2',
      ts: 'Today 09:10',
      kind: 'message',
      summary: 'Buyer asked about controller compatibility',
    },
    {
      id: 'act-3',
      ts: 'Yesterday',
      kind: 'payout',
      summary: 'Weekly payout sent: $86.50',
    },
  ]

  const quickActions = [
    {
      id: 'qa-upload',
      label: 'Upload Sequence',
      onClick: () => router.push('/seller/upload'),
    },
    {
      id: 'qa-new-listing',
      label: 'Create Listing',
      onClick: () => router.push('/seller/sequences'),
    },
    { id: 'qa-offer', label: 'Create Offer' },
    {
      id: 'qa-payouts',
      label: 'View Payouts',
      onClick: () => router.push('/seller/payouts'),
    },
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Global header handled by RootLayout */}
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {sellerProfile?.avatar_url ? (
              <Image
                src={sellerProfile.avatar_url}
                alt={sellerProfile.full_name || 'Seller avatar'}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200" />
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Seller Dashboard
              </h1>
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                Seller-only
              </span>
            </div>
          </div>
          <div className="mt-2 text-gray-700">
            {sellerProfile?.full_name && (
              <p className="font-medium">
                {sellerProfile.full_name}{' '}
                {sellerProfile.username && (
                  <span className="text-gray-500">
                    @{sellerProfile.username}
                  </span>
                )}
              </p>
            )}
            <p className="text-sm">
              This dashboard is for sellers. Buyers browse the main Marketplace
              with tagging for easy search — like Etsy.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'sequences', label: 'My Sequences', icon: Upload },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as 'overview' | 'sequences' | 'analytics'
                    )
                  }
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
            {/* Quick actions */}
            <QuickActions actions={quickActions} />

            {/* KPI strip */}
            <SellerKpiStrip items={kpiItems} />

            {/* Core panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SellerTopTasks tasks={topTasks} />
                <OrdersQueue orders={ordersQueue} />
                <ListingsHealth items={listingsHealth} />
              </div>
              <div className="space-y-6">
                <ShopAdvisor tips={advisorTips} />
                <ActivityFeed items={activityItems} />
              </div>
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
                  onChange={e =>
                    setFilterStatus(
                      e.target.value as
                        | 'all'
                        | 'draft'
                        | 'published'
                        | 'suspended'
                    )
                  }
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
                className="mi-cta bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Upload New Sequence
              </button>
            </div>

            {/* Sequences Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSequences.map(sequence => (
                <div
                  key={sequence.id}
                  className="mi-card bg-white rounded-lg shadow-md overflow-hidden"
                >
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
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          sequence.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : sequence.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
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
                        className="flex-1 mi-cta-secondary border border-gray-300 text-gray-800 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/seller/edit/${sequence.id}`)
                        }
                        className="flex-1 mi-cta bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSequence(sequence.id)}
                        className="mi-cta-secondary text-red-700 border border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status Actions */}
                    {sequence.status === 'draft' && (
                      <button
                        onClick={() =>
                          handleStatusChange(sequence.id, 'published')
                        }
                        className="w-full mt-2 mi-cta bg-green-600 text-white hover:bg-green-700"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredSequences.length === 0 && (
              <div className="mi-card bg-white rounded-lg shadow-md p-12 text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No sequences found
                </h2>
                <p className="text-gray-600 mb-6">
                  {filterStatus === 'all'
                    ? "You haven't uploaded any sequences yet."
                    : `No sequences with status "${filterStatus}".`}
                </p>
                <button
                  onClick={() => router.push('/seller/upload')}
                  className="mi-cta bg-blue-600 text-white hover:bg-blue-700"
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
            <div className="mi-card bg-white rounded-lg shadow-md p-6">
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
                          width: `${Math.max(5, (revenue / Math.max(...stats.monthlyRevenue)) * 100)}%`,
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
              <div className="mi-card bg-white rounded-lg shadow-md p-6">
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
                      $
                      {stats.totalSales > 0
                        ? (stats.totalRevenue / stats.totalSales).toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Customer Rate</span>
                    <span className="font-medium">8.3%</span>
                  </div>
                </div>
              </div>

              <div className="mi-card bg-white rounded-lg shadow-md p-6">
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
