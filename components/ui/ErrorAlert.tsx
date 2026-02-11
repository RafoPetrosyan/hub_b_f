'use client';

import React from 'react';

export interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  title?: string;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onDismiss,
  title = 'Error',
  className = '',
}) => {
  return (
    <div
      className={`p-4 bg-error/10 border border-error/20 rounded-lg ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-error mb-1">{title}</p>
          <p className="text-sm text-error/90">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 text-error/70 hover:text-error transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;

