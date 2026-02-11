'use client';

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  labelClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;

    return (
      <div className={containerClassName}>
        <div className="flex items-start">
          <div className="flex items-center h-5 mt-[2px]">
            <label
              htmlFor={checkboxId}
              className={`relative inline-flex items-center cursor-pointer ${labelClassName} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                id={checkboxId}
                type="checkbox"
                ref={ref}
                disabled={disabled}
                checked={checked}
                {...register}
                {...props}
                className="sr-only peer"
              />
              <div
                className={`checkbox-visual w-[18px] h-[18px] rounded border transition-all flex items-center justify-center ${
                  hasError ? 'border-error' : 'border-neutral-300'
                } peer-checked:border-primary-normal ${
                  disabled
                    ? 'bg-neutral-100 cursor-not-allowed opacity-50'
                    : 'bg-white peer-hover:border-primary-light'
                } peer-focus:ring-2 peer-focus:ring-primary-normal peer-focus:ring-offset-0 ${className}`}
              >
                <svg
                  className="w-4 h-4 text-primary-normal opacity-0 transition-opacity pointer-events-none"
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
              </div>
            </label>
            <style
              dangerouslySetInnerHTML={{
                __html: `
              input[id="${checkboxId}"]:checked + .checkbox-visual svg {
                opacity: 1 !important;
              }
            `,
              }}
            />
          </div>
          {label && (
            <div className="ml-3">
              <label
                htmlFor={checkboxId}
                className={`text-sm font-medium text-neutral-700 cursor-pointer ${labelClassName}`}
              >
                {label} {required && <span className="text-error">*</span>}
              </label>
              {helperText && !hasError && (
                <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
              )}
              {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
            </div>
          )}
        </div>
        {!label && helperText && !hasError && (
          <p className="mt-1 ml-7 text-xs text-neutral-500">{helperText}</p>
        )}
        {!label && hasError && <p className="mt-1 ml-7 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
