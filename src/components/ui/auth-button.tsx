'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { User, ChevronDown } from 'lucide-react'

export function AuthButton() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  // If user is already signed in, don't show the auth button
  if (session) {
    return null
  }

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