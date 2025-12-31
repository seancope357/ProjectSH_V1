'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
// Removed page-level Navigation; global header renders in layout
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          setError(error.message)
          return
        }
        if (user) {
          const callbackUrl = searchParams.get('callbackUrl') || '/'
          const role = user.user_metadata?.role
          // Force redirect to seller dashboard if user is a seller or admin
          const target =
            role === 'SELLER' || role === 'ADMIN'
              ? '/seller/dashboard'
              : callbackUrl
          router.replace(target)
        } else {
          // If user is not present after redirect, guide to sign in
          setError(
            'Authentication did not complete. Please try signing in again.'
          )
        }
      } catch (e) {
        setError('Unexpected error completing authentication.')
      }
    }
    completeAuth()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mi-card w-full max-w-md">
          <h1 className="text-xl font-semibold">Completing sign in…</h1>
          <p className="mt-2 text-sm text-gray-600">
            If you are not redirected automatically, this page will guide you.
          </p>
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}
