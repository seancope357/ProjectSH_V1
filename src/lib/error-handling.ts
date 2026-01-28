/**
 * Error Handling Utilities for SequenceHub
 *
 * Provides comprehensive error classification, user-friendly messages,
 * retry logic, and error recovery patterns.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type ErrorType =
  | 'network'
  | 'server'
  | 'authentication'
  | 'validation'
  | 'business'
  | 'upload'
  | 'timeout'
  | 'rate_limit'
  | 'unknown';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  severity: ErrorSeverity;
  statusCode?: number;
  action?: 'retry' | 'redirect' | 'refresh' | 'contact_support' | 'none';
  redirectTo?: string;
  originalError?: unknown;
  timestamp: number;
  retryAfter?: number; // milliseconds
  context?: Record<string, unknown>;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Determines if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.name === 'NetworkError' ||
      err.message?.includes('network') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('Network request failed') ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'ETIMEDOUT'
    );
  }

  return false;
}

/**
 * Determines if an error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.name === 'TimeoutError' ||
      err.message?.includes('timeout') ||
      err.message?.includes('timed out') ||
      err.code === 'ETIMEDOUT' ||
      err.statusCode === 408
    );
  }
  return false;
}

/**
 * Determines if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.statusCode === 401 ||
      err.status === 401 ||
      err.message?.includes('unauthorized') ||
      err.message?.includes('authentication') ||
      err.message?.includes('token expired')
    );
  }
  return false;
}

/**
 * Determines if an error is a permission/authorization error
 */
export function isPermissionError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.statusCode === 403 ||
      err.status === 403 ||
      err.message?.includes('forbidden') ||
      err.message?.includes('permission denied')
    );
  }
  return false;
}

/**
 * Determines if an error is a rate limiting error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.statusCode === 429 ||
      err.status === 429 ||
      err.message?.includes('rate limit') ||
      err.message?.includes('too many requests')
    );
  }
  return false;
}

/**
 * Determines if an error is a server error
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    const statusCode = err.statusCode || err.status;
    return statusCode >= 500 && statusCode < 600;
  }
  return false;
}

/**
 * Determines if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.statusCode === 400 ||
      err.status === 400 ||
      err.statusCode === 422 ||
      err.status === 422 ||
      err.type === 'validation' ||
      err.message?.includes('validation') ||
      err.message?.includes('invalid')
    );
  }
  return false;
}

// ============================================================================
// Error Type Classification
// ============================================================================

export function classifyError(error: unknown): ErrorType {
  if (isNetworkError(error)) return 'network';
  if (isTimeoutError(error)) return 'timeout';
  if (isAuthError(error)) return 'authentication';
  if (isPermissionError(error)) return 'authentication';
  if (isRateLimitError(error)) return 'rate_limit';
  if (isServerError(error)) return 'server';
  if (isValidationError(error)) return 'validation';

  // Check for business logic errors
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.type === 'business' || err.statusCode === 409) {
      return 'business';
    }
  }

  return 'unknown';
}

// ============================================================================
// Error Message Extraction
// ============================================================================

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred';

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    const err = error as any;

    // Check various common error message properties
    if (err.userMessage) return err.userMessage;
    if (err.message) return err.message;
    if (err.error?.message) return err.error.message;
    if (err.data?.message) return err.data.message;
    if (err.statusText) return err.statusText;
  }

  return 'An unexpected error occurred';
}

/**
 * Gets status code from error object
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const err = error as any;
    return err.statusCode || err.status || err.response?.status;
  }
  return undefined;
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // Network Errors
  network: {
    default: 'Unable to connect. Please check your internet connection and try again.',
    offline: 'You appear to be offline. Please check your internet connection.',
    timeout: 'Request timed out. The server took too long to respond. Please try again.',
    dns: 'Unable to reach the server. Please check your connection and try again.',
  },

  // Server Errors
  server: {
    default: "Our servers are experiencing issues. We've been notified and are working on it. Please try again in a few minutes.",
    500: 'Internal server error. Please try again shortly.',
    502: 'Service temporarily unavailable. Please try again shortly.',
    503: 'Service is under maintenance. Please try again in a few minutes.',
    504: 'Gateway timeout. The server is not responding. Please try again.',
  },

  // Authentication Errors
  auth: {
    unauthorized: 'Your session has expired. Please sign in again to continue.',
    forbidden: "You don't have permission to perform this action. Please contact support if this is unexpected.",
    invalidToken: 'Your authentication token is invalid. Please sign in again.',
  },

  // Validation Errors
  validation: {
    required: 'Please fill in all required fields.',
    invalidFormat: 'Please check your input and try again.',
    tooLong: 'Input is too long. Please shorten it and try again.',
    tooShort: 'Input is too short. Please provide more information.',
    invalidUrl: 'Please enter a valid URL (e.g., https://example.com)',
    invalidEmail: 'Please enter a valid email address.',
  },

  // Upload Errors
  upload: {
    fileTooLarge: 'File is too large. Maximum size is 5MB. Please choose a smaller file.',
    invalidFormat: 'Unsupported file format. Please upload a JPG, PNG, or WebP image.',
    uploadFailed: 'Upload failed. Please try again.',
    uploadInterrupted: 'Upload interrupted. Your connection may be unstable. Try again?',
    noFile: 'Please select a file to upload.',
  },

  // Business Logic Errors
  business: {
    duplicateSellerName: 'This seller name is already taken. Please choose a different name.',
    accountExists: 'An account with this information already exists.',
    stripeError: 'There was an issue setting up your payout account. Please try again or contact support.',
    termsNotAccepted: 'Please accept the terms and conditions to continue.',
  },

  // Rate Limiting
  rateLimit: {
    default: 'Too many requests. Please wait a moment and try again.',
    retry: 'Rate limit exceeded. Please try again in {seconds} seconds.',
  },

  // Generic
  unknown: {
    default: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
  },
} as const;

/**
 * Gets a user-friendly message based on error type and context
 */
export function getUserFriendlyMessage(
  error: unknown,
  context?: { operation?: string; fieldName?: string }
): string {
  const errorType = classifyError(error);
  const statusCode = getErrorStatusCode(error);
  const originalMessage = getErrorMessage(error);

  // Try to match specific error messages from the server
  const lowerMessage = originalMessage.toLowerCase();

  // Check for specific patterns
  if (lowerMessage.includes('file too large') || lowerMessage.includes('size')) {
    return ERROR_MESSAGES.upload.fileTooLarge;
  }
  if (lowerMessage.includes('invalid format') || lowerMessage.includes('file type')) {
    return ERROR_MESSAGES.upload.invalidFormat;
  }
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
    return ERROR_MESSAGES.business.duplicateSellerName;
  }
  if (lowerMessage.includes('session expired') || lowerMessage.includes('token')) {
    return ERROR_MESSAGES.auth.unauthorized;
  }

  // Fallback to error type-based messages
  switch (errorType) {
    case 'network':
      return isTimeoutError(error)
        ? ERROR_MESSAGES.network.timeout
        : ERROR_MESSAGES.network.default;

    case 'timeout':
      return ERROR_MESSAGES.network.timeout;

    case 'server':
      if (statusCode === 503) return ERROR_MESSAGES.server[503];
      if (statusCode === 502) return ERROR_MESSAGES.server[502];
      if (statusCode === 504) return ERROR_MESSAGES.server[504];
      return ERROR_MESSAGES.server.default;

    case 'authentication':
      if (statusCode === 403) return ERROR_MESSAGES.auth.forbidden;
      return ERROR_MESSAGES.auth.unauthorized;

    case 'validation':
      return ERROR_MESSAGES.validation.invalidFormat;

    case 'rate_limit':
      return ERROR_MESSAGES.rateLimit.default;

    case 'upload':
      return ERROR_MESSAGES.upload.uploadFailed;

    case 'business':
      return originalMessage || ERROR_MESSAGES.business.stripeError;

    default:
      // If we have a reasonable error message from the server, use it
      if (originalMessage && originalMessage.length < 200 && !originalMessage.includes('Error:')) {
        return originalMessage;
      }
      return ERROR_MESSAGES.unknown.default;
  }
}

// ============================================================================
// Error Object Creation
// ============================================================================

/**
 * Creates a structured AppError object from an unknown error
 */
export function createAppError(
  error: unknown,
  context?: { operation?: string; fieldName?: string }
): AppError {
  const errorType = classifyError(error);
  const statusCode = getErrorStatusCode(error);
  const userMessage = getUserFriendlyMessage(error, context);
  const originalMessage = getErrorMessage(error);

  // Determine if error is retryable
  const canRetry =
    errorType === 'network' ||
    errorType === 'timeout' ||
    errorType === 'server' ||
    errorType === 'upload' ||
    (errorType === 'rate_limit' && statusCode === 429);

  // Determine action
  let action: AppError['action'] = 'none';
  if (canRetry) {
    action = 'retry';
  } else if (errorType === 'authentication') {
    action = 'redirect';
  } else if (errorType === 'unknown') {
    action = 'contact_support';
  }

  // Determine severity
  let severity: ErrorSeverity = 'error';
  if (errorType === 'validation') {
    severity = 'warning';
  } else if (errorType === 'rate_limit') {
    severity = 'warning';
  }

  // Calculate retry delay for rate limiting
  let retryAfter: number | undefined;
  if (errorType === 'rate_limit' && error && typeof error === 'object') {
    const err = error as any;
    retryAfter = err.retryAfter || err.retry_after || 60000; // Default 60s
  }

  return {
    type: errorType,
    message: originalMessage,
    userMessage,
    canRetry,
    severity,
    statusCode,
    action,
    redirectTo: errorType === 'authentication' ? '/login' : undefined,
    originalError: error,
    timestamp: Date.now(),
    retryAfter,
    context,
  };
}

// ============================================================================
// Retry Logic
// ============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 8000,
  backoffMultiplier: 2,
};

/**
 * Determines if an error should be retried
 */
export function shouldRetry(
  error: unknown,
  attemptCount: number,
  config: Partial<RetryConfig> = {}
): boolean {
  const { maxAttempts } = { ...DEFAULT_RETRY_CONFIG, ...config };

  if (attemptCount >= maxAttempts) {
    return false;
  }

  const errorType = classifyError(error);

  // Never retry authentication or validation errors
  if (errorType === 'authentication' || errorType === 'validation') {
    return false;
  }

  // Always retry network, timeout, and server errors
  if (errorType === 'network' || errorType === 'timeout' || errorType === 'server') {
    return true;
  }

  // Retry upload errors
  if (errorType === 'upload') {
    return true;
  }

  // Don't retry rate limit errors immediately (needs delay)
  if (errorType === 'rate_limit') {
    return false; // Manual retry only
  }

  return false;
}

/**
 * Calculates retry delay with exponential backoff
 */
export function getRetryDelay(
  attemptCount: number,
  config: Partial<RetryConfig> = {}
): number {
  const { initialDelayMs, maxDelayMs, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  const delay = initialDelayMs * Math.pow(backoffMultiplier, attemptCount - 1);
  return Math.min(delay, maxDelayMs);
}

/**
 * Executes a function with automatic retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error, attempt + 1, retryConfig)) {
        throw error;
      }

      if (attempt < retryConfig.maxAttempts - 1) {
        const delay = getRetryDelay(attempt + 1, retryConfig);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// Logging Utilities
// ============================================================================

export interface ErrorLogData {
  error: AppError;
  userId?: string;
  sessionId?: string;
  route?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * Logs error to console with structured data
 */
export function logError(
  error: AppError,
  additionalContext?: Record<string, unknown>
): void {
  const logData: ErrorLogData = {
    error,
    route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };

  console.error('[SequenceHub Error]', {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    statusCode: error.statusCode,
    canRetry: error.canRetry,
    timestamp: logData.timestamp,
    context: error.context,
  });

  // In production, you would send this to an error tracking service
  // Example: Sentry, LogRocket, DataDog, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(logData);
  // }
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function validateFileSize(file: File, maxSizeInMB: number = 5): AppError | null {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return createAppError(
      new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of ${maxSizeInMB}MB`),
      { operation: 'file_upload' }
    );
  }

  return null;
}

export function validateFileType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): AppError | null {
  if (!allowedTypes.includes(file.type)) {
    return createAppError(
      new Error(`File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`),
      { operation: 'file_upload' }
    );
  }

  return null;
}

export function validateUrl(url: string): AppError | null {
  try {
    new URL(url);
    return null;
  } catch {
    return createAppError(
      new Error('Invalid URL format'),
      { operation: 'url_validation' }
    );
  }
}

export function validateTextLength(
  text: string,
  fieldName: string,
  min: number,
  max: number
): AppError | null {
  if (text.length < min) {
    return createAppError(
      new Error(`${fieldName} must be at least ${min} characters. Current: ${text.length}`),
      { operation: 'text_validation', fieldName }
    );
  }

  if (text.length > max) {
    return createAppError(
      new Error(`${fieldName} is too long. Maximum ${max} characters. Current: ${text.length}`),
      { operation: 'text_validation', fieldName }
    );
  }

  return null;
}

// ============================================================================
// Abort Controller Utilities
// ============================================================================

/**
 * Creates an AbortController with timeout
 */
export function createAbortController(timeoutMs: number = 30000): {
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  };
}

// ============================================================================
// Error Recovery Utilities
// ============================================================================

/**
 * Checks if browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Waits for browser to come online
 */
export function waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    const handleOnline = () => {
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
    };

    window.addEventListener('online', handleOnline);
  });
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
