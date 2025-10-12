'use client'

import { useState } from 'react'
import Link from 'next/link'
// Removed page-level Navigation; global header renders in layout

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setEmailSent(true)
        setMessage(
          'Password reset instructions have been sent to your email address.'
        )
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An error occurred while sending the reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {!emailSent ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <p className="mt-2 text-sm text-gray-500">
                  We'll send password reset instructions to this email address.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              {message && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Email sent!
                      </p>
                      <p className="mt-1 text-sm text-green-700">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Check your email for password reset instructions. The link
                  will expire in 1 hour.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setEmailSent(false)
                      setMessage('')
                      setError('')
                      setEmail('')
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Send to a different email
                  </button>

                  <div>
                    <Link
                      href="/auth/signin"
                      className="text-sm text-gray-600 hover:text-gray-500"
                    >
                      Back to sign in
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
