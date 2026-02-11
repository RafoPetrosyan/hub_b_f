'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface TimePickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'type'
> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  containerClassName?: string;
  onChange?: (time: string | null) => void;
  value?: string | null;
  placeholderText?: string;
  timeFormat?: 'HH:mm' | 'HH:mm:ss';
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
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
      placeholderText = 'Select time',
      timeFormat = 'HH:mm',
      ...props
    },
    ref
  ) => {
    const timePickerId = id || `timepicker-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!errorMessage;
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>(value || '');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState<number | null>(null);
    const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hourScrollRef = useRef<HTMLDivElement>(null);
    const minuteScrollRef = useRef<HTMLDivElement>(null);

    // Parse time string to hours and minutes
    const parseTime = (time: string): { hour: number | null; minute: number | null } => {
      if (!time || time.length < 5) return { hour: null, minute: null };
      const parts = time.split(':');
      if (parts.length < 2) return { hour: null, minute: null };
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      if (isNaN(hour) || isNaN(minute)) return { hour: null, minute: null };
      return { hour, minute };
    };

    // Format hours and minutes to time string
    const formatTime = (hour: number | null, minute: number | null): string => {
      if (hour === null || minute === null) return '';
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      return `${hourStr}:${minuteStr}`;
    };

    // Sync with controlled value prop
    useEffect(() => {
      if (value !== undefined) {
        setSelectedTime(value || '');
        const { hour, minute } = parseTime(value || '');
        setSelectedHour(hour);
        setSelectedMinute(minute);
      }
    }, [value]);

    // Scroll to selected values when popup opens
    useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          if (selectedHour !== null && hourScrollRef.current) {
            const hourElement = hourScrollRef.current.querySelector(
              `[data-hour="${selectedHour}"]`
            );
            if (hourElement) {
              hourElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
          if (selectedMinute !== null && minuteScrollRef.current) {
            const minuteElement = minuteScrollRef.current.querySelector(
              `[data-minute="${selectedMinute}"]`
            );
            if (minuteElement) {
              minuteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
      }
    }, [isOpen, selectedHour, selectedMinute]);

    const handleTimeChange = (hour: number | null, minute: number | null) => {
      const formattedTime = formatTime(hour, minute);
      setSelectedTime(formattedTime);
      setSelectedHour(hour);
      setSelectedMinute(minute);

      // Update hidden input for react-hook-form
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = formattedTime;

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
        onChange(formattedTime || null);
      }
    };

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
      if (element && !value && !selectedTime) {
        setTimeout(() => {
          const defaultValue = element.value || '';
          if (defaultValue) {
            setSelectedTime(defaultValue);
            const { hour, minute } = parseTime(defaultValue);
            setSelectedHour(hour);
            setSelectedMinute(minute);
          }
        }, 0);
      }
    };

    // Generate hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    // Generate minutes (0-59)
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const displayTime = selectedTime
      ? (() => {
          const { hour, minute } = parseTime(selectedTime);
          if (hour === null || minute === null) return placeholderText;
          const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const minuteStr = minute.toString().padStart(2, '0');
          return `${hour12}:${minuteStr} ${ampm}`;
        })()
      : placeholderText;

    return (
      <div className={containerClassName} ref={wrapperRef}>
        {label && (
          <label htmlFor={timePickerId} className="block text-sm font-medium text-neutral-700 mb-2">
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
            value={selectedTime}
            {...props}
          />
        )}

        <div className="relative">
          <input
            id={timePickerId}
            type="text"
            readOnly
            disabled={disabled}
            value={displayTime}
            placeholder={placeholderText}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`w-full px-4 py-3 rounded-lg border ${
              hasError ? 'border-error' : 'border-neutral-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent transition-all cursor-pointer ${
              disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'
            } ${className}`}
            {...props}
          />

          {/* Clock icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Time Picker Popup */}
          {isOpen && !disabled && (
            <div className="absolute z-50 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl p-4 min-w-[300px]">
              <div className="flex gap-3">
                {/* Hours Column */}
                <div className="flex-1">
                  <div className="text-xs font-semibold text-neutral-600 mb-2 text-center uppercase tracking-wide">
                    Hour
                  </div>
                  <div
                    ref={hourScrollRef}
                    className="h-56 overflow-y-auto border border-neutral-200 rounded-md bg-neutral-50 time-picker-scroll"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6',
                    }}
                  >
                    {hours.map((hour) => {
                      const isSelected = selectedHour === hour;
                      return (
                        <button
                          key={hour}
                          type="button"
                          data-hour={hour}
                          onClick={() => handleTimeChange(hour, selectedMinute)}
                          className={`w-full py-2.5 px-3 text-sm rounded-md transition-all duration-150 ${
                            isSelected
                              ? 'bg-primary-normal text-white font-semibold shadow-sm'
                              : 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
                          }`}
                        >
                          {hour.toString().padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minutes Column */}
                <div className="flex-1">
                  <div className="text-xs font-semibold text-neutral-600 mb-2 text-center uppercase tracking-wide">
                    Minute
                  </div>
                  <div
                    ref={minuteScrollRef}
                    className="h-56 overflow-y-auto border border-neutral-200 rounded-md bg-neutral-50 time-picker-scroll"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6',
                    }}
                  >
                    {minutes.map((minute) => {
                      const isSelected = selectedMinute === minute;
                      return (
                        <button
                          key={minute}
                          type="button"
                          data-minute={minute}
                          onClick={() => handleTimeChange(selectedHour, minute)}
                          className={`w-full py-2.5 px-3 text-sm rounded-md transition-all duration-150 ${
                            isSelected
                              ? 'bg-primary-normal text-white font-semibold shadow-sm'
                              : 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
                          }`}
                        >
                          {minute.toString().padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer with current selection */}
              <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div className="text-sm">
                  {selectedHour !== null && selectedMinute !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-600">Selected:</span>
                      <span className="font-semibold text-neutral-900">
                        {formatTime(selectedHour, selectedMinute)}
                      </span>
                      <span className="text-xs text-neutral-400">
                        (
                        {(() => {
                          const hour12 =
                            selectedHour === 0
                              ? 12
                              : selectedHour > 12
                                ? selectedHour - 12
                                : selectedHour;
                          const ampm = selectedHour >= 12 ? 'PM' : 'AM';
                          return `${hour12}:${selectedMinute.toString().padStart(2, '0')} ${ampm}`;
                        })()}
                        )
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">No time selected</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleTimeChange(null, null);
                    setIsOpen(false);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {helperText && !hasError && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
        {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';

export default TimePicker;
