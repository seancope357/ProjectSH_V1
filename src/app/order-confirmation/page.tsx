'use client'

import React from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { CheckCircle, Download, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function OrderConfirmationPage() {
  // Mock order data - replace with actual order details
  const orderDetails = {
    orderNumber: 'SH-2024-001234',
    date: new Date().toLocaleDateString(),
    email: 'user@example.com',
    total: 79.97,
    items: [
      {
        id: '1',
        title: 'Christmas Magic Spectacular',
        price: 29.99,
        seller: 'LightMaster Pro',
        downloadUrl: '/downloads/christmas-magic-spectacular.zip'
      },
      {
        id: '2',
        title: 'Halloween Haunted House',
        price: 24.99,
        seller: 'Holiday Creator',
        downloadUrl: '/downloads/halloween-haunted-house.zip',
        quantity: 2
      }
    ]
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-white mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Thank you for your purchase
            </p>
            <p className="text-gray-400">
              Order #{orderDetails.orderNumber} • {orderDetails.date}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-surface rounded-lg p-8 border border-white/10 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Download Instructions */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-primary" />
                  Your Downloads
                </h2>
                <p className="text-gray-300 mb-4">
                  Your xLights sequences are ready for download. Click the download buttons below to get your files.
                </p>
                <div className="space-y-3">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-white/10">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <p className="text-gray-400 text-sm">by {item.seller}</p>
                      </div>
                      <Button size="sm" className="ml-4">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Confirmation */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-secondary" />
                  Email Confirmation
                </h2>
                <p className="text-gray-300 mb-4">
                  A confirmation email with download links has been sent to:
                </p>
                <div className="p-3 bg-background rounded-lg border border-white/10">
                  <p className="text-accent font-medium">{orderDetails.email}</p>
                </div>
                <p className="text-gray-400 text-sm mt-3">
                  Don&apos;t see the email? Check your spam folder or contact support.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <span className="text-white">{item.title}</span>
                      {item.quantity && item.quantity > 1 && (
                        <span className="text-gray-400 ml-2">x{item.quantity}</span>
                      )}
                    </div>
                    <span className="text-accent font-medium">
                      ${((item.quantity || 1) * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-accent">${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-surface rounded-lg p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">What&apos;s Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Download Files</h3>
                <p className="text-gray-400 text-sm">
                  Download your xLights sequence files and save them to your computer.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-secondary font-bold">xL</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Import to xLights</h3>
                <p className="text-gray-400 text-sm">
                  Open xLights and import your new sequences to start using them.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-accent">★</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Leave a Review</h3>
                <p className="text-gray-400 text-sm">
                  Help other creators by leaving a review of your purchased sequences.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/library">
              <Button size="lg" className="w-full sm:w-auto">
                View My Library
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse More Sequences
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-center mt-12 p-6 bg-surface/50 rounded-lg border border-white/5">
            <p className="text-gray-400 mb-2">Need help with your order?</p>
            <Link href="/support" className="text-primary hover:text-primary/80 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}