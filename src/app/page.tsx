'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/session-provider'
import { Navigation } from '@/components/ui/navigation'
import { AuthButton } from '@/components/ui/auth-button'
import { Search, Zap, Shield, Users, ArrowRight } from 'lucide-react'
import { useFeatureFlags } from '@/components/providers/feature-flags'

export default function HomePage() {
  const { user } = useAuth()
  const { enableAnimations, reducedMotion } = useFeatureFlags()
  const pulseClass = (!enableAnimations || reducedMotion) ? '' : 'animate-pulse'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900" aria-label="Hero Banner">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20"></div>

        {/* Animated background (feature flag + reduced motion) */}
        {enableAnimations && !reducedMotion && (
          <>
            <div className="hero-ambient" aria-hidden="true">
              <span className="hero-orb a" />
              <span className="hero-orb b" />
              <span className="hero-orb c" />
            </div>
            <div className="hero-waves" aria-hidden="true">
              <span className="hero-beam a" />
              <span className="hero-beam b" />
              <span className="hero-beam c" />
            </div>
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-40">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Your One-Stop Marketplace For Premium xLights Sequences
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
              A premier marketplace where talented xLights sequence creators showcase and sell their premium sequences. 
              Connect with skilled vendors and discover the perfect sequences for your holiday light displays.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sequences"
                className="mi-cta bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Browse Sequences
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sequences Section */}
      <section className="py-20 bg-gray-50" aria-label="Featured Sequences">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Sequences
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and highest-rated LED sequences from talented creators.
            </p>
          </header>
          
            <div className="grid md:grid-cols-3 gap-8">
              {/* Featured Sequence 1 */}
            <div className="mi-card bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium">Preview</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Neon Dreams</h3>
                <p className="text-gray-600 mb-4">A vibrant cyberpunk-inspired sequence with flowing neon effects perfect for modern displays.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">$12.99</span>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      ★★★★★
                    </div>
                    <span className="text-gray-500 text-sm ml-1">(127)</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">1920x1080</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">60fps</span>
                </div>
                <Link
                  href="/sequence/1"
                  className="mi-cta w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Featured Sequence 2 */}
            <div className="mi-card bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-teal-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium">Preview</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ocean Waves</h3>
                <p className="text-gray-600 mb-4">Calming blue waves that flow across your display with realistic water movement patterns.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">$9.99</span>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      ★★★★★
                    </div>
                    <span className="text-gray-500 text-sm ml-1">(89)</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">2560x1440</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">30fps</span>
                </div>
                <Link
                  href="/sequence/2"
                  className="mi-cta w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Featured Sequence 3 */}
            <div className="mi-card bg-white/90 backdrop-blur-sm rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium">Preview</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fire Storm</h3>
                <p className="text-gray-600 mb-4">Intense fire effects with realistic flames and ember particles for dramatic displays.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">$15.99</span>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      ★★★★☆
                    </div>
                    <span className="text-gray-500 text-sm ml-1">(203)</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">3840x2160</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">60fps</span>
                </div>
                <Link
                  href="/sequence/3"
                  className="mi-cta w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/sequences"
              className="mi-cta bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              View All Sequences
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" aria-label="Platform Features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SequenceHUB?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find, purchase, and use LED sequences that work perfectly with your setup.
            </p>
          </header>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search aria-hidden="true" className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find sequences by resolution, style, theme, and compatibility with your hardware.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap aria-hidden="true" className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-gray-600">
                Purchase and download sequences immediately. No waiting, no hassle.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield aria-hidden="true" className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">High Quality Content</h3>
              <p className="text-gray-600">
                All sequences in our marketplace are carefully curated and tested to ensure the highest quality lighting effects for your LED displays.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users aria-hidden="true" className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creator Community</h3>
              <p className="text-gray-600">
                Join a thriving community of LED artists and sequence creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SequenceHUB</h3>
              <p className="text-gray-400">
                The premier marketplace for LED sequences and digital art.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/sequences" className="hover:text-white">Browse Sequences</Link></li>
                <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Creators</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/seller/register" className="hover:text-white">Become a Seller</Link></li>
                <li><Link href="/seller" className="hover:text-white">Seller Dashboard</Link></li>
                <li><Link href="/guidelines" className="hover:text-white">Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SequenceHUB. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
