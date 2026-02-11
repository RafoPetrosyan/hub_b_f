'use client';

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  onLabel?: string;
  offLabel?: string;
  variant?: 'primary' | 'dark' | 'dashboard';
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      register,
      containerClassName = '',
      className = '',
      id,
      disabled,
      checked,
      onLabel,
      offLabel,
      variant = 'primary',
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;
    const checkedBgColor =
      variant === 'dark'
        ? 'peer-checked:bg-neutral-800'
        : variant === 'primary'
          ? 'peer-checked:bg-primary-normal'
          : 'peer-checked:bg-d-accent';

    return (
      <div className={containerClassName}>
        <div className="flex items-center">
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-neutral-700 mr-3 cursor-pointer"
            >
              {label} {required && <span className="text-error">*</span>}
            </label>
          )}
          <label
            htmlFor={switchId}
            className={`relative inline-flex items-center cursor-pointer ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input
              id={switchId}
              type="checkbox"
              ref={ref}
              disabled={disabled}
              checked={checked}
              {...register}
              {...props}
              className="sr-only peer"
            />
            <div
              className={`w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-normal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${checkedBgColor} ${className}`}
            />
          </label>
          {(onLabel || offLabel) && (
            <span className="ml-2 text-sm text-neutral-600">
              {checked ? onLabel || 'On' : offLabel || 'Off'}
            </span>
          )}
        </div>
        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
