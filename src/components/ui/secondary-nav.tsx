'use client'

import Link from 'next/link'
import { ChevronRight, Home, Settings, LogOut, User, Bell, ShoppingBag } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useNavigation } from '@/components/providers/navigation-provider'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function SecondaryNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentRole, user, switchRole } = useNavigation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Home/Dashboard
    if (currentRole === 'SELLER') {
      breadcrumbs.push({ label: 'Seller Dashboard', href: '/seller/dashboard' })
    } else if (currentRole === 'ADMIN') {
      breadcrumbs.push({ label: 'Admin Dashboard', href: '/admin' })
    } else {
      breadcrumbs.push({ label: 'Home', href: '/' })
    }

    // Build breadcrumbs from path segments
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Skip if it's the last segment (current page)
      if (index === segments.length - 1) {
        breadcrumbs.push({ label: formatSegmentLabel(segment) })
        return
      }

      // Add intermediate segments
      breadcrumbs.push({
        label: formatSegmentLabel(segment),
        href: currentPath,
      })
    })

    return breadcrumbs
  }

  // Format segment labels for better readability
  const formatSegmentLabel = (segment: string): string => {
    // Handle specific routes
    const routeLabels: Record<string, string> = {
      sequences: 'Sequences',
      sequence: 'Sequence Details',
      seller: 'Seller',
      admin: 'Admin',
      upload: 'Upload Sequence',
      onboarding: 'Seller Onboarding',
      orders: 'Orders',
      payouts: 'Payouts',
      cart: 'Shopping Cart',
      checkout: 'Checkout',
      downloads: 'Downloads',
      profile: 'Profile',
      categories: 'Categories',
      search: 'Search Results',
      help: 'Help Center',
      'creator-guide': 'Creator Guide',
      licensing: 'Licensing',
      guidelines: 'Guidelines',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      contact: 'Contact Us',
    }

    if (routeLabels[segment]) {
      return routeLabels[segment]
    }

    // Handle dynamic routes (IDs, etc.)
    if (segment.match(/^[a-f0-9-]{36}$/)) {
      return 'Details'
    }

    // Capitalize and format generic segments
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const breadcrumbs = generateBreadcrumbs()

  // Only show full header for Seller/Admin roles
  // For Buyer, we might just want breadcrumbs or nothing (if PrimaryNav handles it)
  // But user specifically asked for Seller Dashboard navigation
  if (currentRole !== 'SELLER' && currentRole !== 'ADMIN') {
     // Don't show breadcrumbs on home pages
    if (pathname === '/') {
      return null
    }
    // Return just breadcrumbs for non-seller
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center text-sm text-gray-500 dark:text-gray-400">
                {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center">
                        {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.label}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
  }

  // Seller/Admin Dashboard Header
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-40 sticky top-0">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Breadcrumbs / Title */}
        <div className="flex items-center">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
             {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
            {/* Notifications (Mock) */}
            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-medium">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                        {user?.email?.split('@')[0]}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Signed in as</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setIsProfileOpen(false)
                                    switchRole('BUYER')
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Switch to Buyer
                            </button>
                            <Link
                                href="/profile"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <User className="w-4 h-4" />
                                My Profile
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  )
}
