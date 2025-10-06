"use client"
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'pending' | 'failed' | 'unknown'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) {
        setStatus('unknown')
        return
      }
      try {
        const res = await fetch(`/api/checkout?session_id=${sessionId}`)
        if (!res.ok) throw new Error('Failed to retrieve session')
        const data = await res.json()
        // Stripe returns payment_status: 'paid' when completed
        const paymentStatus = data.status
        if (paymentStatus === 'paid') setStatus('succeeded')
        else if (paymentStatus === 'unpaid') setStatus('pending')
        else setStatus('unknown')
      } catch (e: any) {
        setError(e.message || 'Unknown error')
        setStatus('failed')
      }
    }
    fetchSession()
  }, [sessionId])

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-2">Payment Status</h1>
      {status === 'loading' && (
        <p className="text-gray-600">Checking your payment...</p>
      )}
      {status === 'succeeded' && (
        <div className="space-y-4">
          <p className="text-green-600">Payment completed. Your downloads are ready.</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              View Orders
            </button>
            <button
              onClick={() => router.push('/sequences')}
              className="border border-gray-300 px-4 py-2 rounded"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
      {status === 'pending' && (
        <p className="text-yellow-600">Payment pending. Please wait or check your email.</p>
      )}
      {status === 'unknown' && (
        <p className="text-gray-600">Unable to confirm payment. You can check your orders.</p>
      )}
      {status === 'failed' && (
        <div>
          <p className="text-red-600">Failed to verify payment{error ? `: ${error}` : ''}.</p>
          <button
            onClick={() => router.push('/cart')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Return to Cart
          </button>
        </div>
      )}
    </div>
  )
}