'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
// Removed page-level Navigation; global header renders in layout
import { Eye, EyeOff, Mail, Lock, AlertCircle, Github } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function SignInPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams.get('error')

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      const user = session?.user

      if (user) {
        // If we have a user on the client but we're on the signin page, 
        // it's likely the middleware didn't see the session cookies.
        // We'll refresh the session to ensure cookies are synced.
        await supabase.auth.refreshSession()
        
        // If we have a specific callbackUrl (that isn't root or default dashboard), respect it
        if (callbackUrl && callbackUrl !== '/' && callbackUrl !== '/dashboard') {
          router.replace(callbackUrl)
          return
        }

        // Otherwise, default redirects based on role
        const role = user.user_metadata?.role
        if (role === 'SELLER' || role === 'ADMIN') {
          router.replace('/seller/dashboard')
        } else {
          router.replace('/dashboard')
        }
      }
    }
    checkUser()

    // Handle OAuth errors
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthSignin':
          setError('Error occurred during OAuth sign in')
          break
        case 'OAuthCallback':
          setError('Error occurred during OAuth callback')
          break
        case 'OAuthCreateAccount':
          setError('Could not create OAuth account')
          break
        case 'EmailCreateAccount':
          setError('Could not create email account')
          break
        case 'Callback':
          setError('Error occurred during callback')
          break
        case 'OAuthAccountNotLinked':
          setError('OAuth account is not linked to any user')
          break
        case 'EmailSignin':
          setError('Check your email for the sign in link')
          break
        case 'CredentialsSignin':
          setError('Invalid email or password')
          break
        case 'SessionRequired':
          setError('Please sign in to access this page')
          break
        default:
          setError('An error occurred during sign in')
      }
    }
  }, [router, callbackUrl, errorParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // If we have a specific callbackUrl (that isn't root or default dashboard), respect it
        if (callbackUrl && callbackUrl !== '/' && callbackUrl !== '/dashboard') {
          router.replace(callbackUrl)
          return
        }

        // Otherwise, default redirects based on role
        const role = data.user.user_metadata?.role
        if (role === 'SELLER' || role === 'ADMIN') {
          router.replace('/seller/dashboard')
        } else {
          router.replace('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'github') => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        },
      })

      if (error) {
        setError(`Error signing in with ${provider}`)
        setLoading(false)
      }
    } catch (error) {
      setError(`Error signing in with ${provider}`)
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-700">SequenceHUB</h1>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link
                href="/auth/register"
                className="font-medium text-blue-700 hover:text-blue-800"
              >
                create a new account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* OAuth Button */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
                className="mi-cta-secondary w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="w-5 h-5 mr-2" />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-700 focus:ring-blue-300 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-blue-700 hover:text-blue-800"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mi-cta group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="font-medium text-blue-700 hover:text-blue-800"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPageContent />
    </Suspense>
  )
}
