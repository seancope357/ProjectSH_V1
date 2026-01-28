'use client'

import Link from 'next/link'
import { useNavigation } from '@/components/providers/navigation-provider'
import {
  Home,
  Search,
  Layers,
  ShoppingCart,
  Package,
  HelpCircle,
  FileCheck,
  User,
} from 'lucide-react'

interface ToolbarItem {
  href: string
  label: string
  icon: React.ReactNode
}

export function VerticalToolbar() {
  const { currentRole } = useNavigation()

  const sellerItems: ToolbarItem[] = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    {
      href: '/seller/sequences',
      label: 'My Sequences',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      href: '/seller/upload',
      label: 'Upload Sequence',
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      href: '/seller/orders',
      label: 'Orders',
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: '/seller/payouts',
      label: 'Payouts',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      href: '/seller/onboarding',
      label: 'Onboarding',
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ]

  const buyerItems: ToolbarItem[] = [
    { href: '/dashboard', label: 'Home', icon: <Home className="h-5 w-5" /> },
    {
      href: '/sequences',
      label: 'Browse Sequences',
      icon: <Search className="h-5 w-5" />,
    },
    {
      href: '/categories',
      label: 'Categories',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      href: '/orders',
      label: 'My Orders',
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: '/licensing',
      label: 'Licensing',
      icon: <FileCheck className="h-5 w-5" />,
    },
    { href: '/help', label: 'Help', icon: <HelpCircle className="h-5 w-5" /> },
  ]

  const items = currentRole === 'SELLER' ? sellerItems : buyerItems

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hidden lg:block">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {currentRole === 'SELLER' ? 'Seller' : 'Buyer'} Navigation
        </h2>
      </div>
      <nav className="px-2 space-y-1">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
