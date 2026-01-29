'use client'

import React from 'react'
import { RefreshCw } from 'lucide-react'

export interface RetryButtonProps {
  onRetry: () => void | Promise<void>
  isLoading?: boolean
  disabled?: boolean
  attemptCount?: number
  maxAttempts?: number
  children?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}

export function RetryButton({
  onRetry,
  isLoading = false,
  disabled = false,
  attemptCount = 0,
  maxAttempts = 3,
  children,
  className = '',
  size = 'md',
  variant = 'secondary',
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const isDisabled = disabled || isLoading || isRetrying || attemptCount >= maxAttempts

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2',
  }

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 border-primary',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border-white/20',
    outline: 'bg-transparent text-primary hover:bg-primary/10 border-primary',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const attemptLabel = attemptCount > 0 ? ` (attempt ${attemptCount + 1} of ${maxAttempts})` : ''

  return (
    <button
      onClick={handleRetry}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label={`Retry action${attemptLabel}`}
    >
      <RefreshCw
        className={`${iconSizes[size]} ${isRetrying ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />

      <span>
        {children || 'Try Again'}
        {attemptCount > 0 && attemptCount < maxAttempts && (
          <span className="ml-1 text-xs opacity-70">
            ({attemptCount}/{maxAttempts})
          </span>
        )}
      </span>
    </button>
  )
}

export default RetryButton
