'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Library, 
  Upload, 
  BarChart3, 
  Settings, 
  CreditCard,
  Bell,
  Heart,
  Clock
} from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
  userType: 'buyer' | 'seller'
}

export default function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()

  const buyerItems = [
    {
      name: 'My Library',
      href: '/dashboard/library',
      icon: Library,
      description: 'Your purchased sequences'
    },
    {
      name: 'Favorites',
      href: '/dashboard/favorites',
      icon: Heart,
      description: 'Saved sequences'
    },
    {
      name: 'Purchase History',
      href: '/dashboard/orders',
      icon: Clock,
      description: 'Order history & receipts'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      description: 'Account settings'
    }
  ]

  const sellerItems = [
    {
      name: 'Upload Sequence',
      href: '/dashboard/upload',
      icon: Upload,
      description: 'Add new sequences'
    },
    {
      name: 'My Sequences',
      href: '/dashboard/sequences',
      icon: Library,
      description: 'Manage your listings'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Sales & performance'
    },
    {
      name: 'Payouts',
      href: '/dashboard/payouts',
      icon: CreditCard,
      description: 'Revenue & payments'
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      description: 'Updates & alerts'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      description: 'Account settings'
    }
  ]

  const items = userType === 'seller' ? sellerItems : buyerItems

  return (
    <div className="flex flex-col h-full bg-surface border-r border-primary/20">
      {/* Header */}
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <span className="text-background font-bold text-sm">SH</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-white">
              {userType === 'seller' ? 'Seller Tools' : 'Buyer Library'}
            </h2>
            <p className="text-sm text-gray-400">
              {userType === 'seller' ? 'Manage your sequences' : 'Your collection'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 glow-primary'
                  : 'text-gray-400 hover:text-white hover:bg-charcoal-grey hover-glow-primary'
              )}
            >
              <Icon className={clsx(
                'h-5 w-5 transition-colors',
                isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'
              )} />
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  'text-sm font-medium truncate',
                  isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'
                )}>
                  {item.name}
                </p>
                <p className={clsx(
                  'text-xs truncate',
                  isActive ? 'text-primary/70' : 'text-gray-500 group-hover:text-gray-300'
                )}>
                  {item.description}
                </p>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary/20">
        <div className="text-xs text-gray-500 text-center">
          SequenceHub v1.0
        </div>
      </div>
    </div>
  )
}
