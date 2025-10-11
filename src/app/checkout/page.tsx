'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/navigation'
import { CreditCard } from 'lucide-react'

interface CartItem {
  id: string
  sequenceId: string
  sequence: {
    id: string
    title: string
    description: string
    price: number
    previewUrl: string | null
    seller: { username: string }
  }
  quantity: number
  addedAt: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCartItems(data.items || [])
      }
    } catch (e) {
      console.error('Failed to load cart:', e)
    } finally {
      setLoading(false)
    }
  }

  // Payments are currently disabled; no-op handler retained for future enablement
  function payWithStripe() {
    console.warn('Payments are currently disabled')
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.sequence.price * item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
        {loading ? (
          <div className="py-20 text-center text-gray-600">
            Loading your cart...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Your cart is empty.</p>
            <button
              onClick={() => router.push('/search')}
              className="mi-cta bg-blue-600 text-white px-4 py-2 rounded"
            >
              Browse Sequences
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Items</h2>
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="py-3 flex justify-between">
                    <span className="text-gray-800">{item.sequence.title}</span>
                    <span className="text-gray-900">
                      ${item.sequence.price.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4 flex justify-between text-lg">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500">
              Final total (tax/fees) is calculated server-side.
            </p>

            <button
              className="w-full bg-gray-400 cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              disabled
            >
              <CreditCard className="w-5 h-5" />
              Payments are currently disabled
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
