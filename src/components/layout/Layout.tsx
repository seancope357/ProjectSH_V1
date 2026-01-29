'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
  showSidebar?: boolean
  userType?: 'buyer' | 'seller'
  className?: string
}

export default function Layout({ 
  children, 
  showSidebar = false, 
  userType = 'buyer',
  className = ''
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {showSidebar && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Sidebar userType={userType} />
          </div>
        )}
        
        <main className={`flex-1 overflow-y-auto ${className}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
