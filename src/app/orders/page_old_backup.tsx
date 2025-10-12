'use client'

import { useState } from 'react'
// Removed page-level Navigation; global header renders in layout
import {
  Package,
  Download,
  Star,
  Calendar,
  Search,
  Eye,
  RefreshCw,
} from 'lucide-react'

const orderData = [
  {
    id: 'ORD-001',
    sequenceName: 'Advanced Email Automation',
    seller: 'AutomationPro',
    price: 29.99,
    date: '2024-01-20',
    status: 'completed',
    rating: 5,
    category: 'Productivity',
  },
  {
    id: 'ORD-002',
    sequenceName: 'Gaming Macro Bundle',
    seller: 'GameMaster',
    price: 19.99,
    date: '2024-01-18',
    status: 'completed',
    rating: 4,
    category: 'Gaming',
  },
  {
    id: 'ORD-003',
    sequenceName: 'Design Workflow Optimizer',
    seller: 'CreativeFlow',
    price: 39.99,
    date: '2024-01-15',
    status: 'processing',
    rating: null,
    category: 'Creative',
  },
  {
    id: 'ORD-004',
    sequenceName: 'Data Analysis Scripts',
    seller: 'DataWizard',
    price: 49.99,
    date: '2024-01-12',
    status: 'completed',
    rating: 5,
    category: 'Development',
  },
  {
    id: 'ORD-005',
    sequenceName: 'Social Media Scheduler',
    seller: 'SocialBot',
    price: 24.99,
    date: '2024-01-10',
    status: 'refunded',
    rating: null,
    category: 'Marketing',
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Package className="h-4 w-4" />
      case 'processing':
        return <RefreshCw className="h-4 w-4" />
      case 'refunded':
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const filteredOrders = orderData.filter(order => {
    const matchesSearch =
      order.sequenceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'price':
        return b.price - a.price
      case 'name':
        return a.sequenceName.localeCompare(b.sequenceName)
      default:
        return 0
    }
  })

  const totalSpent = orderData
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.price, 0)

  const totalOrders = orderData.length
  const completedOrders = orderData.filter(
    order => order.status === 'completed'
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            View and manage your sequence purchases
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedOrders}
                </p>
              </div>
              <Download className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Order History
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sortedOrders.map(order => (
              <div
                key={order.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {order.sequenceName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Order #{order.id}</span>
                      <span>by {order.seller}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {order.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {order.date}
                      </div>
                    </div>

                    {order.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-sm text-gray-600">
                          Your rating:
                        </span>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < order.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      ${order.price.toFixed(2)}
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'completed' && (
                        <>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm">
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </>
                      )}

                      {order.status === 'processing' && (
                        <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg cursor-not-allowed text-sm">
                          Processing...
                        </button>
                      )}

                      {order.status === 'refunded' && (
                        <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm">
                          Refunded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven&apos;t made any purchases yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
