'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigation } from '@/components/providers/navigation-provider'
import { RoleSwitch } from './role-switch'

export function PrimaryNav() {
  const { user, currentRole, loading } = useNavigation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
  }

  // Role-specific navigation items
  const getBuyerNavItems = () => [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/sequences', label: 'Browse Sequences' },
    { href: '/categories', label: 'Categories' },
    { href: '/licensing', label: 'Licensing' },
    { href: '/help', label: 'Help' },
  ]

  const getSellerNavItems = () => [
    { href: '/seller', label: 'Dashboard' },
    { href: '/seller/upload', label: 'Upload' },
    { href: '/seller/sequences', label: 'My Sequences' },
    { href: '/seller/orders', label: 'Orders' },
    { href: '/seller/payouts', label: 'Payouts' },
  ]

  const getAdminNavItems = () => [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/sequences', label: 'Sequences' },
    { href: '/admin/reports', label: 'Reports' },
  ]

  const getNavItems = () => {
    switch (currentRole) {
      case 'SELLER':
        return getSellerNavItems()
      case 'ADMIN':
        return getAdminNavItems()
      default:
        return getBuyerNavItems()
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors relative z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href={currentRole === 'SELLER' ? '/seller' : '/dashboard'}
              className="flex-shrink-0"
            >
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

                  {/* LED String Dots */}
                  <div className="flex justify-between w-full -mt-0.5">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          i % 3 === 0
                            ? 'bg-red-600'
                            : i % 3 === 1
                              ? 'bg-white border border-gray-300 dark:border-gray-600'
                              : 'bg-blue-600'
                        }`}
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {loading ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
            ) : user ? (
              <>
                {/* Role Switch */}
                <RoleSwitch />

                {/* Cart (Buyer only) */}
                {currentRole === 'BUYER' && (
                  <Link
                    href="/cart"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                    <User className="h-5 w-5" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[60] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Profile
                    </Link>
                    {currentRole === 'BUYER' && (
                      <>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/downloads"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Downloads
                        </Link>
                      </>
                    )}
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
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
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {user && (
              <>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />

                {/* Mobile Role Switch */}
                <div className="px-3 py-2">
                  <RoleSwitch mobile />
                </div>

                {currentRole === 'BUYER' && (
                  <Link
                    href="/cart"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>

                {currentRole === 'BUYER' && (
                  <>
                    <Link
                      href="/orders"
                      className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/downloads"
                      className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Downloads
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium w-full text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  Sign Out
                </button>
              </>
            )}

            {!user && (
              <Link
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white block px-4 py-2 rounded-md text-base font-medium w-full text-center transition-colors mx-3 mt-2"
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
