'use client'

import Link from 'next/link'
import Image from 'next/image'
import { VerticalToolbar } from '@/components/ui/vertical-toolbar'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { WelcomeCard } from '@/components/dashboard/WelcomeCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Star,
  Shield,
  Search,
  Package,
  RefreshCw,
  Heart,
  CreditCard,
  Headphones,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

type OrderItem = {
  id: string
  sequence_id: string
  price: number
  seller_id: string
  sequences?: {
    id: string
    title: string
    price: number
    thumbnail_url?: string | null
  }
}

type Order = {
  id: string
  created_at: string
  status: string
  subtotal: number
  tax: number
  platform_fee: number
  total: number
  order_items: OrderItem[]
}

type WishlistItem = {
  id: string
  title: string
  price: number
  previewUrl?: string | null
}

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Local state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(true)
  const [recs, setRecs] = useState<WishlistItem[]>([])
  const [recsLoading, setRecsLoading] = useState(true)

  // Guard: require authentication for dashboard
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.replace('/auth/signin?callbackUrl=%2Fdashboard')
    }
  }, [user, router])

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true)
        const res = await fetch('/api/orders')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(
            body?.error || `Failed to load orders (${res.status})`
          )
        }
        const data = await res.json()
        setOrders(data.orders || [])
      } catch (e: any) {
        setOrdersError(e.message || 'Failed to load orders')
      } finally {
        setOrdersLoading(false)
      }
    }
    if (user) fetchOrders()
  }, [user])

  // Fetch wishlist (favorites): combine localStorage + server check per id
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setWishlistLoading(true)
        const saved = JSON.parse(localStorage.getItem('favorites') || '[]')
        const ids: string[] = Array.isArray(saved) ? saved.slice(0, 6) : []
        if (ids.length === 0) {
          setWishlist([])
          return
        }
        const items = await Promise.all(
          ids.map(async id => {
            try {
              const r = await fetch(`/api/sequences/${id}`)
              if (r.ok) {
                const seq = await r.json()
                return {
                  id: seq.id,
                  title: seq.title,
                  price: seq.price,
                  previewUrl: seq.previewUrl || null,
                } as WishlistItem
              }
            } catch (e) {}
            return null
          })
        )
        setWishlist(items.filter(Boolean) as WishlistItem[])
      } finally {
        setWishlistLoading(false)
      }
    }
    loadWishlist()
  }, [])

  // Fetch recommendations (top downloads)
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setRecsLoading(true)
        const res = await fetch('/api/sequences?sort=downloads&limit=8')
        if (res.ok) {
          const data = await res.json()
          const items: WishlistItem[] = (data.sequences || []).map(
            (s: any) => ({
              id: s.id,
              title: s.title,
              price: s.price,
              previewUrl: s.previewUrl || s.thumbnail_url || null,
            })
          )
          setRecs(items)
        }
      } finally {
        setRecsLoading(false)
      }
    }
    fetchRecs()
  }, [])

  // Derived stats
  const totalSpent = useMemo(() => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + Number(order.total || 0), 0)
  }, [orders])
  const totalOrders = orders.length
  const completedOrders = orders.filter(
    order => order.status === 'completed'
  ).length
  const activeOrders = orders.filter(order =>
    ['pending', 'processing'].includes(order.status)
  ).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <div className="flex">
        <VerticalToolbar />

        <div className="flex-1 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {/* Top Section: Welcome & Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <WelcomeCard user={user} />
            </div>
            <div className="flex flex-col gap-4">
              <StatCard 
                label="Total Spent" 
                value={`$${totalSpent.toFixed(2)}`} 
                icon={DollarSign}
                description="Lifetime investment"
              />
              <StatCard 
                label="Completed Orders" 
                value={completedOrders} 
                icon={CheckCircle2}
                trend={{ value: 12, isUp: true }}
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Orders</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xl font-bold">{activeOrders}</span>
                </div>
             </div>
             <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Wishlist Items</p>
                <div className="flex items-center gap-2 mt-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-xl font-bold">{wishlist.length}</span>
                </div>
             </div>
             <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Downloads</p>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-xl font-bold">{completedOrders * 2}</span> {/* Mock count */}
                </div>
             </div>
             <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Saved Cards</p>
                <div className="flex items-center gap-2 mt-1">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span className="text-xl font-bold">1</span> {/* Mock count */}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Recent Orders
                  </h3>
                  <Link href="/orders" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
                    View all <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="p-0">
                  {ordersLoading ? (
                    <div className="p-12 text-center text-gray-400">Loading your history...</div>
                  ) : ordersError ? (
                    <div className="p-12 text-center text-red-500">{ordersError}</div>
                  ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500">No orders yet. Start your collection today!</p>
                      <Link href="/sequences" className="text-blue-600 font-bold mt-2 inline-block">Browse sequences</Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-3 font-semibold">Order ID</th>
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          {orders.slice(0, 5).map(order => (
                            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium font-mono text-gray-600 dark:text-gray-400">
                                #{order.id.slice(0, 8)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                  order.status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                  order.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                )}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-right text-gray-900 dark:text-white">
                                ${Number(order.total || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Recommended for You
                  </h3>
                  <Link href="/sequences" className="text-sm text-blue-600 font-semibold hover:underline">
                    Browse all
                  </Link>
                </div>
                {recsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recs.slice(0, 4).map(item => (
                      <Link key={item.id} href={`/sequence/${item.id}`} className="group space-y-2">
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                          {item.previewUrl && (
                            <Image src={item.previewUrl} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</p>
                          <p className="text-sm text-blue-600 font-bold">${item.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Wishlist & Resources */}
            <div className="space-y-6">
              {/* Wishlist Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Wishlist
                  </h3>
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {wishlist.length}
                  </span>
                </div>
                <div className="p-4">
                  {wishlistLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />)}
                    </div>
                  ) : wishlist.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm italic">
                      Your wishlist is empty.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlist.slice(0, 3).map(item => (
                        <Link key={item.id} href={`/sequence/${item.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                          <div className="w-12 h-12 relative rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                            {item.previewUrl && <Image src={item.previewUrl} alt={item.title} fill className="object-cover" unoptimized />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                            <p className="text-xs text-blue-600 font-bold">${item.price}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300" />
                        </Link>
                      ))}
                      {wishlist.length > 3 && (
                        <Link href="/sequences" className="block text-center text-xs font-bold text-gray-500 hover:text-blue-600 mt-2">
                          + {wishlist.length - 3} more items
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Security & Support */}
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Account Security
                </h3>
                <p className="text-sm text-blue-100/80 leading-relaxed">
                  Your account is protected with 256-bit encryption. Keep your credentials safe.
                </p>
                <div className="space-y-2 pt-2">
                  <Link href="/profile" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium group">
                    Security Settings
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/help" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium group">
                    Help Center
                    <Headphones className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Profile Completeness</h3>
                <div className="space-y-4">
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Email Verified
                    </li>
                    <li className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Profile Details
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200"></div> Add Payment Method
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
