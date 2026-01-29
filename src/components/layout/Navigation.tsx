'use client'

import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, Sparkles, LogOut } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, supabase } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-b from-primary to-secondary flex items-center justify-center">
              <span className="font-bold text-xs text-background">SH</span>
            </div>
            <Link href="/" className="flex items-center">
              <span className="font-heading font-extrabold tracking-tight text-white text-xl">
                Sequence<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">
              Browse
            </Link>
            <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link 
              href="/studio" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 rounded-full border border-primary/20 hover:border-primary/40"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">AI Studio</span>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 max-w-xs">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="w-full rounded-full bg-surface/60 border border-white/10 px-4 pl-14 pr-4 h-11 text-sm text-white placeholder-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Search sequences, creators, or props..."
                type="text"
              />
            </div>
            <Button size="md">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Right - Cart, User Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile search toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-full text-gray-400 hover:text-white hover:bg-surface/60 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-surface/60 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* Cart badge - replace with actual count */}
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center">
                0
              </span>
            </Link>

            {/* User Actions */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-surface/60 transition-colors"
                  aria-label="User profile"
                >
                  <User className="h-5 w-5" />
                </Link>
                <Button 
                  variant="outline" 
                  size="md"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="md">
                  <User className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Sign In</span>
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 rounded-full text-gray-400 hover:text-white hover:bg-surface/60 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-white/5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="w-full rounded-full bg-surface/60 border border-white/10 px-4 pl-14 pr-4 h-11 text-sm text-white placeholder-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Search sequences..."
                  type="text"
                />
              </div>
              <Button size="md">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
