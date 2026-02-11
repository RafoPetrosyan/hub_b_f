import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetOnboardingQuery } from '@/store/onboarding';

/**
 * Custom hook for onboarding step validation and data fetching
 *
 * @param currentStep - The current step number (1-14)
 * @returns Object containing onboarding data, loading state, and error state
 *
 * @example
 * ```tsx
 * const { onboardingData, isLoading } = useOnboardingStep(1);
 * ```
 */
export function useOnboardingStep(currentStep: number) {
  const router = useRouter();
  const { data: onboardingData, isLoading, error } = useGetOnboardingQuery();

  // Check if user should be redirected based on onboarding progress
  useEffect(() => {
    if (!isLoading && onboardingData?.current_step) {
      // If onboardingData.current_step is greater than 5, prevent going back to steps 1-5
      if (onboardingData.current_step > 5 && currentStep <= 5) {
        router.push(`/sign-up/step-${onboardingData.current_step}`);
        return;
      }

      // If onboardingData.current_step is greater than 6, prevent going back to step 6
      if (onboardingData.current_step > 6 && currentStep === 6) {
        router.push(`/sign-up/step-${onboardingData.current_step}`);
        return;
      }

      // If current step is greater than allowed step, redirect to allowed step
      if (currentStep > onboardingData.current_step) {
        router.push(`/sign-up/step-${onboardingData.current_step}`);
      }
    }
  }, [onboardingData, isLoading, currentStep, router]);

  return {
    onboardingData,
    isLoading,
    error,
  };
}
