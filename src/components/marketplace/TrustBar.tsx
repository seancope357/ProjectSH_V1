'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import StatsCounter from '@/components/ui/StatsCounter'

interface TrustStat {
  label: string
  value: string | number
  icon: LucideIcon
  prefix?: string
  suffix?: string
  decimals?: number
}

interface TrustBarProps {
  stats: TrustStat[]
  className?: string
  variant?: 'glassmorphism' | 'solid' | 'minimal'
}

/**
 * TrustBar Component
 *
 * DUAL-SIDED IMPACT:
 * - SELLERS: Demonstrates marketplace credibility and potential reach (active buyers, total sales volume)
 * - CUSTOMERS: Builds trust through social proof (large user base, total downloads, ratings)
 *
 * PSYCHOLOGICAL TACTICS:
 * - Social Proof: Large numbers = trustworthy platform
 * - FOMO: Active marketplace with thousands of transactions
 * - Authority: Established platform with proven track record
 *
 * Display marketplace statistics in a responsive grid with animated counters.
 * Glassmorphism design creates premium feel while maintaining brand aesthetic.
 */
const TrustBar: React.FC<TrustBarProps> = ({
  stats,
  className = '',
  variant = 'glassmorphism',
}) => {
  // Variant styling
  const variantStyles = {
    glassmorphism: {
      container:
        'bg-surface/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40',
      stat: 'bg-surface/30 backdrop-blur-sm border border-white/5 hover:bg-surface/50 hover:border-white/10',
    },
    solid: {
      container: 'bg-surface border border-white/10 shadow-xl',
      stat: 'bg-background/50 border border-white/5 hover:bg-background/70 hover:border-white/10',
    },
    minimal: {
      container: 'bg-transparent',
      stat: 'bg-surface/20 border border-white/5 hover:bg-surface/40 hover:border-white/10',
    },
  }[variant]

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  }

  // Individual stat animation variants
  const statVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className={clsx(
        'rounded-3xl p-6 sm:p-8 md:p-10',
        variantStyles.container,
        className
      )}
      style={{
        boxShadow:
          variant === 'glassmorphism'
            ? '0 0 0 1px rgba(255, 255, 255, 0.08), 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : undefined,
      }}
    >
      {/* Stats Grid */}
      <div
        className={clsx(
          'grid gap-4 sm:gap-6',
          // Responsive grid: 2 columns on mobile, 4 on desktop
          'grid-cols-2 md:grid-cols-4',
          // If fewer than 4 stats, center them
          stats.length < 4 && 'md:justify-center',
          stats.length === 3 && 'md:grid-cols-3',
          stats.length === 2 && 'md:grid-cols-2',
          stats.length === 1 && 'md:grid-cols-1'
        )}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={`${stat.label}-${index}`}
            variants={statVariants}
            className={clsx(
              'relative group rounded-2xl p-5 sm:p-6',
              'transition-all duration-300 ease-out',
              variantStyles.stat
            )}
          >
            {/* Gradient Border Glow Effect on Hover */}
            <div
              className={clsx(
                'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100',
                'transition-opacity duration-300 pointer-events-none'
              )}
              style={{
                background:
                  'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(184, 79, 255, 0.2), rgba(255, 213, 79, 0.2))',
                padding: '1px',
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            {/* Icon with Gradient Background */}
            <div className="flex items-center justify-center mb-4">
              <div
                className={clsx(
                  'p-3 rounded-xl',
                  'bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20',
                  'border border-white/10',
                  'transition-transform duration-300 group-hover:scale-110'
                )}
                style={{
                  boxShadow: '0 0 20px rgba(92, 154, 255, 0.3)',
                }}
              >
                <stat.icon
                  size={24}
                  className="text-primary group-hover:text-secondary transition-colors duration-300"
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* Animated Counter */}
            {typeof stat.value === 'number' ? (
              <StatsCounter
                targetValue={stat.value}
                label={stat.label}
                duration={2}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals || 0}
              />
            ) : (
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">
                  <span
                    className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                    style={{
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-text-secondary font-medium">
                  {stat.label}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default TrustBar
