'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/components/ui';
import { CheckmarkCircleIcon } from '@/components/ui/icons';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import {
  useGetPlanSummaryQuery,
  useSubmitOnboardingStepMutation,
} from '@/store/onboarding';

interface VerificationFormData {
  verificationCode: string;
}

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
}

export default function Step6Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(6);
  const { data: planSummary, isLoading: isLoadingSummary } = useGetPlanSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();
  const [email] = useState('wfwe@gmail.com'); // This would come from previous step or context
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Extract plan name dynamically
  const planName = useMemo(() => {
    if (!planSummary?.selection) {
      return 'Enterprise - Elite'; // Fallback
    }

    const { selection, plan } = planSummary;
    const selectedPlan = selection.plan;
    const tier = selectedPlan.tier || plan.tier;

    const tierName = tier?.name || 'Enterprise';
    const planLevel = selectedPlan.name || 'Elite';

    return `${tierName} - ${planLevel}`;
  }, [planSummary]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<VerificationFormData>({
    mode: 'onBlur',
    defaultValues: {
      verificationCode: '',
    },
  });

  const onboardingTasks: OnboardingTask[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Set up your practice information and preferences',
    },
    {
      id: 'team',
      title: 'Invite Your Team',
      description: 'Add practitioners and staff members to your account',
    },
    {
      id: 'data',
      title: 'Import Patient Data',
      description: 'Upload existing patient records or start fresh',
    },
    {
      id: 'appointment',
      title: 'Schedule Your First Appointment',
      description: 'Start using the scheduling system right away',
    },
  ];

  const onVerifyEmail = async (data: VerificationFormData) => {
    setVerificationError(null);
    
    try {
      // Submit the verification code to the backend
      await submitOnboardingStep({
        step: 6,
        verification_code: data.verificationCode,
      }).unwrap();
      
      // Mark as verified and navigate to next step
      setIsVerified(true);
      router.push('/sign-up/step-7');
    } catch (error: any) {
      // Handle verification errors
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Verification failed. Please check your code and try again.';
      
      setVerificationError(errorMessage);
      setError('verificationCode', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  const onContinue = () => {
    if (isVerified) {
      router.push('/sign-up/step-7');
    }
  };

  const onGetStarted = () => {
    setShowVerification(true);
  };

  const onViewDashboard = () => {
    // Navigate to dashboard (root route)
    router.push('/');
  };

  const formatVerificationCode = (value: string) => {
    // Remove all non-digit characters and limit to 6 digits
    return value.replace(/\D/g, '').slice(0, 6);
  };

  // Show welcome screen first
  if (!showVerification) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        {/* Title and Subtitle */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            Welcome Aboard!
          </h1>
          <p className="text-sm sm:text-base text-secondary">
            Your subscription has been successfully activated
          </p>
        </div>

        {/* Subscription Card */}
        <div className="max-w-[668px] mx-auto mb-6 sm:mb-8">
          <div className="bg-primary-light rounded-[12px] border-1 border-primary-normal p-4 sm:p-6 md:p-8">
            <div className="flex items-start border-b-1 mb-4 sm:mb-6 md:mb-[24px] border-natural-light-hover">
              <h2 className="text-base sm:text-lg md:text-lg font-bold text-strong leading-[24px] sm:leading-[28px] text-center mb-2 sm:mb-3 md:mb-[13px]">
                {isLoadingSummary ? 'Loading...' : planName}
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {onboardingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckmarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base md:text-base font-bold text-strong mb-0.5 sm:mb-1">{task.title}</h3>
                    <p className="text-xs sm:text-sm md:text-sm text-secondary leading-[18px] sm:leading-[20px]">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <Button
            type="button"
            onClick={onGetStarted}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 bg-primary-normal"
          >
            Get Started
          </Button>
          {/*<Button*/}
          {/*  type="button"*/}
          {/*  onClick={onViewDashboard}*/}
          {/*  variant="outline"*/}
          {/*  className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] rounded-full font-medium text-sm sm:text-base text-strong border-2 border-primary-normal bg-white transition-all hover:opacity-90"*/}
          {/*>*/}
          {/*  View Dashboard*/}
          {/*</Button>*/}
        </div>
      </div>
    );
  }

  // Show verification form after clicking "Get Started"
  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Verify your contact information
        </h1>
        <p className="text-sm sm:text-base text-secondary">
          We verify your contact information to secure your account.
        </p>
      </div>

      {/* Email Verification Card */}
      <div className="max-w-[668px] mx-auto mb-6 sm:mb-8 bg-primary-light rounded-[12px]">
        <div className="bg-neutral-25 rounded-[12px] py-6 sm:py-8 md:py-[46px] px-4 sm:px-8 md:px-[116px]">
          <h2 className="text-base sm:text-lg md:text-md font-bold text-strong leading-[22px] sm:leading-[24px] text-center">
            Email verification
          </h2>
          <p className="text-sm sm:text-base text-label leading-[18px] sm:leading-[20px] text-center mt-2 sm:mt-3">{email}</p>
          <p className="text-xs sm:text-sm md:text-sm text-secondary mb-4 sm:mb-6 font-medium leading-[18px] sm:leading-[20px] mt-2 sm:mt-[10px]">
            We've sent a 6-digit code to your email. Please enter it below.
          </p>

          <form onSubmit={handleSubmit(onVerifyEmail)}>
            <Controller
              name="verificationCode"
              control={control}
              rules={{
                required: 'Verification code is required',
                validate: (value) => {
                  const digits = value.replace(/\D/g, '');
                  return digits.length === 6 || 'Please enter a 6-digit code';
                },
              }}
              render={({ field }) => (
                <Input
                  label="VERIFICATION CODE"
                  type="text"
                  required
                  {...field}
                  value={formatVerificationCode(field.value || '')}
                  onChange={(e) => {
                    const formatted = formatVerificationCode(e.target.value);
                    field.onChange(formatted);
                    // Clear error when user starts typing
                    if (verificationError) {
                      setVerificationError(null);
                    }
                  }}
                  error={errors.verificationCode}
                  placeholder="000000"
                  labelClassName="font-bold text-xs"
                  className="mb-3 sm:mb-4"
                  disabled={isSubmitting}
                />
              )}
            />

            {verificationError && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs sm:text-sm">
                {verificationError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary-normal text-text-muted-strong"
            >
              {isSubmitting ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        </div>
      </div>

      {/* Continue Button - Only show if verified but navigation didn't happen automatically */}
      {isVerified && (
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={onContinue}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] rounded-full font-bold text-sm sm:text-base md:text-base text-text-on-gradient transition-all hover:opacity-90 bg-primary-normal"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
