'use client';

import React, { useRef, useEffect, useState } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import PhoneInputLib from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'type'
> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  labelClassName?: string;
  value?: string | undefined;
  onChange?: (value: string | undefined) => void;
  defaultCountry?: string;
  international?: boolean;
  withCountryCallingCode?: boolean;
}

const PhoneInputComponent = React.forwardRef<HTMLInputElement, PhoneInputProps>(
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
      value,
      defaultValue,
      onChange,
      defaultCountry = 'us',
      international = true,
      ...props
    },
    ref
  ) => {
    const inputId = id || `phone-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const [phoneValue, setPhoneValue] = useState<string>(
      // @ts-ignore
      value !== undefined ? value : defaultValue || ''
    );

    // Sync with controlled value prop
    useEffect(() => {
      if (value !== undefined && value !== phoneValue) {
        setPhoneValue(value);
      }
    }, [value, phoneValue]);

    // Extract register props (excluding ref which we'll handle separately)
    const registerProps = register
      ? (() => {
          const { ref: _registerRef, ...rest } = register;
          return rest;
        })()
      : null;

    // Ref callback to integrate with register and component ref
    const setHiddenInputRef = (element: HTMLInputElement | null) => {
      hiddenInputRef.current = element;

      // Integrate with register ref
      if (register?.ref) {
        if (typeof register.ref === 'function') {
          register.ref(element);
        } else if (register.ref && 'current' in register.ref) {
          (register.ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
        }
      }

      // Integrate with component ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref && 'current' in ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
        }
      }
    };

    // Sync value with hidden input for react-hook-form
    useEffect(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = phoneValue || '';
      }
    }, [phoneValue]);

    // Handle phone number change
    const handleChange = (phoneValue: string) => {
      setPhoneValue(phoneValue);

      // Update hidden input for react-hook-form
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = phoneValue;

        // Create and dispatch input event (react-hook-form listens to this)
        const inputEvent = new Event('input', { bubbles: true });
        Object.defineProperty(inputEvent, 'target', {
          writable: false,
          value: hiddenInputRef.current,
        });
        hiddenInputRef.current.dispatchEvent(inputEvent);

        // Also dispatch change event
        const changeEvent = new Event('change', { bubbles: true });
        Object.defineProperty(changeEvent, 'target', {
          writable: false,
          value: hiddenInputRef.current,
        });
        hiddenInputRef.current.dispatchEvent(changeEvent);
      }

      // Call custom onChange if provided
      if (onChange) {
        onChange(phoneValue || undefined);
      }
    };

    // Filter out phone-specific props that don't apply to input
    const inputProps = (() => {
      const { multiple, size, ...rest } = props as Record<string, unknown>;
      return rest as React.InputHTMLAttributes<HTMLInputElement>;
    })();

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

        {/* Hidden input for react-hook-form integration */}
        {register && registerProps && (
          <input type="hidden" ref={setHiddenInputRef} {...registerProps} {...inputProps} />
        )}

        <div className="relative w-full">
          <div
            className={`
    relative flex h-12 w-full items-center rounded-lg border bg-white
    ${hasError ? 'border-red-500' : 'border-neutral-300'}
    focus-within:border-primary-normal
    focus-within:ring-2 focus-within:ring-primary-normal/20
  `}
          >
            <PhoneInputLib
              country={defaultCountry}
              value={phoneValue}
              onChange={handleChange}
              disabled={disabled}
              inputProps={{
                id: inputId,
                name: inputId,
                required,
                disabled,
                className: `phone-input-field ${hasError ? 'phone-input-error' : ''} ${className}`,
              }}
              containerClass={`phone-input-container ${hasError ? 'phone-input-error' : ''}`}
              buttonClass="phone-input-button"
              inputClass="phone-input-input"
              dropdownClass="phone-input-dropdown"
            />
          </div>
        </div>

        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

PhoneInputComponent.displayName = 'PhoneInput';

export default PhoneInputComponent;
