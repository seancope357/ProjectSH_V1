'use client'

import Link from 'next/link'
import Image from 'next/image'
import { VerticalToolbar } from '@/components/ui/vertical-toolbar'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
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
    <div className="min-h-screen">
      {/* Global header is rendered by RootLayout; add left toolbar */}
      <div className="flex">
        <VerticalToolbar />

        <div className="flex-1 p-6">
          {/* Top: Welcome + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome card */}
            <div className="mi-card mi-surface p-6 lg:col-span-2">
              <h1 className="text-2xl font-semibold">Welcome back</h1>
              <p className="mt-2 text-gray-600">
                Track orders, manage wishlist and payments, and discover new
                sequences.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/sequences"
                  className="mi-cta bg-blue-600 text-white"
                >
                  <Search className="h-4 w-4" /> Browse Sequences
                </Link>
                <Link
                  href="/cart"
                  className="mi-cta-secondary border px-4 py-2"
                >
                  <ShoppingCart className="h-4 w-4" /> View Cart
                </Link>
                <Link
                  href="/orders"
                  className="mi-cta-secondary border px-4 py-2"
                >
                  View Orders <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/profile"
                  className="mi-cta-secondary border px-4 py-2"
                >
                  Account Settings
                </Link>
              </div>
            </div>

            {/* KPIs */}
            <div className="mi-card mi-surface p-6">
              <h2 className="text-lg font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold">{totalOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Active</p>
                  <p className="text-xl font-bold">{activeOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-xl font-bold">{completedOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Spent</p>
                  <p className="text-xl font-bold">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders summary + Wishlist */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="mi-card mi-surface p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Link
                  href="/orders"
                  className="text-blue-700 hover:underline text-sm"
                >
                  View all
                </Link>
              </div>
              {ordersLoading ? (
                <div className="text-sm text-gray-600">Loading orders…</div>
              ) : ordersError ? (
                <div className="text-sm text-red-600">{ordersError}</div>
              ) : orders.length === 0 ? (
                <div className="text-sm text-gray-600">No orders yet.</div>
              ) : (
                <div className="divide-y">
                  {orders.slice(0, 5).map(order => (
                    <div
                      key={order.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`mi-badge ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                        <span className="text-sm text-gray-700">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm font-semibold">
                        ${Number(order.total || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <div className="mi-card mi-surface p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Wishlist</h3>
                <Link
                  href="/sequences"
                  className="text-blue-700 hover:underline text-sm"
                >
                  Explore more
                </Link>
              </div>
              {wishlistLoading ? (
                <div className="text-sm text-gray-600">Loading wishlist…</div>
              ) : wishlist.length === 0 ? (
                <div className="text-sm text-gray-600">No saved items yet.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {wishlist.slice(0, 4).map(item => (
                    <Link
                      key={item.id}
                      href={`/sequence/${item.id}`}
                      className="mi-card overflow-hidden"
                    >
                      <div className="relative h-24 bg-gray-200">
                        {item.previewUrl ? (
                          <Image
                            src={item.previewUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-sm text-blue-700 font-semibold">
                          ${item.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payments + Support */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mi-card mi-surface p-6">
              <h3 className="text-lg font-semibold mb-2">
                Saved Payment Methods
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Add or manage payment methods to speed up checkout.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/checkout"
                  className="mi-cta bg-blue-600 text-white"
                >
                  <CreditCard className="h-4 w-4" /> Add Payment Method
                </Link>
                <Link
                  href="/profile"
                  className="mi-cta-secondary border px-4 py-2"
                >
                  Manage in Account
                </Link>
              </div>
            </div>

            <div className="mi-card mi-surface p-6">
              <h3 className="text-lg font-semibold mb-2">Support</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get help with purchases, downloads, and account settings.
              </p>
              <Link
                href="/help"
                className="mi-cta-secondary border px-4 py-2 inline-flex items-center gap-2"
              >
                <Headphones className="h-4 w-4" /> Visit Help Center
              </Link>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 mi-card mi-surface p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recommended for You</h3>
              <Link
                href="/sequences"
                className="text-blue-700 hover:underline text-sm"
              >
                Browse all
              </Link>
            </div>
            {recsLoading ? (
              <div className="text-sm text-gray-600">
                Loading recommendations…
              </div>
            ) : recs.length === 0 ? (
              <div className="text-sm text-gray-600">
                No recommendations available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recs.map(item => (
                  <Link
                    key={item.id}
                    href={`/sequence/${item.id}`}
                    className="mi-card overflow-hidden"
                  >
                    <div className="relative h-28 bg-gray-200">
                      {item.previewUrl ? (
                        <Image
                          src={item.previewUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-sm text-blue-700 font-semibold">
                        ${item.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Highlights & resources */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mi-card mi-surface p-6">
              <h3 className="text-lg font-semibold">Highlights</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" /> Top-rated
                  sequences curated for you
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" /> Clear licensing
                  for confident purchasing
                </li>
              </ul>
            </div>
            <div className="mi-card mi-surface p-6">
              <h3 className="text-lg font-semibold">Buyer Resources</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-blue-700 hover:underline">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/licensing"
                    className="text-blue-700 hover:underline"
                  >
                    Licensing Guide
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
