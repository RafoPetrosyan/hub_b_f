'use client';

import React from 'react';
import ReactSelect, { StylesConfig } from 'react-select';

export type AmountUnit = 'percentage' | 'fixed';

export interface AmountInputOption {
  value: AmountUnit;
  label: string; // e.g. '%' or '$'
}

export interface AmountInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  unit: AmountUnit;
  onUnitChange: (unit: AmountUnit) => void;
  options?: AmountInputOption[];
  placeholder?: string;
  disabled?: boolean;
  containerClassName?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  'aria-label'?: string;
}

const DEFAULT_OPTIONS: AmountInputOption[] = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: '$' },
];

type UnitOption = { value: AmountUnit; label: string };

const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      label,
      value,
      onChange,
      unit,
      onUnitChange,
      options = DEFAULT_OPTIONS,
      placeholder,
      disabled = false,
      containerClassName = '',
      inputMode = 'decimal',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const validOptions: UnitOption[] = Array.isArray(options) ? options : DEFAULT_OPTIONS;
    const selectedOption = validOptions.find((o) => o.value === unit) ?? null;

    const unitSelectStyles: StylesConfig<UnitOption, false> = {
      control: (base, state) => ({
        ...base,
        minHeight: '48px',
        height: '48px',
        padding: '0 8px 0 12px',
        borderRadius: '8px 0 0 8px',
        border: 'none',
        borderRight: '2px solid var(--border-default) border-r-none',
        boxShadow: 'none',
        backgroundColor: 'var(--neutral-50)',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'var(--neutral-200)',
        },
        transition: 'background-color 150ms ease',
      }),
      singleValue: (base) => ({
        ...base,
        color: 'var(--d-content-item-title)',
        fontSize: '14px',
        fontWeight: 500,
      }),
      valueContainer: (base) => ({
        ...base,
        padding: 0,
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: 'var(--d-content-item-title)',
      }),
      indicatorSeparator: () => ({ display: 'none' }),
      dropdownIndicator: (base, state) => ({
        ...base,
        padding: '0 8px',
        color: 'var(--neutral-500)',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 150ms ease',
        '&:hover': {
          color: 'var(--neutral-700)',
        },
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
          ? 'var(--d-accent)'
          : state.isFocused
            ? 'var(--d-accent-light)'
            : 'white',
        color: state.isSelected ? 'white' : 'var(--d-content-item-title)',
        cursor: 'pointer',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 500,
      }),
    };

    const handleUnitChange = (option: UnitOption | null) => {
      if (option) onUnitChange(option.value);
    };

    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
            {label}
          </label>
        )}
        <div
          className={`
            flex items-stretch w-full  min-h-12
            rounded-lg border-2 border-border-default
            bg-white overflow-hidden
            ${disabled ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
          {/* Unit dropdown - React Select, grey background, rounded left only */}
          <div className="w-[88px] shrink-0 [&_.react-select__control]:rounded-r-none">
            <ReactSelect<UnitOption, false>
              options={validOptions}
              value={selectedOption}
              onChange={handleUnitChange}
              isDisabled={disabled}
              isSearchable={false}
              styles={unitSelectStyles}
              classNamePrefix="react-select"
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              menuShouldScrollIntoView={true}
              aria-label="Amount unit"
            />
          </div>

          {/* Number input - middle section */}
          <input
            ref={ref}
            type="text"
            inputMode={inputMode}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel ?? label ?? 'Amount'}
            className="
              flex-1 min-w-0 h-12 px-4 py-3
              border-0 rounded-none
              bg-white
              text-sm font-medium text-d-content-item-title
              placeholder:text-d-content-item-sub-title
              focus:outline-none focus:ring-0
            "
          />

          {/* Static unit display - right section */}
          <div
            className="flex items-center justify-center shrink-0 min-w-[44px] pr-4 pl-2 bg-white"
            aria-hidden
          >
            <span className="text-sm font-medium text-d-content-item-title">
              {selectedOption?.label ?? '%'}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

AmountInput.displayName = 'AmountInput';

export default AmountInput;
