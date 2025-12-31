'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Shield } from 'lucide-react'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'

interface AddToCartProps {
  sequenceId: string
  price: number
}

export function AddToCart({ sequenceId, price }: AddToCartProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isInCart, setIsInCart] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Parallel checks
        const [cartRes, purchaseRes] = await Promise.all([
          fetch('/api/cart'),
          fetch(`/api/user/purchases/${sequenceId}`)
        ])

        if (cartRes.ok) {
          const cartData = await cartRes.json()
          setIsInCart(cartData.items?.some((item: any) => item.sequenceId === sequenceId))
        }

        if (purchaseRes.ok) {
          const purchaseData = await purchaseRes.json()
          setIsPurchased(purchaseData.isPurchased)
        }
      } catch (e) {
        console.error('Failed to check status', e)
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [user, sequenceId])

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/auth/signin?next=/sequence/${sequenceId}`)
      return
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceId }),
      })
      if (res.ok) {
        setIsInCart(true)
        router.refresh() // Update any cart counters in nav
      }
    } catch (e) {
      console.error('Failed to add to cart', e)
    }
  }

  if (loading) {
    return <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />
  }

  if (isPurchased) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Already Purchased</span>
        </div>
        <button 
          onClick={() => router.push('/downloads')}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          Download Now
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {isInCart ? (
        <button 
          onClick={() => router.push('/cart')}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          View in Cart
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      )}
      <button 
        onClick={() => {
           if (!isInCart) handleAddToCart().then(() => router.push('/checkout'))
           else router.push('/checkout')
        }}
        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-sm"
      >
        Buy Now
      </button>
    </div>
  )
}
