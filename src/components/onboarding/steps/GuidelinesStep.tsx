/**
 * GuidelinesStep Component
 *
 * Final step - Terms acceptance with error handling:
 * - Loading guidelines from API with fallback
 * - Validation for terms acceptance
 * - Clear error messages
 * - Retry mechanism
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AppError,
  createAppError,
  logError,
  withRetry,
  createAbortController,
} from '@/lib/error-handling';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

// ============================================================================
// Types
// ============================================================================

interface OnboardingProgress {
  terms_accepted?: boolean;
}

interface GuidelinesStepProps {
  progress: OnboardingProgress | null;
  onNext: (data: Partial<OnboardingProgress>) => Promise<void>;
  onPrevious?: () => void;
  isSaving: boolean;
}

interface Guideline {
  id: string;
  title: string;
  description: string;
}

// ============================================================================
// Constants
// ============================================================================

const FALLBACK_GUIDELINES: Guideline[] = [
  {
    id: 'quality',
    title: 'Quality Standards',
    description:
      'All sequences must be well-documented, tested, and provide clear value to buyers. Include comprehensive setup instructions and support documentation.',
  },
  {
    id: 'originality',
    title: 'Original Content',
    description:
      "Sequences must be your original work. Don't copy or plagiarize content from other sellers or sources. Respect intellectual property rights.",
  },
  {
    id: 'support',
    title: 'Customer Support',
    description:
      'Respond to buyer questions within 48 hours. Provide updates and bug fixes for your sequences. Maintain professional communication.',
  },
  {
    id: 'compliance',
    title: 'Legal Compliance',
    description:
      'Ensure your sequences comply with all applicable laws, regulations, and platform policies. No spam, malicious code, or prohibited content.',
  },
  {
    id: 'pricing',
    title: 'Fair Pricing',
    description:
      'Price your sequences fairly based on complexity and value. No deceptive pricing practices or fake discounts.',
  },
];

// ============================================================================
// Component
// ============================================================================

export const GuidelinesStep: React.FC<GuidelinesStepProps> = ({
  progress,
  onNext,
  onPrevious,
  isSaving,
}) => {
  // State
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(progress?.terms_accepted || false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [validationError, setValidationError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // ============================================================================
  // Load Guidelines
  // ============================================================================

  useEffect(() => {
    isMountedRef.current = true;
    loadGuidelines();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadGuidelines = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { controller, cleanup } = createAbortController(30000);
      abortControllerRef.current = controller;

      // Fetch with retry
      const data = await withRetry(
        async () => {
          const response = await fetch('/api/seller/guidelines', {
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw Object.assign(
              new Error(errorData.message || 'Failed to load guidelines'),
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

      setGuidelines(data.guidelines || FALLBACK_GUIDELINES);
      setIsLoading(false);
      setRetryCount(0);
      setUsingFallback(false);
    } catch (err: unknown) {
      // cleanup() removed

      if (!isMountedRef.current) return;

      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const appError = createAppError(err, { operation: 'load_guidelines' });
      setError(appError);
      setIsLoading(false);
      logError(appError);

      // Use fallback data
      setGuidelines(FALLBACK_GUIDELINES);
      setUsingFallback(true);
    }
  };

  const handleRetryLoad = async () => {
    setRetryCount((prev) => prev + 1);
    await loadGuidelines();
  };

  // ============================================================================
  // Form Validation & Submission
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationError(null);

    // Validate terms acceptance
    if (!termsAccepted) {
      setValidationError(
        createAppError(
          new Error(
            'Please read and accept the seller guidelines and terms of service to continue.'
          ),
          { operation: 'form_validation', fieldName: 'terms_accepted' }
        )
      );
      return;
    }

    // Complete onboarding
    await onNext({
      terms_accepted: true,
    });
  };

  // ============================================================================
  // Render Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seller Guidelines</h2>
          <p className="text-gray-600">Loading guidelines...</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render Main UI
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seller Guidelines</h2>
        <p className="text-gray-600">
          Please review our seller guidelines and accept the terms to complete your onboarding
        </p>
      </div>

      {/* Fallback Warning */}
      {usingFallback && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
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
              <p className="text-sm text-yellow-800">
                Showing default guidelines. You can continue with onboarding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Load Error */}
      {error && !usingFallback && (
        <ErrorAlert
          error={error}
          onRetry={error.canRetry ? handleRetryLoad : undefined}
          onDismiss={() => setError(null)}
          retryCount={retryCount}
          maxRetries={3}
        />
      )}

      {/* Validation Error */}
      {validationError && (
        <ErrorAlert
          error={validationError}
          onDismiss={() => setValidationError(null)}
        />
      )}

      {/* Guidelines List */}
      <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          {guidelines.map((guideline, index) => (
            <div key={guideline.id} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{guideline.title}</h3>
                <p className="text-sm text-gray-600">{guideline.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms Acceptance Checkbox */}
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <label className="flex items-start cursor-pointer">
          <div className="flex items-center h-6">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                setValidationError(null);
              }}
              className={`
                w-5 h-5 rounded border-2 text-blue-600
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors cursor-pointer
                ${validationError ? 'border-red-300' : 'border-gray-300'}
              `}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? 'terms-error' : undefined}
            />
          </div>
          <div className="ml-3 flex-1">
            <span className="font-medium text-gray-900">
              I have read and agree to the seller guidelines
            </span>
            <p className="text-sm text-gray-600 mt-1">
              By accepting, you agree to follow all seller guidelines and maintain high-quality
              standards for your sequences. You also agree to our{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </label>
      </div>

      {/* Important Notice */}
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
            <p className="font-medium mb-1">Almost Done!</p>
            <p className="text-blue-800">
              After accepting the guidelines, you'll be able to start creating and selling your
              sequences on SequenceHub. Welcome to our seller community!
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
          disabled={isSaving || !termsAccepted}
          className={`
            ml-auto px-8 py-3 text-white rounded-lg font-medium
            transition-all duration-200
            ${
              isSaving || !termsAccepted
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              Completing Onboarding...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Complete Onboarding
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default GuidelinesStep;
