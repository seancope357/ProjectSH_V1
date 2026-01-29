'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

type AccentColor = 'primary' | 'secondary' | 'accent'

interface BenefitPillarProps {
  icon: LucideIcon
  title: string
  description: string
  stat?: string
  accent?: AccentColor
  className?: string
}

/**
 * BenefitPillar Component
 *
 * DUAL-SIDED IMPACT:
 * - SELLERS: Highlights platform benefits (e.g., "Instant Payouts", "Global Reach")
 * - CUSTOMERS: Showcases value propositions (e.g., "Instant Download", "Lifetime Updates")
 *
 * Used in feature grids to communicate key benefits with visual hierarchy.
 * Icon animations on hover create engagement and draw attention to key messaging.
 */
const BenefitPillar: React.FC<BenefitPillarProps> = ({
  icon: Icon,
  title,
  description,
  stat,
  accent = 'primary',
  className = '',
}) => {
  // Accent color configurations
  const accentConfig = {
    primary: {
      iconGlow: 'rgba(0, 229, 255, 0.5)',
      iconBg: 'from-primary/20 to-primary/5',
      iconText: 'text-primary',
      statText: 'text-primary',
      cardHover: 'hover:border-primary/40',
      iconHoverGlow: '0 0 30px rgba(0, 229, 255, 0.6)',
    },
    secondary: {
      iconGlow: 'rgba(184, 79, 255, 0.5)',
      iconBg: 'from-secondary/20 to-secondary/5',
      iconText: 'text-secondary',
      statText: 'text-secondary',
      cardHover: 'hover:border-secondary/40',
      iconHoverGlow: '0 0 30px rgba(184, 79, 255, 0.6)',
    },
    accent: {
      iconGlow: 'rgba(255, 213, 79, 0.5)',
      iconBg: 'from-accent/20 to-accent/5',
      iconText: 'text-accent',
      statText: 'text-accent',
      cardHover: 'hover:border-accent/40',
      iconHoverGlow: '0 0 30px rgba(255, 213, 79, 0.6)',
    },
  }[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx(
        'group relative flex flex-col items-center text-center p-6 sm:p-8',
        'rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        accentConfig.cardHover,
        'hover:bg-surface/70 hover:translate-y-[-4px]',
        className
      )}
      style={{
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Icon Container with Hover Animation */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className={clsx(
          'relative mb-6 p-5 rounded-2xl',
          `bg-gradient-to-br ${accentConfig.iconBg}`,
          'border border-white/10'
        )}
        style={{
          boxShadow: `0 0 20px ${accentConfig.iconGlow}`,
        }}
      >
        {/* Hover Glow Effect */}
        <div
          className={clsx(
            'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100',
            'transition-opacity duration-300'
          )}
          style={{
            boxShadow: accentConfig.iconHoverGlow,
          }}
        />

        <Icon
          size={40}
          className={clsx(accentConfig.iconText, 'relative z-10')}
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-heading">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 max-w-xs">
        {description}
      </p>

      {/* Optional Stat */}
      {stat && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={clsx(
            'mt-auto pt-4 text-2xl sm:text-3xl font-bold',
            accentConfig.statText
          )}
        >
          {stat}
        </motion.div>
      )}

      {/* Bottom Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className={clsx(
          'absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full',
          `bg-gradient-to-r ${accentConfig.iconBg}`
        )}
        style={{
          boxShadow: `0 0 10px ${accentConfig.iconGlow}`,
        }}
      />
    </motion.div>
  )
}

export default BenefitPillar
