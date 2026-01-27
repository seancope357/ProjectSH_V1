# SequenceHub Error Handling Documentation

## Overview

This document provides a comprehensive guide to the production-grade error handling implementation for the SequenceHub seller onboarding flow.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Error Message Dictionary](#error-message-dictionary)
3. [Component Usage Guide](#component-usage-guide)
4. [Testing Scenarios](#testing-scenarios)
5. [Implementation Patterns](#implementation-patterns)
6. [Best Practices](#best-practices)

---

## Architecture Overview

### Core Components

1. **Error Handling Utility Library** (`src/lib/error-handling.ts`)
   - Error classification and type detection
   - User-friendly message generation
   - Retry logic with exponential backoff
   - Validation utilities
   - Logging infrastructure

2. **ErrorAlert Component** (`src/components/ui/ErrorAlert.tsx`)
   - Displays errors with appropriate severity
   - Retry functionality
   - Dismiss capability
   - Auto-dismiss for warnings/info
   - ARIA accessibility

3. **RetryButton Component** (`src/components/ui/RetryButton.tsx`)
   - Specialized retry button with loading states
   - Attempt counter
   - Multiple style variants

4. **Step Components** (Profile, Specializations, Payout, Guidelines)
   - Step-specific error handling
   - Form validation
   - Cleanup on unmount
   - Abort controllers for cancellable requests

5. **Main Page** (`src/app/seller-onboarding/page.tsx`)
   - Orchestrates all steps
   - Race condition prevention
   - Navigation guards
   - Draft saving (local storage)
   - Offline detection

---

## Error Message Dictionary

### Network Errors

| Error Type | User Message | Scenario |
|-----------|--------------|----------|
| **Connection Lost** | "Unable to connect. Please check your internet connection and try again." | No internet, DNS failure |
| **Request Timeout** | "Request timed out. The server took too long to respond. Please try again." | Server not responding within timeout |
| **Offline Mode** | "You appear to be offline. Please check your internet connection." | Browser reports offline |
| **Connection Saved Locally** | "Connection lost. Your changes are saved locally and will sync when you're back online." | Draft saved during network error |

### Server Errors

| Status Code | User Message | Scenario |
|-------------|--------------|----------|
| **500** | "Our servers are experiencing issues. We've been notified and are working on it. Please try again in a few minutes." | Internal server error |
| **502** | "Service temporarily unavailable. Please try again shortly." | Bad gateway |
| **503** | "Service is under maintenance. Please try again in a few minutes." | Service unavailable |
| **504** | "Gateway timeout. The server is not responding. Please try again." | Gateway timeout |

### Authentication Errors

| Status Code | User Message | Scenario |
|-------------|--------------|----------|
| **401** | "Your session has expired. Please sign in again to continue." | Unauthorized, token expired |
| **403** | "You don't have permission to perform this action. Please contact support if this is unexpected." | Forbidden, insufficient permissions |

### Validation Errors

| Field | Error Message | Validation Rule |
|-------|---------------|-----------------|
| **Seller Name** | "Seller name is required and must be between 2-100 characters." | Length: 2-100 chars |
| **Bio** | "Bio is too long. Maximum 1000 characters. Current: {count} characters." | Max 1000 chars |
| **Bio (min)** | "Bio must be at least 10 characters. Current: {count} characters." | Min 10 chars |
| **Profile Picture** | "Please upload a profile picture" | Required field |
| **Specializations** | "Please select at least 1 specialization." | Min 1 selection |
| **Specializations (max)** | "You can select up to 5 specializations. Please deselect one to add another." | Max 5 selections |
| **Terms** | "Please read and accept the seller guidelines and terms of service to continue." | Must be checked |

### Upload Errors

| Error Type | User Message | Scenario |
|-----------|--------------|----------|
| **File Too Large** | "File is too large. Maximum size is 5MB. Please choose a smaller file." | File > 5MB |
| **Invalid Format** | "Unsupported file format. Please upload a JPG, PNG, or WebP image." | Wrong file type |
| **Upload Failed** | "Upload failed. Please try again." | Generic upload error |
| **Upload Interrupted** | "Upload interrupted. Your connection may be unstable. Try again?" | Network interruption |
| **Upload Timeout** | "Upload was cancelled. Please try again." | Request aborted/timeout |

### Stripe/Payout Errors

| Error Type | User Message | Scenario |
|-----------|--------------|----------|
| **Already Connected** | "A Stripe account is already connected to this seller account." | Duplicate connection (409) |
| **Stripe Unavailable** | "Stripe service is temporarily unavailable. Please try again in a moment." | Stripe service down (503) |
| **Connection Failed** | "Failed to connect to Stripe. Please try again or contact support." | Generic Stripe error |
| **Connection Timeout** | "Connection to Stripe timed out. Please try again." | Timeout during OAuth |
| **Verification Required** | "Your Stripe account needs to be verified before continuing. Please complete the Stripe onboarding process." | Account not verified |
| **Account Not Connected** | "Please connect your Stripe account to receive payouts." | No Stripe account |

### Business Logic Errors

| Error Type | User Message | Scenario |
|-----------|--------------|----------|
| **Duplicate Name** | "This seller name is already taken. Please choose a different name." | Seller name exists |
| **Account Exists** | "An account with this information already exists." | Duplicate account |

---

## Component Usage Guide

### Using ErrorAlert Component

```tsx
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { AppError } from '@/lib/error-handling';

const [error, setError] = useState<AppError | null>(null);
const [retryCount, setRetryCount] = useState(0);

<ErrorAlert
  error={error}
  onRetry={() => {
    setRetryCount(prev => prev + 1);
    // Retry logic here
  }}
  onDismiss={() => setError(null)}
  retryCount={retryCount}
  maxRetries={3}
  showRetryCount={true}
  autoDismiss={false}
/>
```

### Using RetryButton Component

```tsx
import { RetryButton } from '@/components/ui/RetryButton';

const [isRetrying, setIsRetrying] = useState(false);

<RetryButton
  onRetry={async () => {
    setIsRetrying(true);
    await retryOperation();
    setIsRetrying(false);
  }}
  isRetrying={isRetrying}
  retryCount={retryCount}
  maxRetries={3}
  variant="primary"
  size="md"
  label="Retry Upload"
/>
```

### Using Error Handling Utilities

```tsx
import {
  createAppError,
  logError,
  withRetry,
  validateFileSize,
  validateFileType,
} from '@/lib/error-handling';

// File validation
const sizeError = validateFileSize(file, 5);
if (sizeError) {
  setError(sizeError);
  return;
}

// Automatic retry
const data = await withRetry(
  async () => {
    const response = await fetch('/api/endpoint');
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  { maxAttempts: 3 }
);

// Create and log errors
try {
  // operation
} catch (err) {
  const appError = createAppError(err, { operation: 'upload_file' });
  setError(appError);
  logError(appError, { additionalContext: 'value' });
}
```

---

## Testing Scenarios

### How to Test Each Error Type

#### 1. Network Errors

**Offline Mode:**
- Open DevTools → Network tab
- Select "Offline" from throttling dropdown
- Try to load page or submit form
- **Expected:** Yellow warning banner + "You appear to be offline" message

**Request Timeout:**
- Open DevTools → Network tab
- Select "Slow 3G" throttling
- Set very short timeout in code temporarily
- **Expected:** "Request timed out" error with retry button

**Network Interruption:**
- Start upload or form submission
- Quickly toggle offline mode mid-request
- **Expected:** "Connection lost" error + draft saved locally

#### 2. Server Errors

**500 Internal Server Error:**
- Mock API endpoint to return 500 status
- Submit form or load data
- **Expected:** "Our servers are experiencing issues" message + retry option

**503 Service Unavailable:**
- Mock API to return 503
- **Expected:** "Service is under maintenance" message

**Trigger with mock:**
```typescript
// In your API route/mock
return new Response(JSON.stringify({ message: 'Server error' }), {
  status: 500,
});
```

#### 3. Authentication Errors

**Session Expired (401):**
- Mock API to return 401 status
- **Expected:** "Your session has expired" + redirect to login

**Permission Denied (403):**
- Mock API to return 403
- **Expected:** "You don't have permission" + contact support link

#### 4. Validation Errors

**Seller Name Too Short:**
- Enter 1 character in seller name field
- Click submit
- **Expected:** "Seller name must be at least 2 characters" inline error

**Bio Too Long:**
- Paste 1500 characters into bio field
- **Expected:** Character counter shows "1500/1000" + error on blur

**File Too Large:**
- Upload file > 5MB
- **Expected:** "File is too large. Maximum size is 5MB" error

**Invalid File Type:**
- Upload .pdf or .txt file to profile picture
- **Expected:** "Unsupported file format. Please upload JPG, PNG, or WebP" error

**No Specializations Selected:**
- Don't select any specializations
- Click Next
- **Expected:** "Please select at least 1 specialization" error

**Terms Not Accepted:**
- Don't check terms checkbox
- Click Complete
- **Expected:** "Please read and accept the seller guidelines" error

#### 5. Upload Errors

**Upload Interrupted:**
- Start large file upload
- Toggle offline mode during upload
- **Expected:** "Upload interrupted" error + retry button

**Upload Failed:**
- Mock upload endpoint to return 500
- Upload file
- **Expected:** Retry button appears + specific error message

#### 6. Stripe Errors

**Stripe Unavailable:**
- Mock Stripe endpoint to return 503
- Click "Connect with Stripe"
- **Expected:** "Stripe service is temporarily unavailable" + retry

**Account Already Connected:**
- Mock endpoint to return 409
- **Expected:** "A Stripe account is already connected" error

**Verification Pending:**
- Mock account status to show `verified: false`
- Try to proceed
- **Expected:** Yellow badge "Verification Pending" + can't proceed

#### 7. Rate Limiting

**Too Many Requests:**
- Mock API to return 429
- **Expected:** "Too many requests. Please wait a moment" + retry disabled temporarily

#### 8. Race Conditions

**Navigation During Save:**
- Submit form
- Quickly navigate away
- **Expected:** Request aborted cleanly, no memory leaks

**Unmount During Request:**
- Start data load
- Navigate away immediately
- **Expected:** No state updates after unmount (check console for warnings)

### Testing Retry Logic

**Automatic Retry:**
1. Mock endpoint to fail twice, succeed third time
2. Trigger operation
3. **Expected:** Auto-retries 2 times, succeeds on attempt 3

**Manual Retry:**
1. Trigger operation that fails
2. Click "Retry" button
3. **Expected:** Retry count increments, operation re-executed

**Max Retries Reached:**
1. Mock endpoint to always fail
2. Retry 3 times
3. **Expected:** Retry button disabled + "Maximum retry attempts reached" message

### Testing Cleanup & Memory Leaks

**AbortController Cleanup:**
1. Start long request
2. Navigate away before completion
3. Check Network tab
4. **Expected:** Request shows as "cancelled"

**Timeout Cleanup:**
1. Set breakpoint in cleanup function
2. Navigate between steps
3. **Expected:** Cleanup function called, timers cleared

### Testing Draft Saving

**Save on Network Error:**
1. Fill out profile form
2. Disconnect internet
3. Click submit
4. **Expected:** Data saved to localStorage + "saved locally" message

**Load Draft:**
1. Have draft in localStorage
2. Refresh page
3. **Expected:** Form fields populated with draft data

**Clear Draft on Success:**
1. Have draft in localStorage
2. Submit successfully
3. **Expected:** Draft removed from localStorage

---

## Implementation Patterns

### Pattern 1: Standard API Call with Error Handling

```typescript
const [error, setError] = useState<AppError | null>(null);
const [retryCount, setRetryCount] = useState(0);
const abortControllerRef = useRef<AbortController | null>(null);

const loadData = async () => {
  try {
    setError(null);

    const { controller, cleanup } = createAbortController(30000);
    abortControllerRef.current = controller;

    const data = await withRetry(
      async () => {
        const response = await fetch('/api/endpoint', {
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw Object.assign(
            new Error(errorData.message || 'Operation failed'),
            { statusCode: response.status }
          );
        }

        return response.json();
      },
      { maxAttempts: 3 }
    );

    cleanup();

    // Success
    setData(data);
    setRetryCount(0);
  } catch (err) {
    cleanup();

    if (err instanceof Error && err.name === 'AbortError') {
      return; // Gracefully handle abort
    }

    const appError = createAppError(err, { operation: 'load_data' });
    setError(appError);
    logError(appError);
  }
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, []);
```

### Pattern 2: File Upload with Progress

```typescript
const [uploadError, setUploadError] = useState<AppError | null>(null);
const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);

const uploadFile = async (file: File) => {
  // Validate
  const sizeError = validateFileSize(file, 5);
  if (sizeError) {
    setUploadError(sizeError);
    return;
  }

  const typeError = validateFileType(file, ['image/jpeg', 'image/png']);
  if (typeError) {
    setUploadError(typeError);
    return;
  }

  try {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const result = await withRetry(
      async () => {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 413) {
            throw Object.assign(
              new Error('File too large'),
              { statusCode: 413, type: 'upload' }
            );
          }
          throw new Error('Upload failed');
        }

        return response.json();
      },
      { maxAttempts: 3 }
    );

    setUploadProgress(100);
    setIsUploading(false);
    // Handle success
  } catch (err) {
    const appError = createAppError(err, { operation: 'file_upload' });
    setUploadError(appError);
    setIsUploading(false);
    logError(appError, { fileName: file.name, fileSize: file.size });
  }
};
```

### Pattern 3: Form Validation

```typescript
const [validationErrors, setValidationErrors] = useState<Record<string, AppError>>({});

const validateForm = (): boolean => {
  const errors: Record<string, AppError> = {};

  const nameError = validateTextLength(formData.name, 'Name', 2, 100);
  if (nameError) {
    errors.name = nameError;
  }

  const bioError = validateTextLength(formData.bio, 'Bio', 10, 1000);
  if (bioError) {
    errors.bio = bioError;
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  // Proceed with submission
};

// Clear field error on change
const handleFieldChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));

  if (validationErrors[field]) {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }
};
```

---

## Best Practices

### 1. Error Handling

- **Always** use `createAppError()` to create structured errors
- **Log** all errors with `logError()` for debugging
- **Provide** specific, actionable messages to users
- **Never** show raw error messages or stack traces to users
- **Clear** errors when user takes corrective action

### 2. Retry Logic

- **Use** automatic retry for network and server errors
- **Don't retry** authentication or validation errors
- **Limit** retries to 3 attempts with exponential backoff
- **Show** retry count to users
- **Disable** retry button after max attempts
- **Allow** manual retry even after auto-retry exhausted

### 3. Loading States

- **Show** loading indicators for all async operations
- **Disable** buttons during loading
- **Prevent** duplicate submissions
- **Display** progress for uploads

### 4. Cleanup

- **Always** cleanup on unmount
- **Use** AbortController for cancellable requests
- **Clear** all timers and intervals
- **Remove** event listeners
- **Check** `isMounted` before state updates after async ops

### 5. User Experience

- **Preserve** user data on errors (draft saving)
- **Don't lose** form input on validation errors
- **Provide** clear next steps in error messages
- **Offer** support links for unrecoverable errors
- **Detect** offline mode and warn users
- **Warn** about unsaved changes before navigation

### 6. Accessibility

- **Use** ARIA live regions for error announcements
- **Provide** aria-invalid on invalid fields
- **Link** errors to fields with aria-describedby
- **Ensure** keyboard navigation works
- **Use** semantic HTML

### 7. Performance

- **Debounce** validation for text inputs
- **Throttle** API calls
- **Use** proper timeouts
- **Avoid** memory leaks with cleanup
- **Cancel** unnecessary requests

---

## Error Severity Levels

### Error (Red)
- Network failures
- Server errors
- Upload failures
- Authentication errors
- Operations that block progress

### Warning (Yellow)
- Validation errors
- Rate limiting
- Pending verifications
- Non-critical issues

### Info (Blue)
- Success messages
- Informational notices
- Tips and suggestions

---

## Monitoring & Debugging

### Console Logging Structure

All errors are logged with structured data:

```typescript
console.error('[SequenceHub Error]', {
  type: 'network',
  message: 'Failed to fetch',
  userMessage: 'Unable to connect...',
  statusCode: undefined,
  canRetry: true,
  timestamp: '2024-01-26T12:00:00.000Z',
  context: { operation: 'load_data' }
});
```

### Integration Points for Error Tracking

In production, integrate with error tracking services:

```typescript
// In logError function
if (process.env.NODE_ENV === 'production') {
  // Sentry
  Sentry.captureException(error.originalError, {
    tags: { type: error.type },
    extra: { context: error.context }
  });

  // Or LogRocket, DataDog, etc.
}
```

---

## Offline Support

The implementation includes:

1. **Detection:** `navigator.onLine` + online/offline events
2. **Warning:** Visible banner when offline
3. **Draft Saving:** Form data saved to localStorage
4. **Auto-Sync:** Retry operations when back online
5. **User Feedback:** Clear messaging about offline state

---

## Future Enhancements

1. **Optimistic UI Updates:** Show success immediately, rollback on error
2. **Background Sync:** Use Service Workers for offline queue
3. **Error Analytics:** Track error rates and patterns
4. **A/B Testing:** Test different error messages
5. **i18n Support:** Multi-language error messages
6. **Custom Error Pages:** Branded error states
7. **Error Recovery Suggestions:** AI-powered help text

---

## Support

For questions or issues with error handling:

1. Check this documentation
2. Review error logs in console
3. Test with the scenarios above
4. Contact development team

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Maintainer:** SequenceHub Development Team
