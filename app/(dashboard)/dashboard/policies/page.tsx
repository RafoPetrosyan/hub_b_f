'use client';

import { useState, useMemo } from 'react';
import { Button, Input, Switch, Select, Textarea, AmountInput } from '@/components/ui';
import type { SelectOption } from '@/components/ui';

const CANCELLATION_WINDOW_OPTIONS: SelectOption[] = [
  { value: '12_hours', label: '12 hours' },
  { value: '24_hours', label: '24 hours' },
  { value: '48_hours', label: '48 hours' },
  { value: '72_hours', label: '72 hours' },
  { value: '7_days', label: '7 days' },
];

const DEFAULT_CANCELLATION_TEXT =
  'Cancellations must be made at least 24 hours in advance. Late cancellations or no-shows will be charged 50% of the service price.';
const DEFAULT_LATENESS_TEXT =
  'We ask that you arrive 10 minutes early for your appointment. If you are more than 15 minutes late, we may need to reschedule or shorten your service.';
const DEFAULT_PAYMENT_TEXT =
  'Payment is due at the time of service. We accept all major credit cards, debit cards, and cash.';

export default function PoliciesPage() {
  const [cancellationWindow, setCancellationWindow] = useState('24_hours');
  const [lateCancellationEnabled, setLateCancellationEnabled] = useState(true);
  const [feeType, setFeeType] = useState('percentage');
  const [feeValue, setFeeValue] = useState('50');
  const [cancellationPolicyText, setCancellationPolicyText] = useState(DEFAULT_CANCELLATION_TEXT);

  const [noShowEnabled, setNoShowEnabled] = useState(true);
  const [noShowFee, setNoShowFee] = useState('100');

  const [latenessPolicyText, setLatenessPolicyText] = useState(DEFAULT_LATENESS_TEXT);
  const [paymentPolicyText, setPaymentPolicyText] = useState(DEFAULT_PAYMENT_TEXT);

  const previewCancellation = useMemo(() => {
    return cancellationPolicyText.trim() || DEFAULT_CANCELLATION_TEXT;
  }, [cancellationPolicyText]);

  const previewLateness = useMemo(() => {
    return latenessPolicyText.trim() || DEFAULT_LATENESS_TEXT;
  }, [latenessPolicyText]);

  const previewPayment = useMemo(() => {
    return paymentPolicyText.trim() || DEFAULT_PAYMENT_TEXT;
  }, [paymentPolicyText]);

  const handleSave = () => {
    // TODO: persist to API when backend is ready
  };

  return (
    <div>
      <div className="max-w-[1600px]">
        <div className="mb-[12px]">
          <h1 className="text-xl font-bold text-d-title mb-2">Policies</h1>
          <p className="text-sm text-d-sub-title font-medium">
            Set rules for appointment cancellations.
          </p>
        </div>

        <div className="space-y-4">
          {/* Cancellation Policy */}
          <div className="bg-d-content-item-bg rounded-[12px] p-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <h2 className="text-xl font-bold text-d-content-item-title">Cancellation Policy</h2>
            <p className="text-sm text-d-content-item-sub-title font-medium mb-6">
              Set rules for appointment cancellations.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  CANCELLATION WINDOW
                </label>
                <Select
                  options={CANCELLATION_WINDOW_OPTIONS}
                  value={cancellationWindow}
                  onChange={setCancellationWindow}
                  containerClassName="w-full max-w-[280px]"
                />
                <p className="mt-1 text-xs text-d-content-item-sub-title font-medium">
                  Minimum time before appointment to cancel without penalty.
                </p>
              </div>

              <div className="bg-d-content-bg rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={lateCancellationEnabled}
                    onChange={(e) =>
                      setLateCancellationEnabled((e.target as HTMLInputElement).checked)
                    }
                    className="flex-shrink-0"
                    variant="dashboard"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-d-content-item-title">
                      Late cancellation fee
                    </h3>
                    <p className="text-sm text-d-content-item-sub-title mt-0.5 font-medium">
                      Charge a fee for cancellations within the window.
                    </p>
                  </div>
                </div>
                {lateCancellationEnabled && (
                  <div className="mt-[22px]">
                    <AmountInput
                      label="AMOUNT"
                      value={feeValue}
                      onChange={setFeeValue}
                      unit={feeType as 'percentage' | 'fixed'}
                      onUnitChange={(u) => setFeeType(u)}
                      containerClassName="!max-w-[391px] w-[391px]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  CANCELLATION POLICY TEXT
                </label>
                <Textarea
                  value={cancellationPolicyText}
                  onChange={(e) => setCancellationPolicyText(e.target.value)}
                  rows={3}
                  containerClassName="w-full"
                  className="!border-border-default border-2"
                />
                <p className="mt-1 text-xs text-d-content-item-sub-title font-medium">
                  This will be shown to clients when booking.
                </p>
              </div>
            </div>
          </div>

          {/* No-Show Policy */}
          <div className="bg-d-content-item-bg rounded-[12px] p-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <h2 className="text-xl font-bold text-d-content-item-title">No-Show Policy</h2>
            <p className="text-sm text-d-content-item-sub-title font-medium mb-6">
              Set fees for missed appointments.
            </p>

            <div className="space-y-6">
              <div className="bg-d-content-bg rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={noShowEnabled}
                    onChange={(e) => setNoShowEnabled((e.target as HTMLInputElement).checked)}
                    className="flex-shrink-0"
                    variant="dashboard"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-d-content-item-title">No-show fee</h3>
                    <p className="text-sm text-d-content-item-sub-title mt-0.5 font-medium">
                      Charge clients who don&apos;t show up for appointments.
                    </p>
                  </div>
                </div>
              </div>

              {noShowEnabled && (
                <div>
                  <Input
                    label="NO-SHOW FEE"
                    labelClassName="!text-xs font-medium text-neutral-700 uppercase tracking-wide"
                    type="text"
                    inputMode="decimal"
                    value={noShowFee}
                    onChange={(e) => setNoShowFee(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="100"
                    prefixIcon={
                      <span className="text-d-content-item-sub-title font-medium">$</span>
                    }
                    containerClassName="w-full max-w-[280px]"
                    borderClassName="!border-border-default border-2"
                    prefixInputStyle="!pl-6"
                  />
                  <p className="mt-1 text-xs text-d-content-item-sub-title font-medium">
                    Fixed fee charged for no-shows.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Policies */}
          <div className="bg-d-content-item-bg rounded-[12px] p-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <h2 className="text-xl font-bold text-d-content-item-title">Additional Policies</h2>
            <p className="text-sm text-d-content-item-sub-title font-medium mb-6">
              Set other business policies.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  LATENESS POLICY
                </label>
                <Textarea
                  value={latenessPolicyText}
                  onChange={(e) => setLatenessPolicyText(e.target.value)}
                  rows={3}
                  containerClassName="w-full"
                  className="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  PAYMENT POLICY
                </label>
                <Textarea
                  value={paymentPolicyText}
                  onChange={(e) => setPaymentPolicyText(e.target.value)}
                  rows={3}
                  containerClassName="w-full"
                  className="!border-border-default border-2"
                />
              </div>
            </div>
          </div>

          {/* Client Preview */}
          <div className="bg-d-content-item-bg rounded-[12px] p-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <h2 className="text-xl font-bold text-d-content-item-title">Client Preview</h2>
            <p className="text-sm text-d-content-item-sub-title font-medium mb-6">
              How policies appear to clients.
            </p>

            <div className="space-y-4 bg-d-content-bg rounded-xl p-4 sm:p-5">
              <div>
                <h3 className="text-sm font-bold text-d-content-item-title mb-1">
                  Cancellation Policy
                </h3>
                <p className="text-sm text-d-content-item-sub-title font-medium">
                  {previewCancellation}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-d-content-item-title mb-1">
                  Lateness Policy
                </h3>
                <p className="text-sm text-d-content-item-sub-title font-medium">
                  {previewLateness}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-d-content-item-title mb-1">Payment Policy</h3>
                <p className="text-sm text-d-content-item-sub-title font-medium">
                  {previewPayment}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSave}
              className="!bg-d-accent rounded-full w-[250px]"
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
