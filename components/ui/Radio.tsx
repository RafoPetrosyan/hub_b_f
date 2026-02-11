'use client';

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  options: RadioOption[];
  direction?: 'row' | 'column';
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
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
      options,
      direction = 'column',
      name,
      value,
      ...props
    },
    ref
  ) => {
    const radioGroupId = id || `radio-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;

    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label} {required && <span className="text-error">*</span>}
            {!required && label.includes('(Optional)') === false && (
              <span className="text-neutral-400 text-xs">(Optional)</span>
            )}
          </label>
        )}
        <div className={`flex ${direction === 'row' ? 'flex-row gap-4' : 'flex-col gap-3'}`}>
          {options.map((option, index) => {
            const optionId = `${radioGroupId}-${option.value}`;
            const isOptionDisabled = disabled || option.disabled;
            // Determine checked state: if value prop is provided (from Controller), use it; otherwise let register handle it
            const isChecked = value !== undefined ? value === option.value : undefined;

            return (
              <div key={option.value} className="flex items-center">
                <input
                  id={optionId}
                  type="radio"
                  ref={index === 0 ? ref : undefined}
                  disabled={isOptionDisabled}
                  value={option.value}
                  name={name || radioGroupId}
                  checked={isChecked}
                  {...register}
                  {...props}
                  className={`w-4 h-4 text-primary-normal border-neutral-300 focus:ring-2 focus:ring-primary-normal cursor-pointer transition-all ${
                    isOptionDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${hasError ? 'border-error' : ''} ${className}`}
                />
                <label
                  htmlFor={optionId}
                  className={`ml-2 text-sm font-medium text-neutral-700 ${
                    isOptionDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio;
