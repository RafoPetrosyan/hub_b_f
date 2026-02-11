/**
 * Utility functions for handling API error responses
 * Handles both string and object error formats
 */

export interface FieldErrors {
  [fieldName: string]: string;
}

export interface ApiError {
  data?: {
    message?: string | FieldErrors;
    messages?: string | FieldErrors;
    error?: string;
  };
  error?: {
    data?: {
      message?: string | FieldErrors;
      messages?: string | FieldErrors;
      error?: string;
    };
  };
  response?: {
    data?: {
      message?: string | FieldErrors;
      messages?: string | FieldErrors;
      error?: string;
    };
  };
  message?: string;
}

/**
 * Extracts error message from API error response
 * Handles both string and object formats
 * @param error - The error object from API
 * @param fallback - Fallback message if no error found
 * @returns The error message as a string, or null if it's an object
 */
export function getErrorMessage(
  error: ApiError | any,
  fallback: string = 'An error occurred. Please try again.'
): string | null {
  // Try different paths to get the message (check both 'message' and 'messages')
  const message =
    error?.data?.message ||
    error?.data?.messages ||
    error?.error?.data?.message ||
    error?.error?.data?.messages ||
    error?.response?.data?.message ||
    error?.response?.data?.messages ||
    error?.message;

  // If message is a string, return it
  if (typeof message === 'string') {
    return message;
  }

  // If message is an object (field errors), return null (caller should use getFieldErrors)
  if (message && typeof message === 'object' && !Array.isArray(message)) {
    return null;
  }

  // Try to get error field as fallback
  const errorField =
    error?.data?.error ||
    error?.error?.data?.error ||
    error?.response?.data?.error;

  if (typeof errorField === 'string') {
    return errorField;
  }

  // If no message found, return fallback
  return fallback;
}

/**
 * Extracts field-specific errors from API error response
 * @param error - The error object from API
 * @returns Object with field names as keys and error messages as values
 */
export function getFieldErrors(error: ApiError | any): FieldErrors {
  // Try different paths to get the messages (check both 'message' and 'messages')
  const message =
    error?.data?.message ||
    error?.data?.messages ||
    error?.error?.data?.message ||
    error?.error?.data?.messages ||
    error?.response?.data?.message ||
    error?.response?.data?.messages;

  // If message is an object with field errors, return it
  if (message && typeof message === 'object' && !Array.isArray(message)) {
    return message as FieldErrors;
  }

  // Return empty object if no field errors found
  return {};
}

/**
 * Checks if error contains field-specific errors
 * @param error - The error object from API
 * @returns true if error contains field-specific errors
 */
export function hasFieldErrors(error: ApiError | any): boolean {
  const fieldErrors = getFieldErrors(error);
  return Object.keys(fieldErrors).length > 0;
}

/**
 * Gets both general error message and field errors from API error
 * @param error - The error object from API
 * @param fallback - Fallback message if no error found
 * @returns Object with generalError (string | null) and fieldErrors (FieldErrors)
 */
export function parseApiError(
  error: ApiError | any,
  fallback: string = 'An error occurred. Please try again.'
): {
  generalError: string | null;
  fieldErrors: FieldErrors;
} {
  const generalError = getErrorMessage(error, fallback);
  const fieldErrors = getFieldErrors(error);

  return {
    generalError: hasFieldErrors(error) ? null : generalError,
    fieldErrors,
  };
}

