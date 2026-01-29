'use client'

import React, { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  title: string
  price: number
  image: string
  seller: string
  quantity: number
}

export default function CartPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Mock cart data - replace with actual cart state management
  useEffect(() => {
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        title: 'Christmas Magic Spectacular',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1545558014-8692c3eb5c50?q=80&w=400&auto=format&fit=crop',
        seller: 'LightMaster Pro',
        quantity: 1
      },
      {
        id: '2',
        title: 'Halloween Haunted House',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1509557965043-6b9f3d2b3e5e?q=80&w=400&auto=format&fit=crop',
        seller: 'Holiday Creator',
        quantity: 2
      }
    ]
    setCartItems(mockCartItems)
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/cart')
      return
    }
    router.push('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-background py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <h1 className="text-3xl font-heading font-bold text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 text-lg mb-8">
              Discover amazing xLights sequences from talented creators worldwide.
            </p>
            <Link href="/browse">
              <Button size="lg">Browse Sequences</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-heading font-bold text-white mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-surface rounded-lg p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="text-gray-400">by {item.seller}</p>
                      <p className="text-accent font-bold">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-surface border border-white/20 hover:border-primary/50 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-surface border border-white/20 hover:border-primary/50 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-surface rounded-lg p-6 border border-white/10 h-fit">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mb-4"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>

              <Link href="/browse">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}