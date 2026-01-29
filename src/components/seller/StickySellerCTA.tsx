'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import { clsx } from 'clsx'

interface StickySellerCTAProps {
  ctaText: string
  href: string
  showAfterScroll?: number
  dismissible?: boolean
  className?: string
}

const STORAGE_KEY = 'sequencehub_sticky_cta_dismissed'
const DISMISS_DURATION_DAYS = 7

const StickySellerCTA: React.FC<StickySellerCTAProps> = ({
  ctaText,
  href,
  showAfterScroll = 800,
  dismissible = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [impressionLogged, setImpressionLogged] = useState(false)

  useEffect(() => {
    // Check if previously dismissed
    const dismissedData = localStorage.getItem(STORAGE_KEY)
    if (dismissedData) {
      const { timestamp } = JSON.parse(dismissedData)
      const dismissedDate = new Date(timestamp)
      const now = new Date()
      const daysSinceDismissal =
        (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceDismissal < DISMISS_DURATION_DAYS) {
        setIsDismissed(true)
        return
      } else {
        // Clear expired dismissal
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const shouldShow = scrollPosition > showAfterScroll

      if (shouldShow && !isVisible && !isDismissed) {
        setIsVisible(true)

        // Log impression (only once)
        if (!impressionLogged) {
          console.log('[Analytics] Sticky CTA Impression', {
            ctaText,
            href,
            scrollPosition,
            timestamp: new Date().toISOString(),
          })
          setImpressionLogged(true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAfterScroll, isVisible, isDismissed, ctaText, href, impressionLogged])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)

    // Store dismissal with timestamp
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        timestamp: new Date().toISOString(),
      })
    )

    console.log('[Analytics] Sticky CTA Dismissed', {
      ctaText,
      href,
      timestamp: new Date().toISOString(),
    })
  }

  const handleClick = () => {
    console.log('[Analytics] Sticky CTA Clicked', {
      ctaText,
      href,
      timestamp: new Date().toISOString(),
    })
  }

  if (isDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={clsx(
            'fixed top-0 left-0 right-0 z-50 shadow-2xl',
            className
          )}
          role="banner"
          aria-label="Seller call to action"
        >
          <div className="relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 opacity-95 backdrop-blur-lg" />

            {/* Accent gradient border */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

            {/* Content */}
            <div className="relative px-4 sm:px-6 py-3 sm:py-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  {/* Left side: Message */}
                  <div className="flex items-center gap-3 flex-1 text-center sm:text-left">
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-purple-500/30">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        Turn Your Sequences Into Income
                      </p>
                      <p className="text-gray-300 text-xs sm:text-sm">
                        Join 1,200+ creators earning on SequenceHUB
                      </p>
                    </div>
                  </div>

                  {/* Right side: CTA + Dismiss */}
                  <div className="flex items-center gap-3">
                    <a
                      href={href}
                      onClick={handleClick}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="md"
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-none shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 whitespace-nowrap"
                      >
                        {ctaText}
                      </Button>
                    </a>

                    {dismissible && (
                      <button
                        onClick={handleDismiss}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StickySellerCTA
