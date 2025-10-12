'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
// Removed page-level Navigation; global header renders in layout
import { CheckCircle, Download, Receipt, Info, Calendar } from 'lucide-react'

type SessionInfo = {
  status: string
  customerEmail?: string | null
  amountTotal?: number | null
  currency?: string | null
  orderId?: string | null
}

export default function CheckoutSuccessPage() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [loading, setLoading] = useState(!!sessionId)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [latestOrder, setLatestOrder] = useState<{
    id: string
    created_at: string
    status: string
    total: number
    items: Array<{
      sequence_id: string
      price: number
      seller_id: string
      sequence?: { title?: string }
    }>
  } | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return
      try {
        setLoading(true)
        const res = await fetch(
          `/api/checkout?session_id=${encodeURIComponent(sessionId)}`
        )
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(
            body?.error || `Failed to load session (${res.status})`
          )
        }
        const data = await res.json()
        setSession(data)
      } catch (e: any) {
        setError(e.message || 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) {
          return
        }
        const data = await res.json()
        const orders = Array.isArray(data.orders) ? data.orders : []
        const completed = orders.filter((o: any) => o.status === 'completed')
        if (completed.length > 0) {
          // Orders API returns newest first; take the first
          setLatestOrder(completed[0])
        }
      } catch {}
    }
    fetchLatestOrder()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Payment Successful
          </h1>
          <p className="mt-2 text-gray-600">
            Your purchase has been processed. Downloads are ready when the order
            completes.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Thank you for your purchase!
              </h2>
              {sessionId ? (
                <p className="text-gray-600">
                  We’re confirming your payment details. This page reflects your
                  session status.
                </p>
              ) : (
                <p className="text-gray-600">
                  No session detected. If you reached this page after checkout,
                  your order should still be visible.
                </p>
              )}
            </div>
          </div>

          {loading && (
            <div className="mt-4 text-gray-600">Loading session details...</div>
          )}
          {error && <div className="mt-4 text-red-600">{error}</div>}

          {!loading && !error && session && (
            <div className="mt-6 space-y-2 text-gray-700">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span>
                  Status:{' '}
                  <span className="font-medium capitalize">
                    {session.status || 'unknown'}
                  </span>
                </span>
              </div>
              {session.customerEmail && (
                <div>
                  Email:{' '}
                  <span className="font-medium">{session.customerEmail}</span>
                </div>
              )}
              {session.amountTotal && (
                <div>
                  Total:{' '}
                  <span className="font-medium">
                    {(session.amountTotal / 100).toFixed(2)}{' '}
                    {session.currency?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/downloads"
              className="mi-cta inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Go to Downloads
            </Link>
            {session?.orderId && session?.status === 'paid' && (
              <Link
                href={`/orders/${session.orderId}`}
                className="mi-cta-secondary inline-flex items-center gap-2 border border-gray-300 text-gray-800 hover:bg-gray-100"
              >
                <Receipt className="h-4 w-4" />
                View Receipt
              </Link>
            )}
            <Link
              href="/orders"
              className="mi-cta-secondary inline-flex items-center gap-2 border border-gray-300 text-gray-800 hover:bg-gray-100"
            >
              <Receipt className="h-4 w-4" />
              View Orders
            </Link>
          </div>

          {latestOrder && (
            <div className="mt-8 border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Latest Completed Order
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                    <span>Order #{latestOrder.id}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(latestOrder.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="text-gray-900 font-semibold">
                  ${Number(latestOrder.total || 0).toFixed(2)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {latestOrder.items?.length > 1
                  ? `${latestOrder.items[0]?.sequence?.title || 'Sequence'} + ${latestOrder.items.length - 1} more`
                  : latestOrder.items[0]?.sequence?.title || 'Sequence'}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/orders/${latestOrder.id}`}
                  className="mi-cta-secondary inline-flex items-center gap-2 border border-gray-300 text-gray-800 hover:bg-gray-100"
                >
                  <Receipt className="h-4 w-4" />
                  View Receipt
                </Link>
                <Link
                  href="/downloads"
                  className="mi-cta inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Go to Downloads
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
