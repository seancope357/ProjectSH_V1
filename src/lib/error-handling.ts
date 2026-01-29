/**
 * Error Handling Utilities for SequenceHub
 * 
 * Provides centralized error message generation, error type detection,
 * and retry logic for consistent error handling across the application.
 */

// Error types for categorization
export type ErrorType =
  | 'network'
  | 'server'
  | 'auth'
  | 'validation'
  | 'upload'
  | 'payment'
  | 'unknown'

// Structured error information
export interface ErrorInfo {
  type: ErrorType
  message: string
  userMessage: string
  canRetry: boolean
  action?: 'retry' | 'redirect' | 'contact_support'
  redirectTo?: string
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error
    }
  }

  return 'An unknown error occurred'
}

/**
 * Detects if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()
  
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('offline') ||
    (error instanceof TypeError && message.includes('failed to fetch'))
  )
}

/**
 * Detects if an error is authentication-related
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('status' in error && (error.status === 401 || error.status === 403)) {
      return true
    }
  }
  
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('unauthorized') ||
    message.includes('authentication') ||
    message.includes('session expired') ||
    message.includes('not authenticated')
  )
}

/**
 * Detects if an error is server-related
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('status' in error) {
      const status = error.status as number
      return status >= 500 && status < 600
    }
  }
  
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('server error') ||
    message.includes('internal server') ||
    message.includes('service unavailable')
  )
}

/**
 * Detects if an error is validation-related
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('status' in error && error.status === 400) {
      return true
    }
  }
  
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('must be')
  )
}

/**
 * Determines if an error should allow retry based on type and attempt count
 */
export function shouldRetry(error: unknown, attemptCount: number, maxAttempts: number = 3): boolean {
  if (attemptCount >= maxAttempts) {
    return false
  }

  // Never retry auth errors - user needs to re-authenticate
  if (isAuthError(error)) {
    return false
  }

  // Never retry validation errors - user needs to fix input
  if (isValidationError(error)) {
    return false
  }

  // Retry network errors
  if (isNetworkError(error)) {
    return true
  }

  // Retry server errors (might be temporary)
  if (isServerError(error)) {
    return true
  }

  // Don't retry unknown errors by default
  return false
}

/**
 * Calculates exponential backoff delay for retries
 * @param attemptCount - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds (default: 1000ms)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s
  return baseDelay * Math.pow(2, attemptCount)
}

/**
 * Gets comprehensive error information for display and handling
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  // Network errors
  if (isNetworkError(error)) {
    return {
      type: 'network',
      message: getErrorMessage(error),
      userMessage: 'Unable to connect. Please check your internet connection and try again.',
      canRetry: true,
      action: 'retry',
    }
  }

  // Authentication errors
  if (isAuthError(error)) {
    return {
      type: 'auth',
      message: getErrorMessage(error),
      userMessage: 'Your session has expired. Please sign in again to continue.',
      canRetry: false,
      action: 'redirect',
      redirectTo: '/auth/login',
    }
  }

  // Server errors
  if (isServerError(error)) {
    return {
      type: 'server',
      message: getErrorMessage(error),
      userMessage: 'Our servers are experiencing issues. We\'ve been notified and are working on it. Please try again in a few minutes.',
      canRetry: true,
      action: 'retry',
    }
  }

  // Validation errors
  if (isValidationError(error)) {
    return {
      type: 'validation',
      message: getErrorMessage(error),
      userMessage: getErrorMessage(error), // Use actual validation message
      canRetry: false,
    }
  }

  // Upload errors (file-specific)
  const message = getErrorMessage(error).toLowerCase()
  if (message.includes('file') || message.includes('upload') || message.includes('image')) {
    let userMessage = 'Failed to upload file. Please try again.'
    
    if (message.includes('size') || message.includes('large') || message.includes('mb')) {
      userMessage = 'File is too large. Please choose a smaller file (max 5MB).'
    } else if (message.includes('type') || message.includes('format')) {
      userMessage = 'Invalid file type. Please upload a JPG, PNG, or WebP image.'
    } else if (message.includes('interrupted') || message.includes('network')) {
      userMessage = 'Upload interrupted. Your connection may be unstable. Please try again.'
    }
    
    return {
      type: 'upload',
      message: getErrorMessage(error),
      userMessage,
      canRetry: true,
      action: 'retry',
    }
  }

  // Payment errors
  if (message.includes('payment') || message.includes('stripe') || message.includes('charge')) {
    return {
      type: 'payment',
      message: getErrorMessage(error),
      userMessage: 'Payment processing failed. Please check your payment details and try again.',
      canRetry: true,
      action: 'retry',
    }
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: getErrorMessage(error),
    userMessage: 'Something went wrong. Please try again or contact support if the problem persists.',
    canRetry: true,
    action: 'retry',
  }
}

/**
 * Retry helper function with exponential backoff
 * @param fn - Async function to retry
 * @param options - Retry configuration
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    baseDelay?: number
    onRetry?: (attempt: number, error: unknown) => void
  } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, onRetry } = options
  
  let lastError: unknown
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Check if we should retry
      if (!shouldRetry(error, attempt, maxAttempts)) {
        throw error
      }
      
      // Don't delay after the last attempt
      if (attempt < maxAttempts - 1) {
        const delay = getRetryDelay(attempt, baseDelay)
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, error)
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  // All attempts failed
  throw lastError
}

/**
 * Logs error information for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const errorInfo = getErrorInfo(error)
    console.error('[Error Handler]', context || 'Unknown context', {
      type: errorInfo.type,
      message: errorInfo.message,
      userMessage: errorInfo.userMessage,
      canRetry: errorInfo.canRetry,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Creates a delay promise (useful for artificial delays in testing)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
