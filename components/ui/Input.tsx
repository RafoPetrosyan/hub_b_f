'use client';

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  prefixIcon?: React.ReactNode;
  labelClassName?: string;
  borderClassName?: string;
  prefixInputStyle?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
      borderClassName = '',
      prefixInputStyle = '',
      id,
      disabled,
      prefixIcon,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;
    const hasPrefixIcon = !!prefixIcon;

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium text-neutral-700 mb-2 ${labelClassName}`}
          >
            {label} {required && <span className="text-error">*</span>}
          </label>
        )}
        <div className="relative">
          {hasPrefixIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            {...register}
            {...props}
            className={`w-full py-3 rounded-lg border ${hasPrefixIcon ? `pl-10 ${prefixInputStyle}` : 'px-4'} ${
              hasError ? 'border-error' : `border-neutral-300 ${borderClassName}`
            } focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent transition-all ${
              disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'
            } ${className}`}
          />
        </div>
        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
