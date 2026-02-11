'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import ReactSelect, { StylesConfig } from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'ref'
> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  labelClassName?: string;
  borderClassName?: string;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      register,
      options,
      placeholder,
      containerClassName = '',
      labelClassName = '',
      className = '',
      borderClassName = '',
      id,
      disabled,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);

    // Initialize value from props or empty string
    const [internalValue, setInternalValue] = useState<string>(
      value !== undefined ? (value as string) : ''
    );

    // Sync with controlled value prop
    useEffect(() => {
      if (value !== undefined && value !== internalValue) {
        setInternalValue(value as string);
        // Also update hidden input if it exists
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = value as string;
        }
      }
    }, [value, internalValue]);

    // Find the selected option
    // Ensure options is always an array
    const validOptions = Array.isArray(options) ? options : [];
    const selectedOption = validOptions.find((opt) => opt.value === internalValue) || null;

    // Handle value change
    const handleChange = (selectedOption: SelectOption | null) => {
      const newValue = selectedOption?.value || '';
      setInternalValue(newValue);

      // Update hidden input for react-hook-form
      if (hiddenInputRef.current) {
        // Set the value
        hiddenInputRef.current.value = newValue;

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
        onChange(newValue);
      }
    };

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

      // Sync initial value from the hidden input after registration
      // This handles react-hook-form default values
      if (element && !value && !internalValue) {
        // Use setTimeout to ensure react-hook-form has set the default value
        setTimeout(() => {
          const defaultValue = element.value || '';
          if (defaultValue && defaultValue !== internalValue) {
            setInternalValue(defaultValue);
          }
        }, 0);
      }
    };

    // Filter out select-specific props that don't apply to input
    const inputProps = (() => {
      const { multiple, size, ...rest } = props as Record<string, unknown>;
      return rest as React.InputHTMLAttributes<HTMLInputElement>;
    })();

    // Custom styles for react-select to match the design
    const customStyles: StylesConfig<SelectOption, false> = {
      control: (base, state) => ({
        ...base,
        minHeight: '48px',
        padding: '0 4px',
        borderRadius: '8px',
        border: `1px solid ${hasError ? 'var(--error)' : state.isFocused ? 'var(--primary-normal)' : `var(--neutral-300) ${borderClassName}`}`,
        boxShadow: state.isFocused ? `0 0 0 2px rgba(14, 165, 233, 0.2)` : 'none',
        backgroundColor: disabled ? 'var(--neutral-100)' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        '&:hover': {
          border: `1px solid ${hasError ? 'var(--error)' : state.isFocused ? 'var(--primary-normal)' : 'var(--neutral-300)'}`,
        },
        transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }),
      placeholder: (base) => ({
        ...base,
        color: '#9ca3af',
      }),
      singleValue: (base) => ({
        ...base,
        color: '#111827',
      }),
      input: (base) => ({
        ...base,
        color: '#111827',
      }),
      menu: (base) => ({
        ...base,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid var(--neutral-200)',
        marginTop: '4px',
        zIndex: 99999,
      }),
      menuPortal: (base) => ({
        ...base,
        zIndex: 99999,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? 'var(--primary-normal-active)'
          : state.isFocused
            ? 'var(--primary-light)'
            : 'white',
        color: state.isSelected ? 'white' : 'var(--neutral-700)',
        cursor: 'pointer',
        padding: '12px 16px',
        '&:active': {
          backgroundColor: state.isSelected
            ? 'var(--primary-light-active)'
            : 'var(--primary-light)',
        },
      }),
      indicatorSeparator: () => ({
        display: 'none',
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--neutral-500)',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 150ms ease',
        '&:hover': {
          color: 'var(--neutral-700)',
        },
      }),
    };

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-sm font-medium text-neutral-700 mb-2 ${labelClassName}`}
          >
            {label} {required && <span className="text-error">*</span>}
          </label>
        )}

        {/* Hidden input for react-hook-form integration */}
        {register && registerProps && (
          <input type="hidden" ref={setHiddenInputRef} {...registerProps} {...inputProps} />
        )}

        <ReactSelect<SelectOption, false>
          inputId={selectId}
          instanceId={selectId}
          options={validOptions}
          value={selectedOption}
          onChange={handleChange}
          placeholder={placeholder || 'Select an option...'}
          isDisabled={disabled}
          isSearchable={true}
          styles={customStyles}
          className={className}
          classNamePrefix="react-select"
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          menuShouldScrollIntoView={true}
          menuShouldBlockScroll={true}
        />

        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
