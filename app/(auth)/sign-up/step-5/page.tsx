'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import {
  useGetPlanSummaryQuery,
  useGetPaymentIntentsQuery,
  useSubmitOnboardingStepMutation,
} from '@/store/onboarding';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormData {
  // Form data for submission if needed
}

// Payment Form Component that uses Stripe Elements
function PaymentForm({
  planData,
  selectedBillingPeriod,
  setSelectedBillingPeriod,
  onSubmitSuccess,
}: {
  planData: {
    monthlyPrice: number;
    yearlyPrice: number;
  };
  selectedBillingPeriod: 'monthly' | 'yearly';
  setSelectedBillingPeriod: (period: 'monthly' | 'yearly') => void;
  onSubmitSuccess: (period: 'monthly' | 'yearly') => Promise<void>;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handleSubmit } = useForm<PaymentFormData>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!stripe || !elements) {
      setErrorMessage('Stripe is not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: ``,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.log(error, 'error');
        setErrorMessage(error.message || 'Failed to save card.');
        setIsProcessing(false);
        return;
      }

      // ✅ SetupIntent succeeded - check if setupIntent exists
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Card saved successfully');

        // Submit onboarding step 5 and navigate to next step
        try {
          await onSubmitSuccess(selectedBillingPeriod);
        } catch (submitError: any) {
          // Handle onboarding step submission error
          const errorMessage =
            submitError?.data?.message ||
            submitError?.data?.error ||
            submitError?.message ||
            'Please try again.';
          setErrorMessage(errorMessage);
          setIsProcessing(false);
          return;
        }
      } else {
        // SetupIntent might be in a different state, still consider it success if no error
        console.log('SetupIntent completed');
        try {
          await onSubmitSuccess(selectedBillingPeriod);
        } catch (submitError: any) {
          // Handle onboarding step submission error
          const errorMessage =
            submitError?.data?.message ||
            submitError?.data?.error ||
            submitError?.message ||
            'Please try again.';
          setErrorMessage(errorMessage);
          setIsProcessing(false);
          return;
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push('/sign-up/step-4');
  };

  // Calculate order amount based on billing period
  const orderAmount = planData
    ? selectedBillingPeriod === 'monthly'
      ? planData.monthlyPrice
      : planData.yearlyPrice
    : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
      <div className="border-neutral-05 border-1 rounded-[12px] p-4 sm:p-6 md:p-[24px]">
        {/* Subscription Options */}
        <div className="mb-6 sm:mb-8">
          <div className="space-y-2 sm:space-y-3">
            <div
              onClick={() => setSelectedBillingPeriod('monthly')}
              className={`border rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all ${
                selectedBillingPeriod === 'monthly'
                  ? 'border-primary-normal bg-primary-light'
                  : 'border-neutral-soft hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedBillingPeriod === 'monthly'}
                  onChange={() => setSelectedBillingPeriod('monthly')}
                  className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <label className="ml-2 sm:ml-3 text-sm sm:text-base text-strong font-medium cursor-pointer">
                  Monthly ${planData.monthlyPrice.toFixed(2)}/month
                </label>
              </div>
            </div>
            <div
              onClick={() => setSelectedBillingPeriod('yearly')}
              className={`border rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all ${
                selectedBillingPeriod === 'yearly'
                  ? 'border-primary-normal bg-primary-light'
                  : 'border-neutral-soft hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedBillingPeriod === 'yearly'}
                  onChange={() => setSelectedBillingPeriod('yearly')}
                  className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <label className="ml-2 sm:ml-3 text-sm sm:text-base text-strong font-medium cursor-pointer">
                  Yearly (save 20%) ${planData.yearlyPrice.toFixed(2)}/year
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-strong mb-2">Payment information</h2>
          <p className="text-xs sm:text-sm text-secondary mb-3 sm:mb-4">
            You will be charged after the appointment is completed.
          </p>

          {/* Payment Method Selection */}
          {/*<div className="rounded-[12px] p-4 bg-natural-light mb-6 flex items-center">*/}
          {/*  <CardIcon className="w-[26px] h-[21px] mr-[14px]" />*/}
          {/*  <div className="flex flex-col">*/}
          {/*    <p className="text-text-ultra-strong font-semibold text-[14px] leading-[24px]">*/}
          {/*      Credit/Debit card*/}
          {/*    </p>*/}
          {/*    <p className="text-text-label font-medium leading-[16px] text-[12px] mt-2">*/}
          {/*      Visa, Mastercard, American Express*/}
          {/*    </p>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/* Stripe Payment Element - includes card and address fields */}
          <div className="mb-4 sm:mb-6">
            <PaymentElement
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: {
                    address: 'if_required',
                  },
                },
              }}
            />
            <AddressElement options={{ mode: 'billing', autocomplete: { mode: 'automatic' } }} />
          </div>

          {errorMessage && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs sm:text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-strong mb-3 sm:mb-4">Order Summary</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-secondary">Billing Cycle:</span>
              <span className="text-xs sm:text-sm text-strong font-medium capitalize">
                {selectedBillingPeriod === 'monthly' ? 'Month' : 'Year'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-secondary">Amount:</span>
              <span className="text-xs sm:text-sm text-strong font-medium">
                $
                {orderAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Free Trial Button */}
      <div className="mt-6 sm:mt-8 max-w-[420px] flex justify-center mx-auto">
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="w-full sm:w-auto sm:min-w-[280px] md:w-[420px] py-3 sm:py-4 bg-primary-normal rounded-full !font-bold text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Start free trial'}
        </Button>
      </div>

      {/* Back Button */}
      <div className="mt-3 sm:mt-4 max-w-[420px] flex justify-center mx-auto">
        <Button
          type="button"
          onClick={handleBack}
          disabled={isProcessing}
          className="w-full sm:w-auto sm:min-w-[280px] md:w-[420px] py-3 sm:py-4 rounded-full font-medium text-sm sm:text-base !text-strong border border-primary-normal bg-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </Button>
      </div>
    </form>
  );
}

export default function Step5Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(5);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
  const { data: planSummary, isLoading: isLoadingSummary } = useGetPlanSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: paymentIntents, isLoading: isLoadingIntents } = useGetPaymentIntentsQuery(
    { period: selectedBillingPeriod },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [submitOnboardingStep] = useSubmitOnboardingStepMutation();

  // Handle successful payment submission
  const handlePaymentSuccess = async (period: 'monthly' | 'yearly') => {
    try {
      // Submit onboarding step 5 with the selected period
      await submitOnboardingStep({
        step: 5,
      }).unwrap();

      // Navigate to next step
      router.push('/sign-up/step-6');
    } catch (error) {
      console.error('Failed to submit onboarding step 5:', error);
      // Error will be handled by the form's error state
      throw error;
    }
  };

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
    const practitionersText =
      maxUsers === null || maxUsers === undefined
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

  // Get the client secret from payment intents response
  const clientSecret = useMemo(() => {
    if (!paymentIntents) return undefined;
    return paymentIntents.client_secret;
  }, [paymentIntents]);

  // Stripe Elements options
  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0ea5e9',
          colorBackground: '#ffffff',
          colorText: '#111827',
          colorDanger: '#ef4444',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
      },
    }),
    [clientSecret]
  );

  if (isLoadingSummary || isLoadingIntents) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-secondary">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!planData || !paymentIntents || !clientSecret) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-secondary">Unable to load payment information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Payment Information
        </h1>
      </div>

      <Elements
        key={`${clientSecret}-${selectedBillingPeriod}`}
        stripe={stripePromise}
        options={options}
      >
        <PaymentForm
          planData={{
            monthlyPrice: planData.monthlyPrice,
            yearlyPrice: planData.yearlyPrice,
          }}
          selectedBillingPeriod={selectedBillingPeriod}
          setSelectedBillingPeriod={setSelectedBillingPeriod}
          onSubmitSuccess={handlePaymentSuccess}
        />
      </Elements>
    </div>
  );
}
