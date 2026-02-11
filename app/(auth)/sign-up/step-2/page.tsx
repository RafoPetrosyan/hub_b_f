'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@/components/ui';
import { CheckmarkCircleIcon } from '@/components/ui/icons';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import {
  useGetAvailablePlansQuery,
  useSubmitOnboardingStepMutation,
} from '@/store/onboarding';

interface PlanLevel {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId: string;
  yearlyPriceId: string;
  features: string[];
  tier: {
    max_locations: number | null;
    max_users: number | null;
  };
  isBasic: boolean;
}

export default function Step2Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(2);
  const { data: availablePlans, isLoading: isLoadingPlans, refetch: refetchPlans } = useGetAvailablePlansQuery(undefined, {
    // Force refetch every time component mounts to get fresh plans based on step-1 selection
    refetchOnMountOrArgChange: true,
  });
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanLevelId, setSelectedPlanLevelId] = useState<string>('');
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PlanLevel | null>(null);

  // Refetch plans on component mount to ensure we have the latest plans based on step-1 selection
  useEffect(() => {
    refetchPlans();
  }, [refetchPlans]);

  // Restore selected plan from onboarding data when available
  useEffect(() => {
    if (onboardingData?.steps_data?.['2']?.subscription_id && availablePlans) {
      // Find the plan that matches the stored subscription_id (which is now the plan ID)
      const storedPlanId = onboardingData.steps_data['2'].subscription_id;
      const matchingPlan = availablePlans.find((plan) => plan.id === storedPlanId);
      if (matchingPlan) {
        setSelectedPlanLevelId(matchingPlan.id);
      }
    }
  }, [onboardingData, availablePlans]);

  // Map API plans to PlanLevel format
  const planLevels = useMemo<PlanLevel[]>(() => {
    if (!availablePlans) return [];
    
    return availablePlans.map((plan) => {
      // Extract monthly and yearly prices
      const monthlyPrice = plan.prices?.find((p) => p.interval === 'monthly');
      const yearlyPrice = plan.prices?.find((p) => p.interval === 'yearly');
      
      const monthlyPriceDollars = monthlyPrice 
        ? parseFloat(monthlyPrice.price_cents) / 100 
        : 0;
      const yearlyPriceDollars = yearlyPrice 
        ? parseFloat(yearlyPrice.price_cents) / 100 
        : 0;

      // Extract features from benefits (flatten the structure, show first 5)
      const features: string[] = [];
      if (plan.benefits && Array.isArray(plan.benefits)) {
        plan.benefits.forEach((benefit) => {
          if (benefit.children && Array.isArray(benefit.children)) {
            benefit.children.forEach((child) => {
              if (child.name && features.length < 5) {
                features.push(child.name);
              }
            });
          }
        });
      }

      const isBasic = plan.key?.toLowerCase().includes('basic') || plan.name?.toLowerCase() === 'basic';
      
      return {
        id: plan.id,
        name: plan.name,
        subtitle: plan.description,
        monthlyPrice: monthlyPriceDollars,
        yearlyPrice: yearlyPriceDollars,
        monthlyPriceId: monthlyPrice?.id || '',
        yearlyPriceId: yearlyPrice?.id || '',
        features,
        tier: {
          max_locations: plan.tier?.max_locations ?? null,
          max_users: plan.tier?.max_users ?? null,
        },
        isBasic,
      };
    });
  }, [availablePlans]);

  const handleContinue = async () => {
    if (selectedPlanLevelId) {
      const selectedPlan = planLevels.find((p) => p.id === selectedPlanLevelId);
      if (selectedPlan) {
        // Send the plan ID (parent object ID), not the price ID
        try {
          await submitOnboardingStep({
            step: 2,
            subscription_id: selectedPlan.id,
          }).unwrap();
          router.push('/sign-up/step-3');
        } catch (error) {
          console.error('Failed to submit onboarding step:', error);
          // You might want to show an error message to the user here
        }
      }
    }
  };

  // Get full benefits for modal from selected plan
  const getModalFeatures = (plan: PlanLevel | null) => {
    if (!plan) return { leftColumn: [], rightColumn: [] };
    
    const selectedPlanData = availablePlans?.find((p) => p.id === plan.id);
    if (!selectedPlanData?.benefits) return { leftColumn: [], rightColumn: [] };

    // Split benefits into two columns
    const benefits = selectedPlanData.benefits;
    const midPoint = Math.ceil(benefits.length / 2);
    const leftColumn = benefits.slice(0, midPoint).map((benefit) => ({
      category: benefit.name,
      items: benefit.children?.map((child) => child.name) || [],
    }));
    const rightColumn = benefits.slice(midPoint).map((benefit) => ({
      category: benefit.name,
      items: benefit.children?.map((child) => child.name) || [],
    }));

    return { leftColumn, rightColumn };
  };

  const modalFeatures = getModalFeatures(selectedPlanForModal);

  return (
    <>
      <div className="max-w-7xl mx-auto font-inter px-2 sm:px-4">
        {/* Title and Subtitle */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            Choose Your Plan Level
          </h1>
          <p className="text-sm sm:text-base text-secondary">Upgrade your plan for more advanced features.</p>
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

        {/* Plan Level Cards */}
        {isLoadingPlans ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-secondary">Loading plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[880px]:grid-cols-3 mb-6 sm:mb-8 gap-4 sm:gap-6 min-[880px]:gap-[21px] justify-center">
            {planLevels.map((planLevel) => {
              const isSelected = selectedPlanLevelId === planLevel.id;
              // For yearly, show monthly equivalent (yearly price / 12)
              const price =
                billingPeriod === 'monthly' 
                  ? planLevel.monthlyPrice 
                  : planLevel.yearlyPrice / 12;

            return (
              <div
                key={planLevel.id}
                className={`relative rounded-[16px] sm:rounded-[24px] border p-4 sm:p-6 transition-all flex flex-col ${
                  isSelected
                    ? 'border-primary-normal shadow-lg bg-primary-light'
                    : 'border-neutral-200'
                }`}
              >
                {/* Plan Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-strong">{planLevel.name}</h3>
                  </div>

                  {/* Basic Plan: Subtitle → Divider → Key Features → Pricing → Divider → Features */}
                  {planLevel.isBasic ? (
                    <>
                      <p className="text-sm sm:text-base mb-3 sm:mb-4 text-secondary">{planLevel.subtitle}</p>
                      <div className="border-t border-neutral-200 mb-3 sm:mb-4"></div>
                      {/* Key Features for Basic Plan */}
                      <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center">
                          <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base text-secondary">
                            {planLevel.tier.max_locations 
                              ? `${planLevel.tier.max_locations} location${planLevel.tier.max_locations > 1 ? 's' : ''}`
                              : 'Multiple locations'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base text-secondary">
                            {planLevel.tier.max_users 
                              ? `Up to ${planLevel.tier.max_users} practitioner${planLevel.tier.max_users > 1 ? 's' : ''}`
                              : 'Multiple practitioners'}
                          </span>
                        </div>
                      </div>
                      {/* Pricing */}
                      <div className="mb-3 sm:mb-4">
                        <p className="text-strong font-bold text-base sm:text-lg md:text-xl">Basic</p>
                        <p className="text-display-sm sm:text-4xl md:text-5xl lg:text-5xl font-bold text-strong">
                          ${price.toFixed(2)}
                          <span className="text-natural-normal text-base sm:text-lg md:text-xl lg:text-display-sm">/month</span>
                        </p>
                      </div>
                      <div className="border-t border-neutral-200 mb-3 sm:mb-4"></div>
                    </>
                  ) : (
                    /* Growth and Elite: Title → Pricing → Description → Features */
                    <>
                      {/* Pricing directly under title */}
                      <div className="mb-3 sm:mb-4">
                        <p className="text-display-sm sm:text-4xl md:text-5xl lg:text-5xl font-bold text-strong">
                          ${price.toFixed(2)} <span className="text-natural-normal text-base sm:text-lg md:text-xl lg:text-display-sm">/month</span>
                        </p>
                      </div>
                      {/* Description */}
                      <p className="text-sm sm:text-base mb-2 text-secondary">{planLevel.subtitle}</p>
                      <div className="border-t border-neutral-200 mb-3 sm:mb-4 mt-0"></div>
                    </>
                  )}

                  {/* Features */}
                  <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                    {planLevel.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm md:text-base text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* See full features link */}
                  <button
                    type="button"
                    className="text-xs sm:text-sm md:text-base text-brand-blue hover:underline mb-3 sm:mb-4 block"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanForModal(planLevel);
                      setIsFeaturesModalOpen(true);
                    }}
                  >
                    See full features
                  </button>
                </div>

                {/* Action Button - at bottom */}
                <Button
                  type="button"
                  onClick={() => setSelectedPlanLevelId(planLevel.id)}
                  className={`w-full py-2 sm:py-3 rounded-full text-xs sm:text-sm md:text-base transition-all mt-auto !font-bold ${
                    isSelected
                      ? 'bg-primary-normal text-text-on-gradient'
                      : 'bg-white border-1 border-primary-normal !text-text-muted-strong'
                  }`}
                >
                  {isSelected 
                    ? 'Selected' 
                    : planLevel.isBasic 
                      ? 'Select' 
                      : `Upgrade to ${planLevel.name}`}
                </Button>
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
            disabled={!selectedPlanLevelId || isSubmitting || isLoadingPlans}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Plan Features Modal */}
      <Modal
        isOpen={isFeaturesModalOpen}
        onClose={() => setIsFeaturesModalOpen(false)}
        size="2xl"
        showCloseButton={false}
      >
        {selectedPlanForModal && (
          <div className="p-4 sm:p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsFeaturesModalOpen(false)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-strong hover:text-strong/70 transition-colors p-1 rounded-lg hover:bg-white/20"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-strong mb-2">{selectedPlanForModal.name}</h2>
              <p className="text-xs sm:text-sm text-secondary">{selectedPlanForModal.subtitle}</p>
            </div>

            <div className="bg-primary-light p-4 sm:p-6 md:p-[32px] rounded-[16px] sm:rounded-[24px]">
              {/* Plan Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-strong mb-1">{selectedPlanForModal.name.toUpperCase()}</h3>
                  {!selectedPlanForModal.isBasic && (
                    <p className="text-xs sm:text-sm text-secondary">Everything in Basic, plus:</p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-strong">
                    ${(billingPeriod === 'monthly' 
                      ? selectedPlanForModal.monthlyPrice 
                      : selectedPlanForModal.yearlyPrice / 12).toFixed(2)}
                    <span className="text-natural-normal text-base sm:text-lg md:text-xl">/month</span>
                  </p>
                </div>
              </div>

              {/* Features Grid - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
                {/* Left Column */}
                <div className="space-y-4 sm:space-y-6">
                  {modalFeatures.leftColumn.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h4 className="text-xs sm:text-sm font-bold text-strong mb-2 sm:mb-3 flex items-center">
                        <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                        {section.category}
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start">
                            <span className="text-xs sm:text-sm text-secondary">- {item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  {modalFeatures.rightColumn.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h4 className="text-xs sm:text-sm font-bold text-strong mb-2 sm:mb-3 flex items-center">
                        <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-1.5 sm:mr-2 flex-shrink-0" />
                        {section.category}
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start">
                            <span className="text-xs sm:text-sm text-secondary">- {item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Button */}
            <Button
              type="button"
              onClick={() => {
                setSelectedPlanLevelId(selectedPlanForModal.id);
                setIsFeaturesModalOpen(false);
              }}
              className="w-full py-2.5 sm:py-3 mt-3 sm:mt-[12px] rounded-full bg-primary-normal text-text-on-gradient font-medium text-xs sm:text-sm"
            >
              {selectedPlanLevelId === selectedPlanForModal.id ? 'Selected' : 'Select Plan'}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
