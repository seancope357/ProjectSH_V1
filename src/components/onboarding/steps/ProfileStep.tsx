/**
 * ProfileStep Component
 *
 * Handles profile information with sophisticated upload error handling:
 * - Specific error messages for different file issues
 * - File size and type validation
 * - Upload progress indicator
 * - Retry functionality with state preservation
 * - Auto-clear errors on successful retry
 * - Image preview
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  AppError,
  createAppError,
  validateFileSize,
  validateFileType,
  validateTextLength,
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
  seller_name?: string;
  bio?: string;
  profile_picture_url?: string;
}

interface ProfileStepProps {
  progress: OnboardingProgress | null;
  onNext: (data: Partial<OnboardingProgress>) => Promise<void>;
  onPrevious?: () => void;
  isSaving: boolean;
}

interface FormData {
  sellerName: string;
  bio: string;
  profilePicture: File | null;
}

// ============================================================================
// Component
// ============================================================================

export const ProfileStep: React.FC<ProfileStepProps> = ({
  progress,
  onNext,
  onPrevious,
  isSaving,
}) => {
  // State
  const [formData, setFormData] = useState<FormData>({
    sellerName: progress?.seller_name || '',
    bio: progress?.bio || '',
    profilePicture: null,
  });

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    progress?.profile_picture_url || null
  );

  const [uploadError, setUploadError] = useState<AppError | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, AppError>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadRetryCount, setUploadRetryCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================================
  // File Upload Handling
  // ============================================================================

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Clear previous errors
    setUploadError(null);

    // Validate file size (max 5MB)
    const sizeError = validateFileSize(file, 5);
    if (sizeError) {
      setUploadError(sizeError);
      logError(sizeError, { operation: 'file_select' });
      return;
    }

    // Validate file type
    const typeError = validateFileType(file, ['image/jpeg', 'image/png', 'image/webp']);
    if (typeError) {
      setUploadError(typeError);
      logError(typeError, { operation: 'file_select' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for upload
    setFormData((prev) => ({ ...prev, profilePicture: file }));

    // Automatically start upload
    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Create abort controller
      const { controller, cleanup } = createAbortController(60000); // 60s timeout for uploads
      abortControllerRef.current = controller;

      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      // Upload with retry logic
      const result = await withRetry(
        async () => {
          const response = await fetch('/api/upload/profile-picture', {
            method: 'POST',
            signal: controller.signal,
            body: formDataToSend,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle specific upload errors
            if (response.status === 413) {
              throw Object.assign(
                new Error('File is too large. Maximum size is 5MB.'),
                { statusCode: 413, type: 'upload' }
              );
            }

            if (response.status === 415) {
              throw Object.assign(
                new Error('Unsupported file format. Please upload JPG, PNG, or WebP.'),
                { statusCode: 415, type: 'upload' }
              );
            }

            throw Object.assign(
              new Error(errorData.message || 'Upload failed. Please try again.'),
              {
                statusCode: response.status,
                status: response.status,
                type: 'upload',
              }
            );
          }

          return response.json();
        },
        { maxAttempts: 3 }
      );

      cleanup();

      // Success
      setProfilePictureUrl(result.url);
      setUploadProgress(100);
      setIsUploading(false);
      setUploadRetryCount(0);
      setUploadError(null);
    } catch (error: unknown) {
      // cleanup() removed

      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        const abortError = createAppError(
          new Error('Upload was cancelled. Please try again.'),
          { operation: 'upload_profile_picture' }
        );
        setUploadError(abortError);
        setIsUploading(false);
        return;
      }

      // Handle network interruption
      const appError = createAppError(error, {
        operation: 'upload_profile_picture',
        fieldName: 'profile_picture',
      });

      setUploadError(appError);
      setIsUploading(false);
      setUploadProgress(0);
      logError(appError, { fileName: file.name, fileSize: file.size });
    }
  };

  const handleRetryUpload = async () => {
    if (!formData.profilePicture) {
      return;
    }

    setUploadRetryCount((prev) => prev + 1);
    await uploadProfilePicture(formData.profilePicture);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profilePicture: null }));
    setProfilePictureUrl(null);
    setPreviewUrl(null);
    setUploadError(null);
    setUploadProgress(0);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================================
  // Form Validation
  // ============================================================================

  const validateForm = (): boolean => {
    const errors: Record<string, AppError> = {};

    // Validate seller name
    const nameError = validateTextLength(formData.sellerName, 'Seller name', 2, 100);
    if (nameError) {
      errors.sellerName = nameError;
    }

    // Validate bio
    const bioError = validateTextLength(formData.bio, 'Bio', 10, 1000);
    if (bioError) {
      errors.bio = bioError;
    }

    // Check if profile picture is uploaded
    if (!profilePictureUrl && !formData.profilePicture) {
      errors.profilePicture = createAppError(
        new Error('Please upload a profile picture'),
        { operation: 'form_validation', fieldName: 'profile_picture' }
      );
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare data for next step
    const stepData: Partial<OnboardingProgress> = {
      seller_name: formData.sellerName,
      bio: formData.bio,
      profile_picture_url: profilePictureUrl || undefined,
    };

    await onNext(stepData);
  };

  // ============================================================================
  // Input Handlers
  // ============================================================================

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
        <p className="text-gray-600">
          Tell us about yourself and upload a profile picture
        </p>
      </div>

      {/* Seller Name */}
      <div>
        <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-2">
          Seller Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="sellerName"
          value={formData.sellerName}
          onChange={(e) => handleInputChange('sellerName', e.target.value)}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${validationErrors.sellerName ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="Enter your seller name"
          maxLength={100}
          aria-invalid={!!validationErrors.sellerName}
          aria-describedby={validationErrors.sellerName ? 'sellerName-error' : undefined}
        />
        {validationErrors.sellerName && (
          <p id="sellerName-error" className="mt-1 text-sm text-red-600">
            {validationErrors.sellerName.userMessage}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.sellerName.length}/100 characters
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${validationErrors.bio ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="Tell buyers about yourself and what you sell..."
          maxLength={1000}
          aria-invalid={!!validationErrors.bio}
          aria-describedby={validationErrors.bio ? 'bio-error' : undefined}
        />
        {validationErrors.bio && (
          <p id="bio-error" className="mt-1 text-sm text-red-600">
            {validationErrors.bio.userMessage}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.bio.length}/1000 characters
        </p>
      </div>

      {/* Profile Picture Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture <span className="text-red-500">*</span>
        </label>

        {/* Preview or Upload Button */}
        {previewUrl || profilePictureUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl || profilePictureUrl || ''}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                aria-label="Remove profile picture"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="profilePicture"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              aria-describedby="profilePicture-help"
            />
            <label
              htmlFor="profilePicture"
              className={`
                inline-flex items-center gap-2 px-6 py-3
                border-2 border-dashed rounded-lg
                cursor-pointer transition-all duration-200
                ${
                  validationErrors.profilePicture
                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Choose Profile Picture
              </span>
            </label>
            <p id="profilePicture-help" className="mt-2 text-xs text-gray-500">
              JPG, PNG, or WebP. Maximum 5MB.
            </p>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-4">
            <ErrorAlert
              error={uploadError}
              onRetry={uploadError.canRetry ? handleRetryUpload : undefined}
              onDismiss={() => setUploadError(null)}
              retryCount={uploadRetryCount}
              maxRetries={3}
            />
          </div>
        )}

        {/* Validation Error */}
        {validationErrors.profilePicture && !uploadError && (
          <p className="mt-2 text-sm text-red-600">
            {validationErrors.profilePicture.userMessage}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        {onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving || isUploading}
          className={`
            ml-auto px-6 py-2 text-white rounded-lg
            transition-all duration-200
            ${
              isSaving || isUploading
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

export default ProfileStep;
