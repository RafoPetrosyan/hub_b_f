'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Input, PasswordInput } from '../ui';
import { useRegisterMutation } from '@/store/auth';
import httpClient from '@/lib/httpClient';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'min-length',
    label: 'Minimum 8 characters with letters and numbers',
    validator: (pwd) => /^.{8,}$/.test(pwd) && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd),
  },
  {
    id: 'symbol',
    label: 'Minimum 1 symbol such as !@#$%^&*()',
    validator: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  },
  {
    id: 'capital',
    label: 'Minimum 1 capital letter',
    validator: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 'no-spaces',
    label: 'No spaces',
    validator: (pwd) => !/\s/.test(pwd),
  },
];

export default function SignUpForm() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerMutation] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    mode: 'onBlur',
  });

  const watchedPassword = watch('password', '');

  const validatePassword = (value: string): boolean | string => {
    if (!value) {
      return 'Password is required';
    }

    const failedRequirements = passwordRequirements.filter((req) => !req.validator(value));

    if (failedRequirements.length > 0) {
      return 'Password does not meet all requirements';
    }

    return true;
  };

  const validateRepeatPassword = (value: string): boolean | string => {
    const passwordValue = watch('password');
    if (!value) {
      return 'Please repeat your password';
    }
    if (value !== passwordValue) {
      return 'Passwords do not match';
    }
    return true;
  };

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Call register endpoint
      const registerResponse = await registerMutation({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        password_confirmation: data.repeatPassword,
      }).unwrap();

      // Store tokens in localStorage
      if (registerResponse.access_token) {
        localStorage.setItem('accessToken', registerResponse.access_token);
      }
      if (registerResponse.refresh_token) {
        localStorage.setItem('refreshToken', registerResponse.refresh_token);
      }

      // Sign in via NextAuth to establish session
      try {
        await signIn('credentials', {
          accessToken: registerResponse.access_token,
          refreshToken: registerResponse.refresh_token,
          redirect: false,
        });
      } catch (signInError) {
        // If NextAuth sign-in fails, continue anyway since we have tokens
        console.warn('NextAuth sign-in failed, but tokens are stored:', signInError);
      }

      // Fetch onboarding data to determine current step and update session
      try {
        const onboardingResponse = await httpClient.get('/company/onboarding');
        const onboardingData = onboardingResponse.data;

        // Update NextAuth session with onboarding status
        if (onboardingData) {
          await updateSession({
            userData: {
              onboarding_completed: onboardingData.completed === true,
              onboarding_current_step: onboardingData.current_step || 1,
            },
          });
        }

        if (onboardingData && onboardingData.current_step) {
          // Navigate to the current step
          const stepNumber = onboardingData.current_step;
          router.push(`/sign-up/step-${stepNumber}`);
        } else {
          // No onboarding data, start from step 1
          router.push('/sign-up/step-1');
        }
      } catch (onboardingError) {
        // If onboarding fetch fails, start from step 1
        console.warn('Failed to fetch onboarding data, starting from step 1:', onboardingError);
        router.push('/sign-up/step-1');
      }
    } catch (err: any) {
      // Handle registration errors
      const errorMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const getPasswordRequirementStatus = (requirement: PasswordRequirement) => {
    if (!watchedPassword) return false;
    return requirement.validator(watchedPassword);
  };

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8 md:p-[90px]"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
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
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            Create your account
          </h1>
          <p className="text-sm sm:text-base text-secondary">
            Let's get started with your booking platform
          </p>
        </div>

        <div className="flex justify-center">
          {/* Sign Up Form */}
          <div className="max-w-[420px] w-full px-2 sm:px-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}
              {/* First Name Input */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-medium mb-2 uppercase tracking-wide text-label"
                >
                  FIRST NAME
                </label>
                <Input
                  id="firstName"
                  type="text"
                  register={register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  error={errors.firstName}
                  placeholder="First name"
                  disabled={isLoading}
                  className="login-input"
                  containerClassName=""
                />
              </div>

              {/* Last Name Input */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-medium mb-2 uppercase tracking-wide text-label"
                >
                  LAST NAME
                </label>
                <Input
                  id="lastName"
                  type="text"
                  register={register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  error={errors.lastName}
                  placeholder="Last name"
                  disabled={isLoading}
                  className="login-input"
                  containerClassName=""
                />
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium mb-2 uppercase tracking-wide text-label"
                >
                  EMAIL
                </label>
                <Input
                  id="email"
                  type="email"
                  register={register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  error={errors.email}
                  placeholder="Email address"
                  disabled={isLoading}
                  className="login-input"
                  containerClassName=""
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium mb-2 uppercase tracking-wide text-[var(--text-label)]"
                >
                  PASSWORD
                </label>
                <PasswordInput
                  id="password"
                  register={register('password', {
                    required: 'Password is required',
                    validate: validatePassword,
                  })}
                  error={errors.password}
                  placeholder="Password"
                  disabled={isLoading}
                  className="login-input"
                  containerClassName=""
                />
              </div>

              {/* Repeat Password Input */}
              <div>
                <label
                  htmlFor="repeatPassword"
                  className="block text-xs font-medium mb-2 uppercase tracking-wide text-[var(--text-label)]"
                >
                  REPEAT PASSWORD
                </label>
                <PasswordInput
                  id="repeatPassword"
                  register={register('repeatPassword', {
                    required: 'Please repeat your password',
                    validate: validateRepeatPassword,
                  })}
                  error={errors.repeatPassword}
                  placeholder="Repeat password"
                  disabled={isLoading}
                  className="login-input"
                  containerClassName=""
                />
              </div>

              {/* Password Requirements */}
              <div className="space-y-1.5 sm:space-y-2">
                {passwordRequirements.map((requirement) => {
                  const isValid = getPasswordRequirementStatus(requirement);
                  return (
                    <div key={requirement.id} className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: isValid ? 'var(--success)' : 'var(--text-validation)',
                          border: isValid ? 'none' : '1px solid var(--border-default)',
                        }}
                      >
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span
                        className="text-xs sm:text-sm"
                        style={{
                          color: isValid ? 'var(--success)' : 'var(--text-validation)',
                        }}
                      >
                        {requirement.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <Button
                loading={isLoading}
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-4 rounded-[90px] bg-primary-normal font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                style={{
                  color: 'var(--text-on-gradient)',
                }}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-secondary">
                Already have an account?
                <Link href="/login" className="font-medium hover:underline text-brand-secondary">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
