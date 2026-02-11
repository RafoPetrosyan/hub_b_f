'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import {
  useGetPlanSummaryQuery,
  useSubmitOnboardingStepMutation,
} from '@/store/onboarding';

export default function Step4Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(4);
  const { data: planSummary, isLoading: isLoadingSummary } = useGetPlanSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();

  // Extract and format plan data
  const planData = useMemo(() => {
    if (!planSummary?.selection) {
      return null;
    }

    const { selection, plan } = planSummary;
    const selectedPlan = selection.plan;
    const tier = selectedPlan.tier || plan.tier;

    // Get prices
    const monthlyPriceObj = plan.prices?.find((p) => p.interval === 'monthly');
    const yearlyPriceObj = plan.prices?.find((p) => p.interval === 'yearly');

    const monthlyPrice = monthlyPriceObj ? parseFloat(monthlyPriceObj.price_cents) / 100 : 0;
    const yearlyPrice = yearlyPriceObj ? parseFloat(yearlyPriceObj.price_cents) / 100 : 0;
    const discountedMonthlyPrice = yearlyPrice > 0 ? yearlyPrice / 12 : monthlyPrice;

    // Format practitioners
    const maxUsers = tier?.max_users;
    const practitionersText = maxUsers === null || maxUsers === undefined
      ? 'Unlimited practitioners'
      : maxUsers === 1
      ? '1 practitioner'
      : `Up to ${maxUsers} practitioners`;

    // Format website
    const websiteText = selection.has_website ? 'Included' : 'Not Included';

    return {
      accountType: tier?.name || 'N/A',
      planLevel: selectedPlan.name || 'N/A',
      practitioners: practitionersText,
      website: websiteText,
      monthlyPrice,
      discountedMonthlyPrice,
      yearlyPrice,
    };
  }, [planSummary]);

  const handleContinueToPayments = async () => {
    try {
      await submitOnboardingStep({
        step: 4,
      }).unwrap();
      router.push('/sign-up/step-5');
    } catch (error) {
      console.error('Failed to submit onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleBack = () => {
    router.push('/sign-up/step-3');
  };

  if (isLoadingSummary) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-secondary">Loading plan summary...</p>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-secondary">Unable to load plan summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Plan Summary
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-[24px]">
          Review your selections before proceeding to payment
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="border-neutral-05 border-1 rounded-[12px] p-4 sm:p-6 md:p-[24px]">
          {/* Plan Details Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-text-ultra-strong mb-3 sm:mb-4">Plan Details</h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row">
                <span className="text-text-muted font-medium text-sm sm:text-base">Account Type:</span>
                <span className="text-strong font-medium text-sm sm:text-base sm:ml-2">{planData.accountType}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="text-text-muted font-medium text-sm sm:text-base">Plan Level:</span>
                <span className="text-strong font-medium text-sm sm:text-base sm:ml-2">{planData.planLevel}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="text-text-muted font-medium text-sm sm:text-base">Practitioners:</span>
                <span className="text-strong font-medium text-sm sm:text-base sm:ml-2">
                  <span className="font-bold">{planData.practitioners.split(' ')[0]}</span>{' '}
                  {planData.practitioners.split(' ').slice(1).join(' ')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="text-text-muted font-medium text-sm sm:text-base">Website:</span>
                <span className="text-strong font-medium text-sm sm:text-base">
                  <span className="font-bold sm:ml-2">{planData.website}</span>
                </span>
              </div>
            </div>
          </div>
          {/* Pricing Breakdown Section */}
          <div className="border-t border-neutral-soft mt-3 sm:mt-4"></div>
          <div className="mb-6 sm:mb-8 mt-3 sm:mt-[13px]">
            <h2 className="text-base sm:text-lg font-bold text-text-muted-strong mb-3 sm:mb-4">Pricing Breakdown</h2>
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-text-muted font-medium text-sm sm:text-base">
                  {planData.planLevel} Plan ({planData.accountType})
                </span>
                <span className="text-body font-medium text-sm sm:text-base">${planData.monthlyPrice.toFixed(2)}/month</span>
              </div>
            </div>
            <div className="border-t border-neutral-soft mb-3 sm:mb-4"></div>
            <div className="bg-natural-light px-3 sm:px-4 md:px-[15px] py-4 sm:py-5 md:py-[25px] rounded-[12px]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                <div>
                  <div className="text-text-ultra-strong font-semibold mb-1 text-sm sm:text-base">Monthly Total</div>
                  <div className="font-medium text-xs sm:text-sm text-text-muted-soft">
                    Yearly Total (20% off)
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-display-sm md:text-4xl font-bold text-strong">
                    ${planData.discountedMonthlyPrice.toFixed(2)}
                  </div>
                  <div className="text-secondary text-xs sm:text-sm">
                    ${planData.yearlyPrice.toLocaleString()}/year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Button
            type="button"
            onClick={handleContinueToPayments}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal py-3 sm:py-4 rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue to payments'}
          </Button>
          <Button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[280px] md:w-[420px] py-3 sm:py-4 rounded-full !font-bold text-sm sm:text-base !text-text-muted-strong border border-primary-normal bg-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
