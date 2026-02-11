'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BackArrowIcon } from '@/components/ui/icons';

interface SignUpLayoutProps {
  children: ReactNode;
}

// Define all steps in the sign-up flow
const TOTAL_STEPS = 14;
const STEP_PATHS = [
  '/sign-up/step-1',
  '/sign-up/step-2',
  '/sign-up/step-3',
  '/sign-up/step-4',
  '/sign-up/step-5',
  '/sign-up/step-6',
  '/sign-up/step-7',
  '/sign-up/step-8',
  '/sign-up/step-9',
  '/sign-up/step-10',
  '/sign-up/step-11',
  '/sign-up/step-12',
  '/sign-up/step-13',
  '/sign-up/step-14',
];

export default function SignUpLayout({ children }: SignUpLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Only show progress bar on step pages, not on the main /sign-up page
  const isStepPage = STEP_PATHS.some((path) => pathname === path);

  if (!isStepPage) {
    // For non-step pages (like /sign-up), just render children without progress bar
    return <>{children}</>;
  }

  // Find current step number
  const currentStepIndex = STEP_PATHS.findIndex((path) => pathname === path);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  // Steps where back button should be hidden
  const stepsWithoutBackButton = [6, 7, 13, 14];
  const shouldShowBackButton = !stepsWithoutBackButton.includes(currentStep);

  // Handle back navigation
  const handleBack = () => {
    if (currentStepIndex > 0) {
      router.push(STEP_PATHS[currentStepIndex - 1]);
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {shouldShowBackButton && (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center p-1 hover:opacity-70 transition-opacity"
                  aria-label="Go back"
                >
                  <BackArrowIcon />
                </button>
              )}
              <div className="text-sm font-medium text-neutral-600">
                Step {currentStep} of {TOTAL_STEPS}
              </div>
            </div>
            <div className="text-sm font-medium text-neutral-600">
              {Math.round(progressPercentage)}% complete
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out bg-primary-normal"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Add padding-top to account for fixed header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
        {children}
      </div>
    </div>
  );
}
