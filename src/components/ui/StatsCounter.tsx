'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'

interface StatsCounterProps {
  targetValue: number
  label: string
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

/**
 * StatsCounter Component
 *
 * DUAL-SIDED IMPACT:
 * - SELLERS: Builds credibility by showcasing marketplace scale (total sales, active sellers)
 * - CUSTOMERS: Creates trust through social proof (large numbers = established platform)
 *
 * Animated number counter with scroll trigger for maximum visual impact.
 * Uses Intersection Observer to trigger animation when scrolled into view.
 */
const StatsCounter: React.FC<StatsCounterProps> = ({
  targetValue,
  label,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  // Motion value for the counter
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })

  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
      motionValue.set(targetValue)
    }
  }, [isInView, hasAnimated, motionValue, targetValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest.toFixed(decimals))
    })

    return () => unsubscribe()
  }, [springValue, decimals])

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center"
      >
        {/* Animated Number with Gradient */}
        <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
          <span
            className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {prefix}
            {displayValue}
            {suffix}
          </span>
        </div>

        {/* Label */}
        <p className="text-sm sm:text-base md:text-lg text-text-secondary font-medium tracking-wide">
          {label}
        </p>
      </motion.div>
    </div>
  )
}

export default StatsCounter
