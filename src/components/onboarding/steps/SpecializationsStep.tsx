/**
 * SpecializationsStep Component
 *
 * Handles specialization selection with comprehensive error handling:
 * - Validation for minimum/maximum selections
 * - Clear error messages
 * - Retry capability for API failures
 * - Loading states
 * - Graceful degradation if specializations fail to load
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
  specializations?: string[];
}

interface SpecializationsStepProps {
  progress: OnboardingProgress | null;
  onNext: (data: Partial<OnboardingProgress>) => Promise<void>;
  onPrevious?: () => void;
  isSaving: boolean;
}

interface Specialization {
  id: string;
  name: string;
  description: string;
}

// ============================================================================
// Constants
// ============================================================================

const MIN_SELECTIONS = 1;
const MAX_SELECTIONS = 5;

// Fallback specializations if API fails
const FALLBACK_SPECIALIZATIONS: Specialization[] = [
  { id: 'email-sequences', name: 'Email Sequences', description: 'Marketing email campaigns' },
  { id: 'sales-automation', name: 'Sales Automation', description: 'Automated sales workflows' },
  { id: 'customer-onboarding', name: 'Customer Onboarding', description: 'User onboarding flows' },
  { id: 'lead-nurturing', name: 'Lead Nurturing', description: 'Lead engagement sequences' },
  { id: 'customer-retention', name: 'Customer Retention', description: 'Retention campaigns' },
  { id: 'product-launch', name: 'Product Launch', description: 'Product announcement sequences' },
  { id: 'event-promotion', name: 'Event Promotion', description: 'Event marketing campaigns' },
  { id: 're-engagement', name: 'Re-engagement', description: 'Win-back campaigns' },
];

// ============================================================================
// Component
// ============================================================================

export const SpecializationsStep: React.FC<SpecializationsStepProps> = ({
  progress,
  onNext,
  onPrevious,
  isSaving,
}) => {
  // State
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    progress?.specializations || []
  );
  const [availableSpecializations, setAvailableSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [validationError, setValidationError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // ============================================================================
  // Load Specializations
  // ============================================================================

  useEffect(() => {
    isMountedRef.current = true;
    loadSpecializations();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadSpecializations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { controller, cleanup } = createAbortController(30000);
      abortControllerRef.current = controller;

      // Fetch with retry
      const data = await withRetry(
        async () => {
          const response = await fetch('/api/specializations', {
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw Object.assign(
              new Error(errorData.message || 'Failed to load specializations'),
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

      setAvailableSpecializations(data.specializations || FALLBACK_SPECIALIZATIONS);
      setIsLoading(false);
      setRetryCount(0);
      setUsingFallback(false);
    } catch (err: unknown) {
      cleanup();

      if (!isMountedRef.current) return;

      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const appError = createAppError(err, { operation: 'load_specializations' });
      setError(appError);
      setIsLoading(false);
      logError(appError);

      // Use fallback data
      setAvailableSpecializations(FALLBACK_SPECIALIZATIONS);
      setUsingFallback(true);
    }
  };

  const handleRetryLoad = async () => {
    setRetryCount((prev) => prev + 1);
    await loadSpecializations();
  };

  // ============================================================================
  // Selection Handling
  // ============================================================================

  const handleToggleSpecialization = (id: string) => {
    setSelectedSpecializations((prev) => {
      const isSelected = prev.includes(id);

      if (isSelected) {
        // Remove
        return prev.filter((s) => s !== id);
      } else {
        // Add (check max limit)
        if (prev.length >= MAX_SELECTIONS) {
          setValidationError(
            createAppError(
              new Error(
                `You can select up to ${MAX_SELECTIONS} specializations. Please deselect one to add another.`
              ),
              { operation: 'specialization_selection' }
            )
          );
          return prev;
        }
        return [...prev, id];
      }
    });

    // Clear validation error when user makes changes
    setValidationError(null);
  };

  // ============================================================================
  // Form Validation & Submission
  // ============================================================================

  const validateForm = (): boolean => {
    if (selectedSpecializations.length < MIN_SELECTIONS) {
      setValidationError(
        createAppError(
          new Error(
            `Please select at least ${MIN_SELECTIONS} specialization${
              MIN_SELECTIONS > 1 ? 's' : ''
            }.`
          ),
          { operation: 'form_validation', fieldName: 'specializations' }
        )
      );
      return false;
    }

    if (selectedSpecializations.length > MAX_SELECTIONS) {
      setValidationError(
        createAppError(
          new Error(`You can select up to ${MAX_SELECTIONS} specializations.`),
          { operation: 'form_validation', fieldName: 'specializations' }
        )
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationError(null);

    // Validate
    if (!validateForm()) {
      return;
    }

    // Proceed to next step
    await onNext({
      specializations: selectedSpecializations,
    });
  };

  // ============================================================================
  // Render Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Specializations</h2>
          <p className="text-gray-600">Loading available specializations...</p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Specializations</h2>
        <p className="text-gray-600">
          Select {MIN_SELECTIONS}-{MAX_SELECTIONS} areas where you specialize. This helps buyers
          find your sequences.
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
                Using default specializations. You can continue with onboarding.
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

      {/* Selection Counter */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            Selected: {selectedSpecializations.length} / {MAX_SELECTIONS}
          </span>
          {selectedSpecializations.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedSpecializations([]);
                setValidationError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(selectedSpecializations.length / MAX_SELECTIONS) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <ErrorAlert
          error={validationError}
          onDismiss={() => setValidationError(null)}
        />
      )}

      {/* Specialization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableSpecializations.map((spec) => {
          const isSelected = selectedSpecializations.includes(spec.id);

          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => handleToggleSpecialization(spec.id)}
              className={`
                p-4 rounded-lg border-2 text-left
                transition-all duration-200
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {spec.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    {spec.description}
                  </p>
                </div>

                {/* Checkbox */}
                <div
                  className={`
                    flex-shrink-0 ml-3 w-5 h-5 rounded border-2
                    flex items-center justify-center
                    transition-colors duration-200
                    ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
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
          disabled={isSaving || selectedSpecializations.length === 0}
          className={`
            ml-auto px-6 py-2 text-white rounded-lg
            transition-all duration-200
            ${
              isSaving || selectedSpecializations.length === 0
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

export default SpecializationsStep;
