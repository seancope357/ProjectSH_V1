'use client'

import { ArrowLeftRight, Store, ShoppingBag, Shield } from 'lucide-react'
import {
  useNavigation,
  UserRole,
} from '@/components/providers/navigation-provider'

interface RoleSwitchProps {
  mobile?: boolean
}

export function RoleSwitch({ mobile = false }: RoleSwitchProps) {
  const { user, currentRole, switchRole } = useNavigation()

  if (!user) return null

  const userRole = user.user_metadata?.role
  const canAccessSeller = userRole === 'SELLER' || userRole === 'ADMIN'
  const canAccessAdmin = userRole === 'ADMIN'

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'BUYER':
        return <ShoppingBag className="h-4 w-4" />
      case 'SELLER':
        return <Store className="h-4 w-4" />
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'BUYER':
        return 'Buyer'
      case 'SELLER':
        return 'Seller'
      case 'ADMIN':
        return 'Admin'
    }
  }

  const availableRoles: UserRole[] = ['BUYER']
  if (canAccessSeller) availableRoles.push('SELLER')
  if (canAccessAdmin) availableRoles.push('ADMIN')

  // Don't show switch if only one role available
  if (availableRoles.length <= 1) return null

  if (mobile) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3">
          Switch Mode
        </div>
        {availableRoles.map(role => (
          <button
            key={role}
            onClick={() => switchRole(role)}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-base font-medium transition-colors rounded-md ${
              currentRole === role
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {getRoleIcon(role)}
            <span>{getRoleLabel(role)} Mode</span>
            {currentRole === role && (
              <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
        {getRoleIcon(currentRole)}
        <span>{getRoleLabel(currentRole)}</span>
        <ArrowLeftRight className="h-4 w-4" />
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[60] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
          Switch Mode
        </div>
        {availableRoles.map(role => (
          <button
            key={role}
            onClick={() => switchRole(role)}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
              currentRole === role
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {getRoleIcon(role)}
            <span>{getRoleLabel(role)} Mode</span>
            {currentRole === role && (
              <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
