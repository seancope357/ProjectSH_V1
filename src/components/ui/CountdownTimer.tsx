'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  endDate: Date
  urgencyMessage: string
  onExpire?: () => void
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalHours: number
  isExpired: boolean
}

const calculateTimeRemaining = (endDate: Date): TimeRemaining => {
  const now = new Date().getTime()
  const end = endDate.getTime()
  const difference = end - now

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalHours: 0,
      isExpired: true,
    }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)
  const totalHours = difference / (1000 * 60 * 60)

  return {
    days,
    hours,
    minutes,
    seconds,
    totalHours,
    isExpired: false,
  }
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endDate,
  urgencyMessage,
  onExpire,
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(endDate)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endDate)
      setTimeRemaining(remaining)

      if (remaining.isExpired && onExpire) {
        onExpire()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, onExpire])

  // Determine urgency level based on time remaining
  const getUrgencyLevel = (): 'low' | 'medium' | 'high' => {
    if (timeRemaining.isExpired) return 'high'
    if (timeRemaining.totalHours < 1) return 'high'
    if (timeRemaining.totalHours < 24) return 'medium'
    return 'low'
  }

  const urgencyLevel = getUrgencyLevel()

  // Color schemes based on urgency
  const colorSchemes = {
    low: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/20',
      numberBg: 'bg-cyan-500/20',
      numberText: 'text-cyan-300',
    },
    medium: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/30',
      numberBg: 'bg-orange-500/20',
      numberText: 'text-orange-300',
    },
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      glow: 'shadow-red-500/40',
      numberBg: 'bg-red-500/20',
      numberText: 'text-red-300',
    },
  }

  const colors = colorSchemes[urgencyLevel]

  if (timeRemaining.isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={clsx(
          'rounded-xl p-6 border backdrop-blur-md',
          colors.bg,
          colors.border,
          'shadow-lg',
          className
        )}
      >
        <div className="text-center">
          <p className={clsx('text-2xl font-bold', colors.text)}>
            Offer Ended
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            This promotion has expired
          </p>
        </div>
      </motion.div>
    )
  }

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <motion.div
      className="flex flex-col items-center"
      animate={
        urgencyLevel === 'high'
          ? {
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={
        urgencyLevel === 'high'
          ? {
              duration: 1,
              repeat: Infinity,
              repeatType: 'reverse',
            }
          : {}
      }
    >
      <div
        className={clsx(
          'rounded-lg p-3 sm:p-4 min-w-[60px] sm:min-w-[80px]',
          colors.numberBg,
          'border',
          colors.border,
          'shadow-lg',
          colors.glow,
          'backdrop-blur-sm'
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'text-3xl sm:text-4xl font-bold tabular-nums',
              colors.numberText
            )}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-xs sm:text-sm text-gray-400 mt-2 font-medium uppercase tracking-wide">
        {label}
      </span>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-xl p-6 sm:p-8 border backdrop-blur-md',
        colors.bg,
        colors.border,
        'shadow-lg',
        colors.glow,
        className
      )}
    >
      {/* Urgency Message */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Clock className={clsx('w-5 h-5', colors.text)} />
        <p className={clsx('text-sm sm:text-base font-semibold', colors.text)}>
          {urgencyMessage}
        </p>
      </div>

      {/* Countdown Display */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {timeRemaining.days > 0 && (
          <>
            <TimeUnit value={timeRemaining.days} label="Days" />
            <span className={clsx('text-2xl font-bold', colors.text)}>:</span>
          </>
        )}
        <TimeUnit value={timeRemaining.hours} label="Hours" />
        <span className={clsx('text-2xl font-bold', colors.text)}>:</span>
        <TimeUnit value={timeRemaining.minutes} label="Mins" />
        <span className={clsx('text-2xl font-bold', colors.text)}>:</span>
        <TimeUnit value={timeRemaining.seconds} label="Secs" />
      </div>

      {/* Additional urgency indicator for < 1 hour */}
      {urgencyLevel === 'high' && !timeRemaining.isExpired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <motion.p
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={clsx('text-sm font-bold', colors.text)}
          >
            HURRY! Offer ends soon
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CountdownTimer
