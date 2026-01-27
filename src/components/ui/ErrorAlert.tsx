/**
 * ErrorAlert Component
 *
 * Professional, accessible error display component with:
 * - Multiple severity levels (error, warning, info)
 * - Retry functionality
 * - Dismiss capability
 * - Auto-dismiss option
 * - ARIA live regions for accessibility
 * - Icon indicators
 * - Animated entry/exit
 */

import React, { useEffect, useState } from 'react';
import { AppError } from '@/lib/error-handling';

export interface ErrorAlertProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  showRetryCount?: boolean;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  onDismiss,
  autoDismiss = false,
  autoDismissDelay = 5000,
  showRetryCount = true,
  retryCount = 0,
  maxRetries = 3,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);

      // Auto-dismiss for non-critical errors
      if (autoDismiss && error.severity !== 'error') {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoDismissDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoDismiss, autoDismissDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Wait for animation
  };

  if (!error || !isVisible) {
    return null;
  }

  const severityStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      text: 'text-red-800',
      button: 'text-red-600 hover:text-red-800',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
      button: 'text-yellow-600 hover:text-yellow-800',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-800',
      button: 'text-blue-600 hover:text-blue-800',
    },
  };

  const styles = severityStyles[error.severity];

  const getIcon = () => {
    switch (error.severity) {
      case 'error':
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        rounded-lg border-2 p-4 shadow-sm
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        ${styles.container}
        ${className}
      `}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>

        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {error.userMessage}
          </p>

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-3">
            {error.canRetry && onRetry && retryCount < maxRetries && (
              <button
                type="button"
                onClick={onRetry}
                className={`
                  inline-flex items-center gap-1.5 text-sm font-medium
                  transition-colors duration-200
                  ${styles.button}
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  focus:ring-offset-white focus:ring-blue-500
                  rounded px-2 py-1
                `}
                aria-label={`Retry ${error.type} operation`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry
                {showRetryCount && retryCount > 0 && (
                  <span className="text-xs opacity-75">
                    ({retryCount}/{maxRetries})
                  </span>
                )}
              </button>
            )}

            {retryCount >= maxRetries && (
              <span className={`text-xs ${styles.text} opacity-75`}>
                Maximum retry attempts reached. Please refresh the page or contact support.
              </span>
            )}

            {error.action === 'contact_support' && (
              <a
                href="/support"
                className={`
                  inline-flex items-center gap-1.5 text-sm font-medium
                  transition-colors duration-200
                  ${styles.button}
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  focus:ring-offset-white focus:ring-blue-500
                  rounded px-2 py-1
                `}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Contact Support
              </a>
            )}
          </div>
        </div>

        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={`
                inline-flex rounded-md p-1.5
                transition-colors duration-200
                ${styles.button}
                hover:bg-white/50
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-offset-white focus:ring-blue-500
              `}
              aria-label="Dismiss error"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Additional context for rate limiting */}
      {error.type === 'rate_limit' && error.retryAfter && (
        <div className={`mt-2 text-xs ${styles.text} opacity-75`}>
          Please wait {Math.ceil(error.retryAfter / 1000)} seconds before trying again.
        </div>
      )}
    </div>
  );
};

export default ErrorAlert;
