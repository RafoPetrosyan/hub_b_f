'use client';

import { useState } from 'react';
import { Input, Switch, Select } from '@/components/ui';
import { NOTICE_UNITS } from '@/constants/staticData';

export default function CancellationTab() {
  const [cancellationPolicyEnabled, setCancellationPolicyEnabled] = useState(true);
  const [minimumNotice, setMinimumNotice] = useState('24');
  const [noticeUnit, setNoticeUnit] = useState('hours');
  const [feeType, setFeeType] = useState('percentage');
  const [feePercentage, setFeePercentage] = useState('50');
  const [feeAmount, setFeeAmount] = useState('');

  return (
    <div className="space-y-8">
      {/* Cancellation Policy Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Cancellation Policy</h2>
        </div>
        <p className="text-sm text-neutral-600 ml-[52px]">
          Set rules for booking cancellations and fees
        </p>
      </div>

      {/* Enable Cancellation Policy */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-neutral-700 mb-1 block">
            Enable Cancellation Policy
          </label>
          <p className="text-sm text-neutral-500">
            Require clients to follow cancellation rules
          </p>
        </div>
        <div>
          <Switch
            checked={cancellationPolicyEnabled}
            onChange={(e) =>
              setCancellationPolicyEnabled((e.target as HTMLInputElement).checked)
            }
          />
        </div>
      </div>

      {cancellationPolicyEnabled && (
        <>
          {/* Minimum Cancellation Notice */}
          <div className="border-t border-neutral-200 pt-8">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Minimum Cancellation Notice
            </label>
            <div className="flex gap-4 items-start">
              <div className="w-24">
                <Input
                  type="number"
                  value={minimumNotice}
                  onChange={(e) => setMinimumNotice(e.target.value)}
                  containerClassName="w-full"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <Select
                  options={NOTICE_UNITS}
                  value={noticeUnit}
                  onChange={(value) => setNoticeUnit(value)}
                  containerClassName="w-full"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Clients must cancel at least this much time before their appointment
            </p>
          </div>

          {/* Cancellation Fee */}
          <div className="border-t border-neutral-200 pt-8">
            <label className="block text-sm font-medium text-neutral-700 mb-4">
              Cancellation Fee
            </label>
            <div className="flex gap-4 mb-6">
              <div className="flex items-center">
                <input
                  id="fee-fixed"
                  type="radio"
                  name="feeType"
                  value="fixed"
                  checked={feeType === 'fixed'}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <label
                  htmlFor="fee-fixed"
                  className="ml-2 text-sm font-medium text-neutral-700 cursor-pointer"
                >
                  Fixed Amount
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="fee-percentage"
                  type="radio"
                  name="feeType"
                  value="percentage"
                  checked={feeType === 'percentage'}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <label
                  htmlFor="fee-percentage"
                  className="ml-2 text-sm font-medium text-neutral-700 cursor-pointer"
                >
                  Percentage of Service Price
                </label>
              </div>
            </div>

            {feeType === 'percentage' ? (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Fee Percentage
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <Input
                    type="number"
                    value={feePercentage}
                    onChange={(e) => setFeePercentage(e.target.value)}
                    containerClassName="flex-1"
                  />
                  <span className="text-sm font-medium text-neutral-700">%</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Fee Amount
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <span className="text-sm font-medium text-neutral-700">$</span>
                  <Input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    containerClassName="flex-1"
                  />
                </div>
              </div>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              This fee will be charged for late cancellations
            </p>
          </div>

          {/* Client Preview */}
          <div className="border-t border-neutral-200 pt-8">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">
                    Please cancel at least {minimumNotice} {noticeUnit} before your
                    appointment. Late cancellations or no-shows will be charged{' '}
                    {feeType === 'percentage'
                      ? `${feePercentage}% of the service price`
                      : `$${feeAmount || '0'}`}
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}




