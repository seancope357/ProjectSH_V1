'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useNavigation } from '@/components/providers/navigation-provider'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function SecondaryNav() {
  const pathname = usePathname()
  const { currentRole } = useNavigation()

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Home/Dashboard
    if (currentRole === 'SELLER') {
      breadcrumbs.push({ label: 'Seller Dashboard', href: '/seller' })
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

  // Don't show breadcrumbs on home pages
  if (pathname === '/' || pathname === '/seller' || pathname === '/admin') {
    return null
  }

  return (
    <nav className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3">
          <Home className="h-4 w-4 text-gray-400 dark:text-gray-500" />

          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              )}

              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
