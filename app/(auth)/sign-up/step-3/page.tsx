'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { CheckmarkCircleIcon } from '@/components/ui/icons';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { useGetAvailableAddonsQuery, useSubmitOnboardingStepMutation } from '@/store/onboarding';

export default function Step3Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(3);
  const { data: availableAddons, isLoading: isLoadingAddons } = useGetAvailableAddonsQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Restore selected addons from onboarding data when available
  useEffect(() => {
    if (
      onboardingData?.steps_data?.['3']?.addon_ids &&
      Array.isArray(onboardingData.steps_data['3'].addon_ids)
    ) {
      setSelectedAddonIds(onboardingData.steps_data['3'].addon_ids);
    }
  }, [onboardingData]);

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Format price from cents to dollars
  const formatPrice = (priceCents: string) => {
    const dollars = parseFloat(priceCents) / 100;
    return dollars.toFixed(0);
  };

  // Get price suffix based on slug
  const getPriceSuffix = (slug: string) => {
    if (slug === 'additional_users') {
      return '/month/per practitioner';
    }
    return '/month';
  };

  const handleContinue = async () => {
    try {
      await submitOnboardingStep({
        step: 3,
        addon_ids: selectedAddonIds,
      }).unwrap();
      router.push('/sign-up/step-4');
    } catch (error) {
      console.error('Failed to submit onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Add powerful features
        </h1>
        <p className="text-sm sm:text-base text-secondary">
          Enhance your platform with these optional add-ons
        </p>
      </div>

      {/* Addon Cards */}
      {isLoadingAddons ? (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-secondary">Loading addons...</p>
        </div>
      ) : availableAddons && availableAddons.length > 0 ? (
        <div className="grid grid-cols-1 min-[880px]:grid-cols-3 mb-8 sm:mb-12 gap-4 sm:gap-6 min-[880px]:gap-[21px] justify-center">
          {availableAddons.map((addon) => {
            const isSelected = selectedAddonIds.includes(addon.id);
            const price = formatPrice(addon.price_cents);
            const priceSuffix = getPriceSuffix(addon.slug);

            return (
              <div
                key={addon.id}
                className={`relative rounded-[16px] sm:rounded-[24px] border px-4 sm:px-6 md:px-[24px] pt-6 sm:pt-8 md:pt-[32px] pb-4 sm:pb-5 md:pb-[19px] transition-all flex flex-col ${
                  isSelected
                    ? 'border-primary-normal shadow-lg bg-primary-light'
                    : 'border-neutral-200'
                }`}
              >
                {/* Addon Content */}
                <div className="flex-grow">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-strong mb-1">{addon.name}</h3>
                    <p className="text-sm sm:text-base text-secondary mb-2">{addon.description}</p>
                    <p className="text-4xl sm:text-display-xl md:text-display-2xl lg:text-display-3xl font-bold text-strong mb-2 sm:mb-3">
                      ${price}
                      <span className="text-base sm:text-lg md:text-lg text-secondary ml-[2px]">{priceSuffix}</span>
                    </p>
                  </div>

                  {addon.detailed_description && (
                    <p className="text-xs sm:text-sm md:text-base text-secondary mb-3 sm:mb-4">{addon.detailed_description}</p>
                  )}

                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-semibold text-brand-blue mb-1 sm:mb-2">Best for</p>
                    <p className="text-xs sm:text-sm text-secondary">{addon.best_for}</p>
                  </div>

                  <div className="border-t border-neutral-200 mb-3 sm:mb-4"></div>

                  {/* Benefits List */}
                  <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                    {addon.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-secondary">{benefit.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button - at bottom */}
                <Button
                  type="button"
                  onClick={() => handleAddonToggle(addon.id)}
                  className={`w-full py-2 sm:py-3 rounded-full text-xs sm:text-sm md:text-base transition-all mt-auto !font-bold ${
                    isSelected
                      ? 'bg-primary-normal text-text-on-gradient'
                      : 'bg-white border-1 border-primary-normal !text-text-muted-strong'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-secondary">No addons available at this time.</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting || isLoadingAddons}
          className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Continue to payment'}
        </Button>
      </div>
    </div>
  );
}
