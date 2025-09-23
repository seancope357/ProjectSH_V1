'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">SequenceHUB</h1>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/sequences"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Browse Sequences
              </Link>
              <Link
                href="/compatibility"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Compatibility Check
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : session ? (
              <>
                <Link
                  href="/cart"
                  className="text-gray-700 hover:text-blue-600 p-2"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>
                
                {session.user.role === 'SELLER' && (
                  <Link
                    href="/seller"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Seller Dashboard
                  </Link>
                )}
                
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-blue-600 p-2">
                    <User className="h-6 w-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              href="/sequences"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Sequences
            </Link>
            <Link
              href="/compatibility"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Compatibility Check
            </Link>
            
            {session ? (
              <>
                <Link
                  href="/cart"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                
                {session.user.role === 'SELLER' && (
                  <Link
                    href="/seller"
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                )}
                
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  signIn('google')
                  setIsMenuOpen(false)
                }}
                className="bg-blue-600 text-white block px-3 py-2 text-base font-medium w-full text-left rounded-md hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}