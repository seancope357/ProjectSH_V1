'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

export function Navigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="inline-block">
                  <h1 className="text-2xl font-bold">
                    <span className="text-purple-600 dark:text-purple-400">
                      Sequence
                    </span>
                    <span className="text-blue-700 dark:text-blue-300">
                      HUB
                    </span>
                  </h1>

                  {/* LED String Dots - Alternating Red, White, Blue; extended to span text width */}
                  <div className="flex justify-between w-full -mt-0.5">
                    <div
                      className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-white border border-gray-300 dark:border-gray-600 rounded-full animate-pulse"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"
                      style={{ animationDelay: '450ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-white border border-gray-300 dark:border-gray-600 rounded-full animate-pulse"
                      style={{ animationDelay: '600ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: '750ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"
                      style={{ animationDelay: '900ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-white border border-gray-300 dark:border-gray-600 rounded-full animate-pulse"
                      style={{ animationDelay: '1050ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: '1200ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"
                      style={{ animationDelay: '1350ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-white border border-gray-300 dark:border-gray-600 rounded-full animate-pulse"
                      style={{ animationDelay: '1500ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: '1650ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"
                      style={{ animationDelay: '1800ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-white border border-gray-300 dark:border-gray-600 rounded-full animate-pulse"
                      style={{ animationDelay: '1950ms' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: '2100ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>

            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/sequences"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors"
              >
                Browse Sequences
              </Link>

              <Link
                href="/creator"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors"
              >
                Creator Hub
              </Link>

              <Link
                href="/licensing"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors"
              >
                Licensing
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
            ) : user ? (
              <>
                <Link
                  href="/cart"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>

                {user.user_metadata?.role === 'SELLER' && (
                  <Link
                    href="/seller"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Seller Dashboard
                  </Link>
                )}

                {user.user_metadata?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors">
                    <User className="h-6 w-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[60] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden relative z-[55]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <Link
              href="/sequences"
              className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Sequences
            </Link>

            <Link
              href="/creator"
              className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Creator Hub
            </Link>

            <Link
              href="/licensing"
              className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Licensing
            </Link>

            {user ? (
              <>
                <Link
                  href="/cart"
                  className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>

                {user.user_metadata?.role === 'SELLER' && (
                  <Link
                    href="/seller"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                )}

                {user.user_metadata?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium w-full text-left transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white block px-4 py-2 rounded-md text-base font-medium w-full text-center transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
