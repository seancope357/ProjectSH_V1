'use client'

import React, { useEffect } from 'react'
import { AlertCircle, X, RefreshCw } from 'lucide-react'
import { ErrorInfo } from '@/lib/error-handling'

export interface ErrorAlertProps {
  error: ErrorInfo | string | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  autoDismiss?: boolean
  autoDismissDelay?: number
  severity?: 'error' | 'warning' | 'info'
}

export function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  className = '',
  autoDismiss = false,
  autoDismissDelay = 5000,
  severity = 'error',
}: ErrorAlertProps) {
  // Auto dismiss functionality
  useEffect(() => {
    if (autoDismiss && error && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss()
      }, autoDismissDelay)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, error, onDismiss, autoDismissDelay])

  if (!error) {
    return null
  }

  // Extract error information
  const errorInfo: ErrorInfo = typeof error === 'string'
    ? {
        type: 'unknown',
        message: error,
        userMessage: error,
        canRetry: false,
      }
    : error

  // Determine colors based on severity
  const severityColors = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'text-red-400',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: 'text-amber-400',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-400',
    },
  }

  const colors = severityColors[severity]

  return (
    <div
      className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${className}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className={`h-5 w-5 ${colors.icon}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${colors.text}`}>
            {errorInfo.userMessage}
          </p>
          
          {/* Action buttons */}
          {(errorInfo.canRetry || onRetry || onDismiss) && (
            <div className="mt-3 flex items-center gap-3">
              {errorInfo.canRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${colors.text} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary rounded px-2 py-1`}
                  aria-label="Retry action"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Try Again
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary rounded px-2 py-1"
                  aria-label="Dismiss error"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss button (X) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${colors.text} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary rounded p-0.5`}
            aria-label="Close error message"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorAlert
