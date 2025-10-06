"use client"

import { Navigation } from '@/components/ui/navigation'
import { AlertTriangle, ShoppingCart, Search } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout Canceled</h1>
          <p className="mt-2 text-gray-600">Your payment was not completed. You can resume checkout or keep browsing.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payment not completed</h2>
              <p className="text-gray-600">If this was accidental, you can return to your cart to try again. Your cart items are preserved.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/cart"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4" />
              Return to Cart
            </a>
            <a
              href="/sequences"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-100"
            >
              <Search className="h-4 w-4" />
              Continue Browsing
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}