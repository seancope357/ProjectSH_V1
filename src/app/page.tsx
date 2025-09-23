'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/ui/navigation'
import { Search, Zap, Shield, Users, ArrowRight, Star } from 'lucide-react'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Premium LED Sequences
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover thousands of high-quality LED sequences created by talented artists. 
              Find the perfect match for your display with our compatibility scoring system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sequences"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Browse Sequences
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/compatibility"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-blue-600"
              >
                Check Compatibility
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SequenceHUB?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find, purchase, and use LED sequences that work perfectly with your setup.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find sequences by resolution, style, theme, and compatibility with your hardware.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-gray-600">
                Purchase and download sequences immediately. No waiting, no hassle.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                All sequences are reviewed and tested to ensure the highest quality standards.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creator Community</h3>
              <p className="text-gray-600">
                Join a thriving community of LED artists and sequence creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-xl text-gray-600">Premium Sequences</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-xl text-gray-600">Talented Creators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">50,000+</div>
              <div className="text-xl text-gray-600">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Light Up Your Display?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {session 
              ? "Start browsing our collection of premium LED sequences."
              : "Join thousands of creators and customers in our marketplace."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/sequences"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Sequences
              </Link>
            ) : (
              <>
                <Link
                  href="/api/auth/signin"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/sequences"
                  className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors border-2 border-white"
                >
                  Browse as Guest
                </Link>
              </>
            )}
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
                <li><Link href="/compatibility" className="hover:text-white">Compatibility Check</Link></li>
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
