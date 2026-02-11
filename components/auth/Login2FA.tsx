'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useAppDispatch } from '@/store/hooks';
import { setCurrentUser } from '@/store/auth/reducer';
import {
  useSendLoginVerificationCodeMutation,
  useSendRegistrationVerificationCodeMutation,
} from '@/store/auth';
import httpClient from '@/lib/httpClient';
import { Input, Button } from '../ui';
import { parseApiError } from '@/lib/errorUtils';

interface Login2FAProps {
  emailOrPhone: string;
  password: string;
  token: string | null;
  userId: string | null;
  method?: 'email' | 'phone';
  isVerification?: boolean; // true for status === 0 verification, false for 2FA
  onSuccess: () => void;
  onBack: () => void;
}

interface Login2FAFormData {
  code: string;
}

export default function Login2FA({
  emailOrPhone,
  password,
  token,
  userId,
  method = 'email',
  isVerification = false,
  onSuccess,
  onBack,
}: Login2FAProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendLoginVerificationCode] = useSendLoginVerificationCodeMutation();
  const [sendRegistrationVerificationCode] = useSendRegistrationVerificationCodeMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<Login2FAFormData>({
    mode: 'onBlur',
  });

  const handleSendCode = async () => {
    try {
      if (isVerification) {
        // For verification (status === 0), use registration verification code endpoint
        if (!userId) {
          setError('code', { message: 'User ID is missing. Please try logging in again.' });
          return;
        }
        await sendRegistrationVerificationCode({
          user_id: userId,
          method: method,
        }).unwrap();
      } else {
        // For 2FA, use login verification code endpoint
        await sendLoginVerificationCode({
          username: emailOrPhone,
          password: password,
        }).unwrap();
      }

      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      const { generalError, fieldErrors } = parseApiError(
        error,
        'Failed to resend code. Please try again.'
      );

      // Handle field-specific errors
      if (fieldErrors.code || fieldErrors.verificationCode) {
        setError('code', {
          type: 'manual',
          message: fieldErrors.code || fieldErrors.verificationCode,
        });
      } else if (generalError) {
        setError('code', {
          type: 'manual',
          message: generalError,
        });
      }
    }
  };

  const onSubmit = async (data: Login2FAFormData) => {
    if (!userId) {
      setError('code', { message: 'User ID is missing. Please try logging in again.' });
      return;
    }

    setIsLoading(true);

    try {
      if (isVerification) {
        // Original verification flow for status === 0 users
        if (!token) {
          setError('code', {
            message: 'Authentication token is missing. Please try logging in again.',
          });
          setIsLoading(false);
          return;
        }

        // Verify the code using /register/verify-code with token in header
        const verifyResponse = await httpClient.post(
          '/register/verify-code',
          {
            user_id: userId,
            code: data.code,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // After successful verification, log the user in
        const signInResult = await signIn('credentials', {
          username: emailOrPhone,
          password: password,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Get the session to access user data and tokens
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();

          if (session?.user) {
            // Store tokens in localStorage
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

            // Check if user has complete userData (fully logged in)
            // If userData is missing or incomplete, user needs to complete onboarding
            if (!session.user.userData || !session.user.userData.id) {
              // User is not fully logged in, redirect to sign-up
              router.push('/sign-up');
              setIsLoading(false);
              return;
            }

            // Check onboarding completion status from userData
            const onboardingCompleted = session.user.userData?.onboarding_completed ?? false;
            if (!onboardingCompleted) {
              const onboardingStep = session.user.userData?.onboarding_current_step ?? 1;
              router.push(`/sign-up/step-${onboardingStep}`);
              setIsLoading(false);
              return;
            }
          }

          onSuccess();
        } else {
          // Even if NextAuth sign-in fails, verification was successful
          // Try to get tokens from the verify response if available
          if (verifyResponse.data?.accessToken) {
            localStorage.setItem('accessToken', verifyResponse.data.accessToken);
          }
          if (verifyResponse.data?.refreshToken) {
            localStorage.setItem('refreshToken', verifyResponse.data.refreshToken);
          }
          onSuccess();
        }
      } else {
        // 2FA flow - use /login/2fa/confirm
        const confirmResponse = await httpClient.post('/login/2fa/confirm', {
          user_id: userId,
          code: data.code,
          method: method,
        });

        // Extract data from response
        const { user, accessToken, refreshToken, subdomain, dashboardUrl, onboarding } =
          confirmResponse.data;

        if (!user || !accessToken || !refreshToken) {
          setError('code', { message: 'Invalid response from server. Please try again.' });
          setIsLoading(false);
          return;
        }

        // Check onboarding status - if not completed, redirect to appropriate step (same as LoginForm)
        if (onboarding) {
          const onboardingCompleted = onboarding?.completed === true;
          if (!onboardingCompleted) {
            const onboardingStep = onboarding?.current_step ?? 1;
            router.push(`/sign-up/step-${onboardingStep}`);
            setIsLoading(false);
            return;
          }
        }

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Prepare user data for Redux and localStorage (include onboarding for session/proxy checks)
        const onboardingCompleted = onboarding ? onboarding?.completed === true : true;
        const onboardingCurrentStep = onboarding ? (onboarding?.current_step ?? 1) : 1;
        const userData = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          subdomain: subdomain,
          dashboardUrl: dashboardUrl,
          onboarding_completed: onboardingCompleted,
          onboarding_current_step: onboardingCurrentStep,
        };

        if (process.env.NODE_ENV === 'development') {
          httpClient.defaults.headers.common['x-tenant'] = subdomain;
          localStorage.setItem('x-tenant', subdomain);
        }

        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Update Redux store with user data
        // @ts-ignore
        dispatch(setCurrentUser(userData));

        // Sign in via NextAuth using the tokens and user data to establish session
        // The auth client will recognize accessToken and refreshToken with userData for 2FA login
        const signInResult = await signIn('credentials', {
          accessToken: accessToken,
          refreshToken: refreshToken,
          userData: JSON.stringify(userData), // Pass user data as JSON string
          redirect: false,
        });

        // Get session to check userData and onboarding status
        try {
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();

          if (session?.user?.userData) {
            // Check onboarding completion status from userData
            const onboardingCompleted = session.user.userData?.onboarding_completed ?? false;
            if (!onboardingCompleted) {
              const onboardingStep = session.user.userData?.onboarding_current_step ?? 1;
              router.push(`/sign-up/step-${onboardingStep}`);
              setIsLoading(false);
              return;
            }
          } else {
            // No userData means user is not fully logged in
            router.push('/sign-up');
            setIsLoading(false);
            return;
          }
        } catch (sessionError) {
          console.warn('Failed to get session:', sessionError);
        }

        if (signInResult?.ok) {
          // Session is now established, trigger success
          onSuccess();
        } else {
          // Even if NextAuth sign-in fails, we have tokens and user data stored
          // The user can still proceed (tokens are in localStorage)
          console.warn('NextAuth sign-in failed, but tokens are stored:', signInResult?.error);
          onSuccess();
        }
      }
    } catch (error: any) {
      const { generalError, fieldErrors } = parseApiError(
        error,
        'Invalid verification code. Please try again.'
      );

      // Handle field-specific errors
      if (fieldErrors.code || fieldErrors.verificationCode) {
        setError('code', {
          type: 'manual',
          message: fieldErrors.code || fieldErrors.verificationCode,
        });
      } else if (generalError) {
        setError('code', {
          type: 'manual',
          message: generalError,
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Two-Factor Authentication</h1>
          <p className="text-neutral-600">Enter the verification code sent to</p>
          <p className="text-primary-700 font-medium mt-1">{emailOrPhone}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="Verification Code"
                type="text"
                register={register('code', {
                  required: 'Verification code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Please enter a valid 6-digit code',
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  },
                })}
                error={errors.code}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                className="text-center text-2xl font-mono tracking-widest"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                variant="ghost"
                size="sm"
                className={`text-primary-600 font-medium h-auto p-0 ${
                  countdown > 0 ? 'text-neutral-400 cursor-not-allowed' : 'hover:text-primary-700'
                }`}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </Button>
              <span className="text-neutral-500">Code expires in 10 minutes</span>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                variant="secondary"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                variant="primary"
                className="flex-1"
              >
                Verify
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
