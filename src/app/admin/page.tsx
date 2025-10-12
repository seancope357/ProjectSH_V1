'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'
// Removed page-level Navigation; global header renders in layout

interface AdminStats {
  totalUsers: number
  totalSequences: number
  totalSales: number
  pendingReviews: number
  monthlyRevenue: number
  activeUsers: number
}

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'SELLER' | 'ADMIN'
  createdAt: string
  isActive: boolean
  totalPurchases?: number
  totalSales?: number
}

interface Sequence {
  id: string
  title: string
  seller: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  downloads: number
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'sequences' | 'settings'
  >('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [sequences, setSequences] = useState<Sequence[]>([])

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Check if user has admin role
    if (user.user_metadata?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchAdminData()
  }, [user, authLoading, router])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, sequencesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/sequences'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (sequencesRes.ok) {
        const sequencesData = await sequencesRes.json()
        setSequences(sequencesData)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (
    userId: string,
    action: 'activate' | 'deactivate' | 'promote' | 'demote'
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleSequenceAction = async (
    sequenceId: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      const response = await fetch(`/api/admin/sequences/${sequenceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to update sequence:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Global header handled by RootLayout */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage users, sequences, and platform settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'users', name: 'Users' },
              { id: 'sequences', name: 'Sequences' },
              { id: 'settings', name: 'Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.activeUsers} active this month
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">
                  Total Sequences
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalSequences}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.pendingReviews} pending review
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">
                  Monthly Revenue
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  ${stats.monthlyRevenue}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.totalSales} total sales
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                User Management
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'SELLER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() =>
                            handleUserAction(
                              user.id,
                              user.isActive ? 'deactivate' : 'activate'
                            )
                          }
                          className={`${
                            user.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() =>
                              handleUserAction(
                                user.id,
                                user.role === 'SELLER' ? 'demote' : 'promote'
                              )
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {user.role === 'SELLER' ? 'Demote' : 'Promote'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sequences Tab */}
        {activeTab === 'sequences' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Sequence Management
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sequence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sequences.map(sequence => (
                    <tr key={sequence.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sequence.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(sequence.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sequence.seller}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sequence.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sequence.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : sequence.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {sequence.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sequence.downloads}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {sequence.status === 'pending' && (
                          <>
                            <button
                              onClick={() =>
                                handleSequenceAction(sequence.id, 'approve')
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleSequenceAction(sequence.id, 'reject')
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Platform Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Platform Commission (%)
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    defaultValue="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Sequence Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    defaultValue="1.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    defaultValue="50"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Require admin approval for new sequences
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable user reviews and ratings
                  </label>
                </div>
              </div>
              <div className="mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
