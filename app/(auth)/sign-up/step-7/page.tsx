'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { TrashIcon, PlusIcon, CheckmarkIcon } from '@/components/ui/icons';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import {
  useGetAvailableTradesQuery,
  useSubmitOnboardingStepMutation,
} from '@/store/onboarding';

export default function Step7Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(7);
  const { data: availableTrades, isLoading: isLoadingTrades } = useGetAvailableTradesQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();
  const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set());
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [newCustomType, setNewCustomType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Restore data from onboardingData if available
  useEffect(() => {
    const step7Data = onboardingData?.steps_data?.['7'];
    if (step7Data) {
      // Restore selected_ids (convert strings to numbers)
      if (step7Data.selected_ids && Array.isArray(step7Data.selected_ids)) {
        const selectedIds = step7Data.selected_ids.map((id) => Number(id));
        setSelectedTypes(new Set(selectedIds));
      }

      // Restore other_trades
      if (step7Data.other_trades && Array.isArray(step7Data.other_trades)) {
        setCustomTypes(step7Data.other_trades);
      }
    }
  }, [onboardingData]);

  const toggleBusinessType = (id: number) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTypes(newSelected);
  };

  const handleAddCustomType = () => {
    if (newCustomType.trim()) {
      setCustomTypes([...customTypes, newCustomType.trim()]);
      setNewCustomType('');
      setShowCustomInput(false);
    }
  };

  const handleDeleteCustomType = (index: number) => {
    setCustomTypes(customTypes.filter((_, i) => i !== index));
  };

  const handleUpdateCustomType = (index: number, value: string) => {
    const updated = [...customTypes];
    updated[index] = value;
    setCustomTypes(updated);
  };

  const handleContinue = async () => {
    try {
      // Convert selectedTypes Set<number> to selected_ids string[]
      const selectedIds = Array.from(selectedTypes).map((id) => String(id));
      
      // Prepare the request body
      const requestBody: {
        step: number;
        selected_ids?: string[];
        other_trades?: string[];
      } = {
        step: 7,
      };

      // Only include selected_ids if there are any selected
      if (selectedIds.length > 0) {
        requestBody.selected_ids = selectedIds;
      }

      // Only include other_trades if there are any custom types
      if (customTypes.length > 0) {
        requestBody.other_trades = customTypes;
      }

      // Submit the onboarding step
      await submitOnboardingStep(requestBody).unwrap();
      
      // Navigate to next step on success
      router.push('/sign-up/step-8');
    } catch (error) {
      console.error('Failed to submit onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  const selectedCount = selectedTypes.size + customTypes.length;

  if (isLoadingTrades) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            What type of business do you run?
          </h1>
          <p className="text-sm sm:text-base text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          What type of business do you run?
        </h1>
        <p className="text-sm sm:text-base text-secondary">
          Select all that apply. This customizes your booking flow and services.
        </p>
      </div>

      {/* Business Type Selection */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8 mb-6 sm:mb-8 max-w-[928px] w-full mx-auto">
        {availableTrades?.map((category) => (
          <div
            key={category.id}
            className="bg-primary-light pt-4 sm:pt-5 md:pt-[24px] pb-6 sm:pb-8 md:pb-[42px] px-4 sm:px-5 md:px-[24px] rounded-[12px]"
          >
            <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {category.trades.map((trade) => {
                const isSelected = selectedTypes.has(trade.id);
                return (
                  <button
                    key={trade.id}
                    type="button"
                    onClick={() => toggleBusinessType(trade.id)}
                    className={`flex items-center p-3 sm:p-4 rounded-[12px] border transition-all text-left border-primary-normal`}
                  >
                    <div className="flex items-center mr-2 sm:mr-3">
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all border-primary-normal bg-primary-light`}
                      >
                        {isSelected && (
                          <CheckmarkIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-normal" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isSelected ? 'text-strong' : 'text-secondary'
                      }`}
                    >
                      {trade.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Other / Custom Business Type */}
        <div className="bg-primary-light p-4 sm:p-5 md:p-[24px] rounded-[12px] pb-8 sm:pb-10 md:pb-[54px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">Other:</h2>

          {/* Existing Custom Types */}
          {customTypes.map((customType, index) => (
            <div key={index} className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => handleUpdateCustomType(index, e.target.value)}
                  className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border border-neutral-300 bg-white text-sm sm:text-base text-strong focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCustomType(index)}
                  className="w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] sm:min-w-[48px] rounded-lg bg-error flex items-center justify-center transition-all hover:opacity-90"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] sm:min-w-[48px] bg-primary-normal rounded-lg flex items-center justify-center transition-all hover:opacity-90 text-white"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Custom Type Input */}
          {showCustomInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter your business type"
                value={newCustomType}
                onChange={(e) => setNewCustomType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCustomType.trim()) {
                    handleAddCustomType();
                  } else if (e.key === 'Escape') {
                    setShowCustomInput(false);
                    setNewCustomType('');
                  }
                }}
                autoFocus
                className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border border-neutral-300 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setNewCustomType('');
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] sm:min-w-[48px] rounded-lg bg-danger flex items-center justify-center transition-all hover:opacity-90"
              >
                <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={handleAddCustomType}
                disabled={!newCustomType.trim()}
                className="w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] sm:min-w-[48px] bg-primary-normal rounded-lg flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="flex items-center justify-center p-3 sm:p-4 rounded-[12px] border border-dashed border-primary-normal w-full min-w-0 bg-primary-light-active hover:border-neutral-300 transition-all"
            >
              <span className="text-xs sm:text-sm font-medium text-text-emphasis">
                Add custom business type
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      {selectedCount > 0 && (
        <div className="bg-neutral-75 rounded-[12px] px-4 sm:px-5 md:px-[24px] py-3 sm:py-4 mb-6 sm:mb-8 max-w-[928px] w-full mx-auto">
          <p className="text-xs sm:text-sm text-secondary font-semibold">
            <span className="font-bold text-strong">
              {selectedCount} business type{selectedCount !== 1 ? 's' : ''} selected:
            </span>{' '}
            We'll generate relevant services and customize your booking flow based on your
            selection.
          </p>
        </div>
      )}

      {/* Activate Account Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting}
          className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Activate account'}
        </Button>
      </div>
    </div>
  );
}
