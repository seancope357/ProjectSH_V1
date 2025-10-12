'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
// Removed page-level Navigation; global header renders in layout
import { Calendar, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

type OrderItem = {
  sequence_id: string
  price: number
  seller_id: string
  sequence?: {
    id: string
    title: string
    price: number
    thumbnail_url?: string | null
    file_url?: string | null
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
  items: OrderItem[]
}

export default function OrderReceiptPage() {
  const params = useParams<{ orderId: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/orders/${params.orderId}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || `Failed to load order (${res.status})`)
        }
        const data = await res.json()
        setOrder(data.order)
      } catch (e: any) {
        setError(e.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    if (params?.orderId) fetchOrder()
  }, [params?.orderId])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/orders')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Receipt
              </h1>
              {order && (
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span>Order #{order.id}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            {order && (
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            )}
          </div>

          {loading && (
            <div className="mt-6 text-gray-600">Loading order...</div>
          )}
          {error && <div className="mt-6 text-red-600">{error}</div>}

          {order && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {order.items.map(item => (
                  <div
                    key={item.sequence_id}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    {item.sequence?.thumbnail_url && (
                      <Image
                        src={item.sequence.thumbnail_url}
                        alt={item.sequence.title || 'Sequence thumbnail'}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.sequence?.title || 'Sequence'}
                        </h3>
                        <div className="text-gray-900 font-semibold">
                          ${Number(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                      {order.status === 'completed' ? (
                        <p className="mt-1 text-sm text-gray-600">
                          Download available in your downloads.
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-600">
                          This item will be available after payment completes.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Summary
                  </h4>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span>${Number(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-700 mt-1">
                    <span>Tax</span>
                    <span>${Number(order.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-700 mt-1">
                    <span>Platform Fee</span>
                    <span>${Number(order.platform_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t mt-3 pt-3 flex items-center justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${Number(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
                {order.status === 'completed' && (
                  <button
                    onClick={() => router.push('/downloads')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Go to Downloads
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
