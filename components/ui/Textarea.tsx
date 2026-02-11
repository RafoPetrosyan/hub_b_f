'use client';

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  labelClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      register,
      containerClassName = '',
      labelClassName = '',
      className = '',
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={textareaId}
            className={`block text-sm font-medium text-neutral-700 mb-2 ${labelClassName}`}
          >
            {label} {required && <span className="text-error">*</span>}
            {!required && label.includes('(Optional)') === false && (
              <span className="text-neutral-400 text-xs">(Optional)</span>
            )}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          rows={rows}
          {...register}
          {...props}
          className={`w-full px-4 py-3 rounded-lg border ${
            hasError ? 'border-error' : 'border-neutral-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent transition-all resize-y ${
            disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'
          } ${className}`}
        />
        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
