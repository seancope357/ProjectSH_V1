'use client'

import React from 'react'
import { TrendingUp, Sparkles, Crown, Star, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

type BadgeType = 'trending' | 'new' | 'bestseller' | 'featured'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeIconProps {
  type: BadgeType
  size?: BadgeSize
  className?: string
  showLabel?: boolean
}

interface BadgeConfig {
  icon: LucideIcon
  label: string
  baseColor: string
  gradientFrom: string
  gradientTo: string
  glowColor: string
}

/**
 * BadgeIcon Component
 *
 * DUAL-SIDED IMPACT:
 * - SELLERS: Motivates quality through visible recognition (bestseller, featured status)
 * - CUSTOMERS: Provides quick visual filtering and trust signals (trending = popular, new = fresh content)
 *
 * Small badges for overlaying on product cards to highlight special status.
 * Uses psychological triggers: scarcity (new), social proof (trending), authority (featured).
 */
const BadgeIcon: React.FC<BadgeIconProps> = ({
  type,
  size = 'md',
  className = '',
  showLabel = true,
}) => {
  const badges: Record<BadgeType, BadgeConfig> = {
    trending: {
      icon: TrendingUp,
      label: 'Trending',
      baseColor: 'text-primary',
      gradientFrom: 'from-primary',
      gradientTo: 'to-primary-light',
      glowColor: 'rgba(0, 229, 255, 0.4)',
    },
    new: {
      icon: Sparkles,
      label: 'New',
      baseColor: 'text-secondary',
      gradientFrom: 'from-secondary',
      gradientTo: 'to-secondary-light',
      glowColor: 'rgba(184, 79, 255, 0.4)',
    },
    bestseller: {
      icon: Crown,
      label: 'Bestseller',
      baseColor: 'text-accent',
      gradientFrom: 'from-accent',
      gradientTo: 'to-accent-light',
      glowColor: 'rgba(255, 213, 79, 0.4)',
    },
    featured: {
      icon: Star,
      label: 'Featured',
      baseColor: 'text-primary',
      gradientFrom: 'from-primary',
      gradientTo: 'to-secondary',
      glowColor: 'rgba(92, 154, 255, 0.5)',
    },
  }

  const config = badges[type]
  const Icon = config.icon

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 12,
      fontSize: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 14,
      fontSize: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 16,
      fontSize: 'text-base',
    },
  }[size]

  const shouldShowLabel = showLabel && size !== 'sm'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-semibold backdrop-blur-md',
        'border border-white/20',
        `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`,
        sizeConfig.container,
        sizeConfig.fontSize,
        // Pulse animation for trending
        type === 'trending' && 'animate-pulse',
        className
      )}
      style={{
        boxShadow: `0 0 20px ${config.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      }}
    >
      <Icon size={sizeConfig.icon} className="text-white drop-shadow-lg" strokeWidth={2.5} />
      {shouldShowLabel && (
        <span className="text-white font-bold tracking-wide drop-shadow-lg">
          {config.label}
        </span>
      )}
    </motion.div>
  )
}

/**
 * Wrapper component for absolute positioning on cards
 */
export const BadgeOverlay: React.FC<
  BadgeIconProps & {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
> = ({ position = 'top-right', ...props }) => {
  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
  }[position]

  return (
    <div className={clsx('absolute z-10', positionClasses)}>
      <BadgeIcon {...props} />
    </div>
  )
}

export default BadgeIcon
