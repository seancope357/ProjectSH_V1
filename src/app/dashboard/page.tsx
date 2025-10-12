'use client'

import Link from 'next/link'
import { VerticalToolbar } from '@/components/ui/vertical-toolbar'
import { useAuth } from '@/components/providers/session-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowRight, Star, Shield, Search } from 'lucide-react'

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Guard: require authentication for dashboard
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.replace('/auth/signin?callbackUrl=%2Fdashboard')
    }
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Global header is rendered by RootLayout; add left toolbar */}
      <div className="flex">
        <VerticalToolbar />

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome card */}
            <div className="mi-card lg:col-span-2">
              <h1 className="text-2xl font-semibold">
                Welcome to your dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Explore sequences, track orders, and manage your profile — all
                in one place.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/sequences"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" /> Browse Sequences
                </Link>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-5 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  View Orders <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Highlights */}
            <div className="mi-card">
              <h2 className="text-lg font-semibold">Highlights</h2>
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
          </div>

          {/* Resources and links */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mi-card">
              <h3 className="text-lg font-semibold">Buyer Resources</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/help"
                    className="text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/licensing"
                    className="text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    Licensing Guide
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mi-card">
              <h3 className="text-lg font-semibold">Account Shortcuts</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/profile"
                    className="text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    Manage Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    View Order History
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
