'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

export interface DatePickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  onChange?: (date: Date | null) => void;
  value?: Date | string | null;
  placeholderText?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
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
      onChange,
      value,
      placeholderText = 'Select a date',
      dateFormat = 'MM/dd/yyyy',
      minDate,
      maxDate,
      ...props
    },
    ref
  ) => {
    const datePickerId = id || `datepicker-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      value ? (value instanceof Date ? value : new Date(value)) : undefined
    );
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Convert value to Date if it's a string
    const getDateValue = (): Date | undefined => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
      }
      return undefined;
    };

    // Sync with controlled value prop
    useEffect(() => {
      if (value !== undefined) {
        const dateValue = getDateValue();
        setSelectedDate(dateValue);
      }
    }, [value]);

    // Close popup when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [isOpen]);

    const handleDateSelect = (date: Date | undefined) => {
      setSelectedDate(date);

      // Update hidden input for react-hook-form
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = date ? date.toISOString() : '';

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

      if (onChange) {
        onChange(date || null);
      }

      setIsOpen(false);
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
      if (element && !value && !selectedDate) {
        setTimeout(() => {
          const defaultValue = element.value || '';
          if (defaultValue) {
            const date = new Date(defaultValue);
            if (!isNaN(date.getTime())) {
              setSelectedDate(date);
            }
          }
        }, 0);
      }
    };

    const displayValue = selectedDate ? format(selectedDate, dateFormat) : '';

    return (
      <div className={containerClassName} ref={wrapperRef}>
        {label && (
          <label htmlFor={datePickerId} className="block text-sm font-medium text-neutral-700 mb-2">
            {label} {required && <span className="text-error">*</span>}
            {!required && label.includes('(Optional)') === false && (
              <span className="text-neutral-400 text-xs">(Optional)</span>
            )}
          </label>
        )}

        {/* Hidden input for react-hook-form integration */}
        {register && registerProps && (
          <input
            type="hidden"
            ref={setHiddenInputRef}
            {...registerProps}
            value={selectedDate ? selectedDate.toISOString() : ''}
            {...props}
          />
        )}

        <div className="relative">
          <input
            id={datePickerId}
            type="text"
            readOnly
            disabled={disabled}
            value={displayValue}
            placeholder={placeholderText}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`w-full px-4 py-3 rounded-lg border ${
              hasError ? 'border-error' : 'border-neutral-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent transition-all cursor-pointer ${
              disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'
            } ${className}`}
          />

          {isOpen && !disabled && (
            <div className="absolute z-50 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabled}
                fromDate={minDate}
                toDate={maxDate}
              />
            </div>
          )}
        </div>

        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
