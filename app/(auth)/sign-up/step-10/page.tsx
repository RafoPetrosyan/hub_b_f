'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, Switch } from '@/components/ui';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { useSubmitOnboardingStepMutation } from '@/store/onboarding';

interface OfferingsFormData {
  servicesAppointments: boolean;
  classesEducation: boolean;
  productsForSale: boolean;
}

export default function Step8Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(10);
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();

  const [servicesAppointments, setServicesAppointments] = useState(true);
  const [classesEducation, setClassesEducation] = useState(true);
  const [productsForSale, setProductsForSale] = useState(true);

  // Restore data from onboardingData if available
  useEffect(() => {
    const step10Data = onboardingData?.steps_data?.['10'];
    if (step10Data) {
      // Restore has_schedule
      if (typeof step10Data.has_schedule === 'boolean') {
        setServicesAppointments(step10Data.has_schedule);
      }
      // Restore has_education
      if (typeof step10Data.has_education === 'boolean') {
        setClassesEducation(step10Data.has_education);
      }
      // Restore has_products
      if (typeof step10Data.has_products === 'boolean') {
        setProductsForSale(step10Data.has_products);
      }
    }
  }, [onboardingData]);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<OfferingsFormData>({
    mode: 'onBlur',
    defaultValues: {
      servicesAppointments: true,
      classesEducation: true,
      productsForSale: true,
    },
  });

  const onSubmit = async (data: OfferingsFormData) => {
    try {
      // Prepare the request body
      const requestBody: {
        step: number;
        has_schedule?: boolean;
        has_education?: boolean;
        has_products?: boolean;
      } = {
        step: 10,
        has_schedule: servicesAppointments,
        has_education: classesEducation,
        has_products: productsForSale,
      };

      // Submit the onboarding step
      await submitOnboardingStep(requestBody).unwrap();

      // Navigate to next step on success
      router.push('/sign-up/step-11');
    } catch (error) {
      console.error('Failed to submit onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleSkip = async () => {
    try {
      // Submit with default values (all true based on initial state)
      await submitOnboardingStep({
        step: 10,
        has_schedule: servicesAppointments,
        has_education: classesEducation,
        has_products: productsForSale,
      }).unwrap();
      router.push('/sign-up/step-11');
    } catch (error) {
      console.error('Failed to skip onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-inter">
      {/* Title and Subtitle */}
      <div className="text-center mb-12">
        <h1 className="text-display-lg leading-[56px] mb-3 font-gazpacho font-normal text-heading">
          What do you offer?
        </h1>
        <p className="text-base text-secondary leading-[24px]">
          Choose the types of offerings you want to provide to your clients
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[776px] mx-auto">
        {/* Services / Appointments */}
        <div className="mb-6">
          <div className="rounded-[24px] p-6 flex items-center gap-4 bg-primary-light">
            <div className="flex-shrink-0 pt-1">
              <Switch
                id={'servicesAppointments'}
                checked={servicesAppointments}
                onChange={(e) => setServicesAppointments(e.target.checked)}
                variant="primary"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-md font-bold text-strong">Services / Appointments</h3>
              </div>
              <p className="text-sm text-label">Schedule bookings and appointments with clients</p>
            </div>
            <div>
              <span className="px-3 py-1 rounded-[90px] w-[106px] text-xs font-medium text-neutral-0 ml-2 bg-primary-normal">
                Required
              </span>
            </div>
          </div>
        </div>

        {/* Classes / Education */}
        <div className="mb-6 rounded-[24px] p-6 bg-primary-light">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Switch
                id={'classesEducation'}
                checked={classesEducation}
                onChange={(e) => setClassesEducation(e.target.checked)}
                variant="primary"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-md font-bold text-strong mb-1">Classes / Education</h3>
              <p className="text-sm text-label mb-3">
                Offer group classes, workshops, or training sessions
              </p>
            </div>
          </div>
          <div className="rounded-[12px] px-4 py-3 bg-neutral-75">
            <p className="text-sm text-secondary">
              You'll be able to set up class schedules, capacity limits, and group pricing after
              launch.
            </p>
          </div>
        </div>

        {/* Products for Sale */}
        <div className="mb-6 bg-primary-light p-6 rounded-[24px]">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Switch
                id={'productsForSale'}
                checked={productsForSale}
                onChange={(e) => setProductsForSale(e.target.checked)}
                variant="primary"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-md font-bold text-strong mb-1">Products for Sale</h3>
              <p className="text-sm text-label mb-3">
                Sell retail products through your booking page
              </p>
            </div>
          </div>
          <div className="rounded-[12px] px-4 py-3 bg-neutral-75">
            <p className="text-sm text-secondary">
              You'll be able to add products, manage inventory, and set pricing after launch.
            </p>
          </div>
        </div>

        {/* Note Section */}
        <div className="rounded-[12px] px-4 py-3 mb-8 bg-neutral-75">
          <p className="text-sm text-secondary">
            <span className="font-bold text-strong">Note:</span> These features can be enabled or
            disabled anytime from your dashboard. We're just setting up the basics now.
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-12 py-4 w-[420px] rounded-full font-medium text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-secondary hover:text-strong transition-colors"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
