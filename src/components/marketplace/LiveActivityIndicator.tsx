'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, CheckCircle, Download } from 'lucide-react'
import { clsx } from 'clsx'

interface LiveActivityIndicatorProps {
  activityType: 'viewing' | 'purchased' | 'downloaded'
  count: number
  itemName?: string
  showPulse?: boolean
  className?: string
  position?: 'inline' | 'absolute'
}

const LiveActivityIndicator: React.FC<LiveActivityIndicatorProps> = ({
  activityType,
  count,
  itemName,
  showPulse = true,
  className = '',
  position = 'inline',
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Delayed entrance for more natural feel
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const getActivityConfig = () => {
    switch (activityType) {
      case 'viewing':
        return {
          icon: Eye,
          message: itemName
            ? `${count} people viewing ${itemName}`
            : `${count} people viewing this now`,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          iconBg: 'bg-cyan-500/20',
          pulseColor: 'shadow-cyan-500/40',
        }
      case 'purchased':
        return {
          icon: CheckCircle,
          message: itemName
            ? `${count} purchased ${itemName} in last 24h`
            : `${count} purchased in last 24h`,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          iconBg: 'bg-green-500/20',
          pulseColor: 'shadow-green-500/40',
        }
      case 'downloaded':
        return {
          icon: Download,
          message: itemName
            ? `${count} downloads of ${itemName}`
            : `${count} downloads`,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          iconBg: 'bg-purple-500/20',
          pulseColor: 'shadow-purple-500/40',
        }
    }
  }

  const config = getActivityConfig()
  const Icon = config.icon

  if (!isVisible) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border',
        config.bg,
        config.border,
        position === 'absolute' ? 'absolute' : 'relative',
        'shadow-lg',
        className
      )}
    >
      {/* Icon with optional pulse */}
      <motion.div
        animate={
          showPulse
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }
            : {}
        }
        transition={
          showPulse
            ? {
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
              }
            : {}
        }
        className={clsx('flex items-center justify-center w-5 h-5 rounded-full', config.iconBg)}
      >
        <Icon className={clsx('w-3 h-3', config.color)} />
      </motion.div>

      {/* Message */}
      <span className={clsx('text-xs font-medium whitespace-nowrap', config.color)}>
        {config.message}
      </span>

      {/* Pulse ring effect */}
      {showPulse && (
        <motion.div
          className={clsx(
            'absolute inset-0 rounded-full border-2',
            config.border,
            config.pulseColor
          )}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      )}
    </motion.div>
  )
}

export default LiveActivityIndicator
