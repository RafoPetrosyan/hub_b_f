'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@/components/ui';
import { CheckmarkCircleIcon } from '@/components/ui/icons';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { useGetOnboardingTiersQuery, useSubmitOnboardingStepMutation } from '@/store/onboarding';
import type { OnboardingTier } from '@/store/onboarding/types';

interface AccountType {
  id: string;
  name: string;
  subtitle: string;
  keyFeatures: {
    locations: string;
    practitioners: string;
  };
  monthlyPrice: number;
  yearlyPrice: number;
  includedFeatures: string[];
  basicPlanId: string;
}

export default function Step1Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(1);
  const { data: tiers, isLoading: isLoadingTiers } = useGetOnboardingTiersQuery();
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedAccountTypeId, setSelectedAccountTypeId] = useState<string>('');
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [selectedTierForModal, setSelectedTierForModal] = useState<OnboardingTier | null>(null);

  // Restore selected tier from onboarding data when available
  useEffect(() => {
    if (onboardingData?.steps_data?.['1']?.tier_id) {
      setSelectedAccountTypeId(onboardingData.steps_data['1'].tier_id);
    }
  }, [onboardingData]);

  // Map API tiers to AccountType format
  const accountTypes = useMemo<AccountType[]>(() => {
    if (!tiers) return [];

    return tiers.map((tier) => {
      // The plan is already included in each tier
      const basicPlan = tier.plan;

      if (!basicPlan) {
        // Fallback if no plan found
        return {
          id: tier.id,
          name: tier.name,
          subtitle: tier.description,
          keyFeatures: {
            locations: tier.max_locations
              ? `${tier.max_locations} location${tier.max_locations > 1 ? 's' : ''}`
              : 'Multiple locations',
            practitioners: tier.max_users
              ? `${tier.max_users} practitioner${tier.max_users > 1 ? 's' : ''}`
              : 'Multiple practitioners',
          },
          monthlyPrice: 0,
          yearlyPrice: 0,
          includedFeatures: [],
          basicPlanId: '',
        };
      }

      // Extract monthly and yearly prices
      const monthlyPrice = basicPlan.prices?.find((p) => p.interval === 'monthly');
      const yearlyPrice = basicPlan.prices?.find((p) => p.interval === 'yearly');

      const monthlyPriceDollars = monthlyPrice ? parseFloat(monthlyPrice.price_cents) / 100 : 0;
      // If no yearly price, use monthly price * 12 as fallback
      const yearlyPriceDollars = yearlyPrice
        ? parseFloat(yearlyPrice.price_cents) / 100
        : monthlyPriceDollars * 12;

      // Extract features from benefits (flatten the structure)
      const includedFeatures: string[] = [];
      if (basicPlan.benefits && Array.isArray(basicPlan.benefits)) {
        basicPlan.benefits.forEach((benefit) => {
          if (benefit.children && Array.isArray(benefit.children)) {
            benefit.children.forEach((child) => {
              if (child.name) {
                includedFeatures.push(child.name);
              }
            });
          }
        });
      }

      // Format locations and practitioners
      const locationsText = tier.max_locations
        ? `${tier.max_locations} location${tier.max_locations > 1 ? 's' : ''}`
        : 'Multiple locations';
      const practitionersText = tier.max_users
        ? `${tier.max_users} practitioner${tier.max_users > 1 ? 's' : ''}`
        : 'Multiple practitioners';

      return {
        id: tier.id,
        name: tier.name,
        subtitle: tier.description,
        keyFeatures: {
          locations: locationsText,
          practitioners: practitionersText,
        },
        monthlyPrice: monthlyPriceDollars,
        yearlyPrice: yearlyPriceDollars,
        includedFeatures: includedFeatures.slice(0, 5), // Show first 5 features
        basicPlanId: basicPlan.id,
      };
    });
  }, [tiers]);

  const handleContinue = async () => {
    if (selectedAccountTypeId) {
      try {
        await submitOnboardingStep({
          step: 1,
          tier_id: selectedAccountTypeId,
        }).unwrap();
        router.push('/sign-up/step-2');
      } catch (error) {
        console.error('Failed to submit onboarding step:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  // Get benefits for the selected tier's plan
  const modalBenefits = useMemo(() => {
    if (!selectedTierForModal) return [];

    const basicPlan = selectedTierForModal.plan;

    return basicPlan?.benefits || [];
  }, [selectedTierForModal]);

  // Split benefits into two columns for display
  const benefitsColumns = useMemo(() => {
    if (modalBenefits.length === 0) return { leftColumn: [], rightColumn: [] };

    const midPoint = Math.ceil(modalBenefits.length / 2);
    return {
      leftColumn: modalBenefits.slice(0, midPoint),
      rightColumn: modalBenefits.slice(midPoint),
    };
  }, [modalBenefits]);

  // Get pricing info for the selected tier's plan
  const modalPricing = useMemo(() => {
    if (!selectedTierForModal) return null;

    const basicPlan = selectedTierForModal.plan;

    if (!basicPlan) return null;

    const monthlyPrice = basicPlan.prices?.find((p) => p.interval === 'monthly');
    const yearlyPrice = basicPlan.prices?.find((p) => p.interval === 'yearly');

    const monthlyPriceDollars = monthlyPrice ? parseFloat(monthlyPrice.price_cents) / 100 : 0;
    const yearlyPriceDollars = yearlyPrice ? parseFloat(yearlyPrice.price_cents) / 100 : 0;

    return {
      monthly: monthlyPriceDollars,
      yearly: yearlyPriceDollars,
      planName: basicPlan.name,
      planDescription: basicPlan.description,
    };
  }, [selectedTierForModal]);

  return (
    <>
      <div className="max-w-7xl mx-auto font-inter px-2 sm:px-4">
        {/* Title and Subtitle */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            Choose Your Account Type
          </h1>
          <p className="text-sm sm:text-base text-secondary">
            Select the account type that best fits your practice
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-6 sm:mb-8 md:mb-12">
          <div className="inline-flex items-center bg-primary-light rounded-full">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 sm:px-4 md:px-6 rounded-full font-bold text-sm sm:text-base md:text-md transition-all w-[120px] sm:w-[180px] md:w-[277px] h-[40px] sm:h-[44px] md:h-[48px] ${
                billingPeriod === 'monthly'
                  ? 'bg-primary-normal text-text-on-gradient shadow-sm'
                  : 'text-text-disable'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`px-3 sm:px-4 md:px-6 rounded-full font-bold text-sm sm:text-base md:text-md transition-all w-[120px] sm:w-[180px] md:w-[277px] h-[40px] sm:h-[44px] md:h-[48px] ${
                billingPeriod === 'yearly'
                  ? 'bg-primary-normal text-text-on-gradient shadow-sm'
                  : 'text-text-disable'
              }`}
            >
              Yearly <span className="text-info text-xs sm:text-sm md:text-base">(save 20%)</span>
            </button>
          </div>
        </div>

        {/* Account Type Cards */}
        {isLoadingTiers ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-secondary">Loading tiers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[880px]:grid-cols-3 mb-6 sm:mb-8 gap-4 sm:gap-6 min-[880px]:gap-[21px] justify-center">
            {accountTypes.map((accountType) => {
              const isSelected = selectedAccountTypeId === accountType.id;
              // For yearly, show monthly equivalent (yearly price / 12)
              const price =
                billingPeriod === 'monthly'
                  ? accountType.monthlyPrice
                  : accountType.yearlyPrice / 12;

              return (
                <div
                  key={accountType.id}
                  onClick={() => setSelectedAccountTypeId(accountType.id)}
                  className={`relative cursor-pointer rounded-[16px] sm:rounded-[24px] border p-4 sm:p-6 transition-all ${
                    isSelected
                      ? 'border-primary-normal shadow-lg bg-primary-light'
                      : 'border-border-soft hover:border-neutral-300'
                  }`}
                >
                  {/* Plan Content */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1 text-strong">
                      {accountType.name}
                    </h3>
                    <p className="text-xs sm:text-sm mb-4 sm:mb-[24px] text-secondary">
                      {accountType.subtitle}
                    </p>

                    {/* Divider after subtitle */}
                    <div className="border-t border-neutral-soft mb-4 sm:mb-[24px]"></div>

                    {/* Key Features */}
                    <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center">
                        <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-secondary">
                          {accountType.keyFeatures.locations}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-secondary">
                          {accountType.keyFeatures.practitioners}
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-3 sm:mb-4">
                      <p className="text-strong font-bold text-base sm:text-lg">Basic</p>
                      <p className="text-4xl sm:text-5xl md:text-5xl lg:text-display-lg font-bold text-strong">
                        ${price.toFixed(2)}
                        <span className="text-text-secondary text-base sm:text-base md:text-base lg:text-xl">
                          /month
                        </span>
                      </p>
                    </div>

                    {/* Divider after pricing */}
                    <div className="border-t border-neutral-soft mb-4 sm:mb-[24px]"></div>

                    {/* Included Features */}
                    <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                      {accountType.includedFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-secondary">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* See full features link */}
                    <button
                      type="button"
                      className="text-xs sm:text-sm text-brand-blue hover:underline mb-3 sm:mb-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        const selectedTier = tiers?.find((tier) => tier.id === accountType.id);
                        if (selectedTier) {
                          setSelectedTierForModal(selectedTier);
                          setIsFeaturesModalOpen(true);
                        }
                      }}
                    >
                      See full features
                    </button>

                    {/* Select Button */}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAccountTypeId(accountType.id);
                      }}
                      className={`w-full py-2 rounded-full bg-primary-normal font-medium text-xs sm:text-sm transition-all`}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!selectedAccountTypeId || isSubmitting || isLoadingTiers}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue to plans'}
          </Button>
        </div>
      </div>

      {/* Features Modal */}
      <Modal
        isOpen={isFeaturesModalOpen}
        onClose={() => {
          setIsFeaturesModalOpen(false);
          setSelectedTierForModal(null);
        }}
        size="2xl"
        showCloseButton={false}
      >
        <div className="rounded-[16px] sm:rounded-[24px] p-4 sm:p-6 relative">
          {/* Close Button */}
          <button
            onClick={() => {
              setIsFeaturesModalOpen(false);
              setSelectedTierForModal(null);
            }}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-strong hover:text-strong/70 transition-colors p-1 rounded-lg hover:bg-white/20"
            aria-label="Close modal"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          {selectedTierForModal && (
            <>
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-strong mb-2">
                  {selectedTierForModal.name}
                </h2>
                <p className="text-xs sm:text-sm text-secondary">
                  {selectedTierForModal.description}
                </p>
              </div>

              <div className="bg-primary-light p-4 sm:p-6 md:p-[32px] rounded-[16px] sm:rounded-[24px]">
                {/* Plan Info */}
                {modalPricing && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-strong mb-1">
                        {modalPricing.planName.toUpperCase()}
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary">
                        {modalPricing.planDescription}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-strong">
                        $
                        {(billingPeriod === 'monthly'
                          ? modalPricing.monthly
                          : modalPricing.yearly / 12
                        ).toFixed(2)}
                        <span className="text-natural-normal text-base sm:text-lg md:text-xl">
                          /month
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Features Grid - Two Columns */}
                {modalBenefits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6">
                      {benefitsColumns.leftColumn.map((benefit, benefitIndex) => (
                        <div key={benefitIndex}>
                          <h4 className="text-xs sm:text-sm font-bold text-strong mb-2 sm:mb-3 flex items-center">
                            <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                            {benefit.name}
                          </h4>
                          <div className="space-y-1.5 sm:space-y-2">
                            {benefit.children?.map((child, childIndex) => (
                              <div key={childIndex} className="flex items-start">
                                <span className="text-xs sm:text-sm text-secondary">
                                  - {child.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 sm:space-y-6">
                      {benefitsColumns.rightColumn.map((benefit, benefitIndex) => (
                        <div key={benefitIndex}>
                          <h4 className="text-xs sm:text-sm font-bold text-strong mb-2 sm:mb-3 flex items-center">
                            <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                            {benefit.name}
                          </h4>
                          <div className="space-y-1.5 sm:space-y-2">
                            {benefit.children?.map((child, childIndex) => (
                              <div key={childIndex} className="flex items-start">
                                <span className="text-xs sm:text-sm text-secondary">
                                  - {child.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-xs sm:text-sm text-secondary">
                      No benefits information available
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Button */}
              <Button
                type="button"
                onClick={() => {
                  if (selectedTierForModal) {
                    setSelectedAccountTypeId(selectedTierForModal.id);
                    setIsFeaturesModalOpen(false);
                    setSelectedTierForModal(null);
                  }
                }}
                className="w-full py-2.5 sm:py-3 mt-3 sm:mt-[12px] rounded-full bg-primary-normal text-text-on-gradient font-medium text-xs sm:text-sm"
              >
                Select
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
