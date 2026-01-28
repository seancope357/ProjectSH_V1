/**
 * PayoutStep Component
 *
 * Handles Stripe Connect integration with comprehensive error handling:
 * - Specific Stripe API errors
 * - Account verification status
 * - Connection timeout handling
 * - Clear user guidance for Stripe setup
 * - Retry mechanism for failed connections
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AppError,
  createAppError,
  logError,
  withRetry,
  createAbortController,
} from '@/lib/error-handling';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { RetryButton } from '@/components/ui/RetryButton';

// ============================================================================
// Types
// ============================================================================

interface OnboardingProgress {
  stripe_account_id?: string;
  stripe_account_verified?: boolean;
}

interface PayoutStepProps {
  progress: OnboardingProgress | null;
  onNext: (data: Partial<OnboardingProgress>) => Promise<void>;
  onPrevious?: () => void;
  isSaving: boolean;
}

interface StripeAccountStatus {
  id: string;
  verified: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  verification_status: 'pending' | 'verified' | 'requires_action';
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
  };
}

// ============================================================================
// Component
// ============================================================================

export const PayoutStep: React.FC<PayoutStepProps> = ({
  progress,
  onNext,
  onPrevious,
  isSaving,
}) => {
  // State
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(
    progress?.stripe_account_id || null
  );
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Lifecycle
  // ============================================================================

  useEffect(() => {
    isMountedRef.current = true;

    // Check existing account status
    if (stripeAccountId) {
      checkAccountStatus(stripeAccountId);
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [stripeAccountId]);

  // ============================================================================
  // Stripe Connect
  // ============================================================================

  const handleConnectStripe = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const { controller, cleanup } = createAbortController(60000); // 60s for Stripe OAuth
      abortControllerRef.current = controller;

      // Create Stripe Connect account link
      const result = await withRetry(
        async () => {
          const response = await fetch('/api/stripe/connect/create', {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle specific Stripe errors
            if (response.status === 409) {
              throw Object.assign(
                new Error('A Stripe account is already connected to this seller account.'),
                {
                  statusCode: 409,
                  type: 'business',
                }
              );
            }

            if (response.status === 503) {
              throw Object.assign(
                new Error('Stripe service is temporarily unavailable. Please try again in a moment.'),
                {
                  statusCode: 503,
                  type: 'server',
                }
              );
            }

            throw Object.assign(
              new Error(
                errorData.message ||
                  'Failed to connect to Stripe. Please try again or contact support.'
              ),
              {
                statusCode: response.status,
                status: response.status,
                type: 'business',
              }
            );
          }

          return response.json();
        },
        { maxAttempts: 3 }
      );

      cleanup();

      if (!isMountedRef.current) return;

      // Redirect to Stripe Connect OAuth
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Invalid Stripe Connect URL received');
      }
    } catch (err: unknown) {
      // cleanup() removed

      if (!isMountedRef.current) return;

      if (err instanceof Error && err.name === 'AbortError') {
        const timeoutError = createAppError(
          new Error('Connection to Stripe timed out. Please try again.'),
          { operation: 'stripe_connect' }
        );
        setError(timeoutError);
        setIsConnecting(false);
        logError(timeoutError);
        return;
      }

      const appError = createAppError(err, { operation: 'stripe_connect' });
      setError(appError);
      setIsConnecting(false);
      logError(appError);
    }
  };

  // ============================================================================
  // Account Status Checking
  // ============================================================================

  const checkAccountStatus = async (accountId: string) => {
    try {
      setIsCheckingStatus(true);
      setError(null);

      const { controller, cleanup } = createAbortController(30000);
      abortControllerRef.current = controller;

      const result = await withRetry(
        async () => {
          const response = await fetch(`/api/stripe/account/${accountId}/status`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw Object.assign(
              new Error(errorData.message || 'Failed to check Stripe account status'),
              {
                statusCode: response.status,
                status: response.status,
              }
            );
          }

          return response.json();
        },
        { maxAttempts: 3 }
      );

      cleanup();

      if (!isMountedRef.current) return;

      setAccountStatus(result);
      setIsCheckingStatus(false);
      setRetryCount(0);
    } catch (err: unknown) {
      // cleanup() removed

      if (!isMountedRef.current) return;

      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const appError = createAppError(err, { operation: 'check_stripe_status' });
      setError(appError);
      setIsCheckingStatus(false);
      logError(appError, { accountId });
    }
  };

  const handleRetryStatusCheck = async () => {
    if (!stripeAccountId) return;
    setRetryCount((prev) => prev + 1);
    await checkAccountStatus(stripeAccountId);
  };

  const handleRetryConnect = async () => {
    setRetryCount((prev) => prev + 1);
    await handleConnectStripe();
  };

  // ============================================================================
  // Disconnect Stripe
  // ============================================================================

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Stripe account?')) {
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      await fetch('/api/stripe/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setStripeAccountId(null);
      setAccountStatus(null);
      setIsConnecting(false);
    } catch (err: unknown) {
      const appError = createAppError(err, { operation: 'stripe_disconnect' });
      setError(appError);
      setIsConnecting(false);
      logError(appError);
    }
  };

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Stripe account is connected and verified
    if (!stripeAccountId) {
      setError(
        createAppError(
          new Error('Please connect your Stripe account to receive payouts.'),
          { operation: 'form_validation', fieldName: 'stripe_account' }
        )
      );
      return;
    }

    if (!accountStatus?.verified || !accountStatus?.charges_enabled) {
      setError(
        createAppError(
          new Error(
            'Your Stripe account needs to be verified before continuing. Please complete the Stripe onboarding process.'
          ),
          { operation: 'form_validation', fieldName: 'stripe_verification' }
        )
      );
      return;
    }

    // Proceed to next step
    await onNext({
      stripe_account_id: stripeAccountId,
      stripe_account_verified: true,
    });
  };

  // ============================================================================
  // Render Status Badge
  // ============================================================================

  const renderStatusBadge = () => {
    if (!accountStatus) return null;

    if (accountStatus.verified && accountStatus.charges_enabled) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Verified
        </div>
      );
    }

    if (accountStatus.details_submitted && accountStatus.verification_status === 'pending') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Verification Pending
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        Action Required
      </div>
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payout Setup</h2>
        <p className="text-gray-600">
          Connect your Stripe account to receive payments for your sequences
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorAlert
          error={error}
          onRetry={error.canRetry ? (isConnecting ? handleRetryConnect : handleRetryStatusCheck) : undefined}
          onDismiss={() => setError(null)}
          retryCount={retryCount}
          maxRetries={3}
        />
      )}

      {/* Connected Account Display */}
      {stripeAccountId && accountStatus ? (
        <div className="border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Stripe Account Connected</h3>
                <p className="text-sm text-gray-600">ID: {stripeAccountId.substring(0, 20)}...</p>
              </div>
            </div>
            {renderStatusBadge()}
          </div>

          {/* Requirements */}
          {accountStatus.requirements && accountStatus.requirements.currently_due.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-500 mr-3 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Additional information required
                  </p>
                  <p className="text-sm text-yellow-700">
                    Please complete your Stripe account setup to enable payouts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isCheckingStatus ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking status...
              </div>
            ) : (
              <>
                <RetryButton
                  onRetry={handleRetryStatusCheck}
                  variant="secondary"
                  size="sm"
                  label="Refresh Status"
                />
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-sm text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Connect Stripe CTA */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect Your Stripe Account
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Securely connect your Stripe account to receive payments from buyers. We use Stripe
            Connect to ensure safe and reliable payouts.
          </p>

          <RetryButton
            onRetry={handleConnectStripe}
            isRetrying={isConnecting}
            variant="primary"
            size="lg"
            label="Connect with Stripe"
            showCount={false}
          />

          <p className="text-xs text-gray-500 mt-4">
            You'll be redirected to Stripe to complete the setup
          </p>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-500 mr-3 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 text-sm text-blue-900">
            <p className="font-medium mb-1">Why Stripe?</p>
            <p className="text-blue-800">
              Stripe is a secure, trusted payment platform. Your financial information is never
              stored on our servers. Stripe handles all payment processing and compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        {onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isSaving}
            className="px-6 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
        )}

        <button
          type="submit"
          disabled={
            isSaving ||
            !stripeAccountId ||
            !accountStatus?.verified ||
            !accountStatus?.charges_enabled
          }
          className={`
            ml-auto px-6 py-2 text-white rounded-lg
            transition-all duration-200
            ${
              isSaving ||
              !stripeAccountId ||
              !accountStatus?.verified ||
              !accountStatus?.charges_enabled
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            'Next Step'
          )}
        </button>
      </div>
    </form>
  );
};

export default PayoutStep;
