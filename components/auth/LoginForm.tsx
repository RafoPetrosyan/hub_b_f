'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setCurrentUser } from '@/store/auth/reducer';
import { useLoginMutation } from '@/store/auth';
import Login2FA from './Login2FA';
import { Input, Button, PasswordInput, Checkbox } from '../ui';

type LoginStep = 'login' | '2fa';

interface LoginFormData {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<LoginStep>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'email' | 'phone'>('email');
  const [login] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    mode: 'onBlur',
  });

  const validateEmailOrPhone = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const determineMethod = (value: string): 'email' | 'phone' => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? 'email' : 'phone';
  };

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // First, make a direct API call to check if verification is needed
      // This allows us to capture the token even when status is 0
      try {
        const loginResponse = await login({
          username: data.emailOrPhone,
          password: data.password,
        }).unwrap();

        // Check onboarding status - if not completed, redirect to appropriate step
        if (loginResponse.onboarding) {
          const onboardingCompleted = loginResponse.onboarding?.completed === true;
          if (!onboardingCompleted) {
            const onboardingStep = loginResponse.onboarding?.current_step ?? 1;
            router.push(`/sign-up/step-${onboardingStep}`);
            setIsLoading(false);
            return;
          }
        }

        // If onboarding is completed, proceed with normal login via NextAuth
        const result = await signIn('credentials', {
          username: data.emailOrPhone,
          password: data.password,
          redirect: false,
        });

        if (result?.ok) {
          // Get the session to access user data and tokens
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();

          if (session?.user) {
            // Store tokens in localStorage for httpClient compatibility
            if (session.user.accessToken) {
              localStorage.setItem('accessToken', session.user.accessToken);
            }
            if (session.user.refreshToken) {
              localStorage.setItem('refreshToken', session.user.refreshToken);
            }

            // Update Redux store with user data
            if (session.user.userData) {
              dispatch(setCurrentUser(session.user.userData));
              localStorage.setItem('currentUser', JSON.stringify(session.user.userData));
            }
          }

          router.push('/');
        } else if (result?.error) {
          // Check if error is 2FA_REQUIRED
          // The error message might contain the error code, or we need to check the session
          // Since NextAuth doesn't pass custom error data, we'll need to handle this differently
          // We'll check the error message or make another call to get the user_id
          if (result.error.includes('2FA_REQUIRED') || result.error === '2FA_REQUIRED') {
            // Try to get user_id from the login response if available
            // Otherwise, we'll need to extract it from the error
            // For now, we'll need to make the login call again to get the user_id
            try {
              const loginResponse = await login({
                username: data.emailOrPhone,
                password: data.password,
              }).unwrap();

              // This shouldn't happen if 2FA is required, but handle it
              setError('Unexpected response. Please try again.');
              setIsLoading(false);
            } catch (twoFAError: any) {
              // Extract user_id from error response
              const userId = twoFAError?.data?.user_id || twoFAError?.response?.data?.user_id;
              if (userId) {
                setTwoFactorUserId(userId);
                setTwoFactorMethod(determineMethod(data.emailOrPhone));
                setStep('2fa');
                setIsLoading(false);
                return;
              }
              setError('2FA is required but user ID is missing. Please try again.');
              setIsLoading(false);
            }
          } else {
            setError(result.error);
            setIsLoading(false);
          }
        }
      } catch (loginError: any) {
        // Check if the error is 2FA_REQUIRED
        const errorCode = loginError?.data?.code || loginError?.response?.data?.code;
        if (errorCode === '2FA_REQUIRED') {
          const userId = loginError?.data?.user_id || loginError?.response?.data?.user_id;
          if (userId) {
            setTwoFactorUserId(userId);
            setTwoFactorMethod(determineMethod(data.emailOrPhone));
            setStep('2fa');
            setIsLoading(false);
            return;
          }
        }

        // If login API call fails, try NextAuth as fallback
        const result = await signIn('credentials', {
          username: data.emailOrPhone,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          // Check if error is 2FA_REQUIRED
          if (result.error.includes('2FA_REQUIRED') || result.error === '2FA_REQUIRED') {
            // Try to get user_id from the login error
            const userId = loginError?.data?.user_id || loginError?.response?.data?.user_id;
            if (userId) {
              setTwoFactorUserId(userId);
              setTwoFactorMethod(determineMethod(data.emailOrPhone));
              setStep('2fa');
              setIsLoading(false);
              return;
            }
            setError('2FA is required but user ID is missing. Please try again.');
            setIsLoading(false);
            return;
          }
          setError(result.error);
          setIsLoading(false);
          return;
        }

        if (result?.ok) {
          // Get the session to access user data and tokens
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();

          if (session?.user) {
            if (session.user.accessToken) {
              localStorage.setItem('accessToken', session.user.accessToken);
            }
            if (session.user.refreshToken) {
              localStorage.setItem('refreshToken', session.user.refreshToken);
            }

            if (session.user.userData) {
              dispatch(setCurrentUser(session.user.userData));
              localStorage.setItem('currentUser', JSON.stringify(session.user.userData));
            }
          }

          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  if (step === '2fa') {
    // Determine if this is verification (status === 0) or 2FA
    const isVerification = !!verificationToken && !!userId && !twoFactorUserId;

    return (
      <Login2FA
        emailOrPhone={getValues('emailOrPhone')}
        password={getValues('password')}
        token={verificationToken}
        userId={userId || twoFactorUserId}
        method={twoFactorMethod}
        isVerification={isVerification}
        onSuccess={() => {
          router.push('/');
        }}
        onBack={() => {
          setStep('login');
          setVerificationToken(null);
          setUserId(null);
          setTwoFactorUserId(null);
        }}
      />
    );
  }


  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8 md:p-[90px]"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            Login to Aesthetic HUB
          </h1>
          <p className="text-sm sm:text-base text-secondary">
            Create an account or log in to manage your business.
          </p>
        </div>

        <div className="flex justify-center">
          {/* Login Form */}
          <div className="space-y-4 sm:space-y-6 max-w-[420px] w-full px-2 sm:px-0">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => {
                // TODO: Implement Google OAuth
                console.log('Google sign in clicked');
              }}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-[24px] border transition-all hover:bg-gray-50 text-sm sm:text-base"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-body)',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <g fill="none" fillRule="evenodd">
                  <path
                    d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.96-2.18l-2.908-2.258c-.806.54-1.837.86-3.052.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.348 6.173 0 7.55 0 9s.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </g>
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-error-light border border-error text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  htmlFor="emailOrPhone"
                  className="block text-xs font-medium mb-2 uppercase tracking-wide text-label"
                >
                  EMAIL
                </label>
                <Input
                  id="emailOrPhone"
                  type="text"
                  register={register('emailOrPhone', {
                    required: 'Email or phone number is required',
                    validate: (value) =>
                      validateEmailOrPhone(value) || 'Please enter a valid email or phone number',
                  })}
                  error={errors.emailOrPhone}
                  placeholder="example@provider.com"
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
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  error={errors.password}
                  placeholder="**********"
                  disabled={isLoading}
                  className="login-input"
                  containerClassName=""
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Checkbox
                  id="rememberMe"
                  label="Remember me"
                  register={register('rememberMe')}
                  labelClassName="text-xs sm:text-sm text-secondary"
                />
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm font-medium hover:underline text-secondary"
                >
                  Forgot Password?
                </Link>
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

            {/* Sign Up Link */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-secondary">
                Don't have an account?{' '}
                <Link href="/sign-up" className="font-medium hover:underline text-brand-secondary">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
