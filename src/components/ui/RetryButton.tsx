/**
 * RetryButton Component
 *
 * Specialized button for retry operations with:
 * - Loading state during retry
 * - Disabled state after max attempts
 * - Retry attempt counter
 * - Professional styling and animations
 * - Accessible labels
 */

import React from 'react';

export interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  label?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  disabled = false,
  className = '',
  variant = 'secondary',
  size = 'md',
  showCount = true,
  label = 'Retry',
}) => {
  const isDisabled = disabled || isRetrying || retryCount >= maxRetries;

  const variantStyles = {
    primary: `
      bg-blue-600 text-white border-blue-600
      hover:bg-blue-700 hover:border-blue-700
      focus:ring-blue-500
      disabled:bg-blue-300 disabled:border-blue-300
    `,
    secondary: `
      bg-white text-blue-600 border-blue-600
      hover:bg-blue-50
      focus:ring-blue-500
      disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300
    `,
    ghost: `
      bg-transparent text-blue-600 border-transparent
      hover:bg-blue-50
      focus:ring-blue-500
      disabled:text-gray-400
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const handleClick = async () => {
    if (isDisabled) return;
    await onRetry();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg border-2
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-60
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      aria-label={
        isRetrying
          ? 'Retrying operation'
          : retryCount >= maxRetries
          ? 'Maximum retry attempts reached'
          : `Retry operation (attempt ${retryCount + 1} of ${maxRetries})`
      }
    >
      {isRetrying ? (
        <>
          {/* Loading spinner */}
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Retrying...</span>
        </>
      ) : (
        <>
          {/* Retry icon */}
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
          <span>{label}</span>
          {showCount && retryCount > 0 && (
            <span className="text-xs opacity-75 ml-1">
              ({retryCount}/{maxRetries})
            </span>
          )}
        </>
      )}
    </button>
  );
};

/**
 * Inline Retry Link Component
 * A minimal retry link for inline use in error messages
 */
export interface RetryLinkProps {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const RetryLink: React.FC<RetryLinkProps> = ({
  onRetry,
  isRetrying = false,
  className = '',
  children = 'Try again',
}) => {
  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={isRetrying}
      className={`
        inline-flex items-center gap-1
        text-blue-600 hover:text-blue-800
        underline decoration-1 underline-offset-2
        transition-colors duration-200
        disabled:opacity-60 disabled:cursor-wait
        ${className}
      `}
      aria-label={isRetrying ? 'Retrying' : 'Retry operation'}
    >
      {isRetrying ? (
        <>
          <svg
            className="animate-spin h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Retrying...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default RetryButton;
