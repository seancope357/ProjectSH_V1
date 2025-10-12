'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN'

interface NavigationState {
  currentRole: UserRole
  user: User | null
  loading: boolean
  lastBuyerPath: string
  lastSellerPath: string
}

interface NavigationContextType extends NavigationState {
  switchRole: (role: UserRole, returnTo?: string) => Promise<void>
  updateLastPath: (role: UserRole, path: string) => void
  isSellerRoute: (path: string) => boolean
  isBuyerRoute: (path: string) => boolean
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

interface NavigationProviderProps {
  children: React.ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, setState] = useState<NavigationState>({
    currentRole: 'BUYER',
    user: null,
    loading: true,
    lastBuyerPath: '/',
    lastSellerPath: '/seller/dashboard',
  })

  const router = useRouter()
  const pathname = usePathname()

  // Helper functions
  const isSellerRoute = (path: string): boolean => {
    return path.startsWith('/seller') || path.startsWith('/admin')
  }

  const isBuyerRoute = (path: string): boolean => {
    return !isSellerRoute(path) && !path.startsWith('/auth')
  }

  // Determine role from current path
  const getRoleFromPath = (path: string): UserRole => {
    if (path.startsWith('/admin')) return 'ADMIN'
    if (path.startsWith('/seller')) return 'SELLER'
    return 'BUYER'
  }

  // Load preferences from localStorage
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('nav-preferences')
      if (saved) {
        const prefs = JSON.parse(saved)
        return {
          lastBuyerPath: prefs.lastBuyerPath || '/',
          lastSellerPath: prefs.lastSellerPath || '/seller',
        }
      }
    } catch (error) {
      console.warn('Failed to load navigation preferences:', error)
    }
    return {
      lastBuyerPath: '/',
      lastSellerPath: '/seller',
    }
  }

  // Save preferences to localStorage
  const savePreferences = (prefs: {
    lastBuyerPath: string
    lastSellerPath: string
  }) => {
    try {
      localStorage.setItem('nav-preferences', JSON.stringify(prefs))
    } catch (error) {
      console.warn('Failed to save navigation preferences:', error)
    }
  }

  // Initialize navigation state
  useEffect(() => {
    const initializeNavigation = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const prefs = loadPreferences()
      const currentRole = getRoleFromPath(pathname)

      setState(prev => ({
        ...prev,
        user,
        currentRole,
        loading: false,
        ...prefs,
      }))
    }

    initializeNavigation()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
      }))
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  // Update current role when path changes
  useEffect(() => {
    const newRole = getRoleFromPath(pathname)
    if (newRole !== state.currentRole) {
      setState(prev => ({ ...prev, currentRole: newRole }))
    }
  }, [pathname, state.currentRole])

  // Switch role function
  const switchRole = async (role: UserRole, returnTo?: string) => {
    if (!state.user) {
      router.push('/auth/signin')
      return
    }

    // Check if user has permission for the role
    const userRole = state.user.user_metadata?.role
    if (role === 'SELLER' && userRole !== 'SELLER' && userRole !== 'ADMIN') {
      router.push('/seller/onboarding')
      return
    }
    if (role === 'ADMIN' && userRole !== 'ADMIN') {
      return // Silently ignore unauthorized admin access
    }

    // Determine target path
    let targetPath = returnTo
    if (!targetPath) {
      switch (role) {
        case 'BUYER':
          targetPath = state.lastBuyerPath
          break
        case 'SELLER':
          targetPath = state.lastSellerPath
          break
        case 'ADMIN':
          targetPath = '/admin'
          break
      }
    }

    // Update current path as last path for current role
    updateLastPath(state.currentRole, pathname)

    // Navigate to target
    router.push(targetPath)
  }

  // Update last path for a role
  const updateLastPath = (role: UserRole, path: string) => {
    const newPrefs = {
      lastBuyerPath: role === 'BUYER' ? path : state.lastBuyerPath,
      lastSellerPath: role === 'SELLER' ? path : state.lastSellerPath,
    }

    setState(prev => ({ ...prev, ...newPrefs }))
    savePreferences(newPrefs)
  }

  const contextValue: NavigationContextType = {
    ...state,
    switchRole,
    updateLastPath,
    isSellerRoute,
    isBuyerRoute,
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}
