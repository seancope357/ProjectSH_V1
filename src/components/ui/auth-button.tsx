'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/session-provider'
import { User, ChevronDown, LogOut } from 'lucide-react'

export function AuthButton() {
  const { user, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse px-6 py-3 rounded-lg">
        <div className="h-6 w-32 bg-gray-300 rounded"></div>
      </div>
    )
  }

  // If user is signed in, show user menu
  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <User className="mr-2 h-5 w-5" />
          {user.email?.split('@')[0] || 'User'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute top-full mt-2 w-full min-w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
              <Link
                href="/profile"
                className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <div className="border-t border-gray-100" />
              <button
                onClick={async () => {
                  await signOut()
                  setIsOpen(false)
                }}
                className="w-full text-left px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // If user is not signed in, show sign in/register options
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-blue-600"
      >
        <User className="mr-2 h-5 w-5" />
        Sign In / Register
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            <Link
              href="/auth/signin"
              className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
            <div className="border-t border-gray-100" />
            <Link
              href="/auth/register"
              className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
          </div>
        </>
      )}
    </div>
  )
}