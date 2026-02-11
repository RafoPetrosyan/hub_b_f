'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useForgetPasswordMutation } from '@/store/auth';
import { Input, Button } from '../ui';
import { parseApiError } from '@/lib/errorUtils';

interface ForgotPasswordStep1Props {
  formData: {
    emailOrPhone: string;
  };
  updateFormData: (data: Partial<any>) => void;
  onNext: () => void;
}

interface ForgotPasswordStep1FormData {
  emailOrPhone: string;
}

export default function ForgotPasswordStep1({
  formData,
  updateFormData,
  onNext,
}: ForgotPasswordStep1Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [forgetPassword] = useForgetPasswordMutation();

  const validateEmailOrPhone = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordStep1FormData>({
    mode: 'onBlur',
    defaultValues: {
      emailOrPhone: formData.emailOrPhone,
    },
  });

  const onSubmit = async (data: ForgotPasswordStep1FormData) => {
    setGeneralError(null);
    // Clear any previous field errors
    setError('emailOrPhone', { type: 'manual', message: '' });
    updateFormData({ emailOrPhone: data.emailOrPhone });
    setIsLoading(true);

    try {
      await forgetPassword({
        username: data.emailOrPhone,
      }).unwrap();

      setIsLoading(false);
      onNext();
    } catch (err: any) {
      setIsLoading(false);
      const { generalError: apiGeneralError, fieldErrors } = parseApiError(
        err,
        'Failed to send verification code. Please try again.'
      );

      // Handle field-specific errors
      if (
        fieldErrors.emailOrPhone ||
        fieldErrors.username ||
        fieldErrors.email ||
        fieldErrors.phone
      ) {
        const fieldError =
          fieldErrors.emailOrPhone ||
          fieldErrors.username ||
          fieldErrors.email ||
          fieldErrors.phone;
        setError('emailOrPhone', {
          type: 'manual',
          message: fieldError,
        });
      }

      // Show general error or field errors
      if (apiGeneralError) {
        setGeneralError(apiGeneralError);
      } else if (
        Object.keys(fieldErrors).length > 0 &&
        !fieldErrors.emailOrPhone &&
        !fieldErrors.username &&
        !fieldErrors.email &&
        !fieldErrors.phone
      ) {
        // If we have other field errors, show them
        const errorMessages = Object.values(fieldErrors).join('; ');
        setGeneralError(errorMessages);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Forgot Password?</h1>
          <p className="text-neutral-600">
            Enter your email or phone number to receive a verification code
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {generalError && (
              <div className="bg-error-light border border-error text-error px-4 py-3 rounded-lg text-sm">
                {generalError}
              </div>
            )}
            <Input
              label="Email or Phone"
              type="text"
              register={register('emailOrPhone', {
                required: 'Email or phone number is required',
                validate: (value) =>
                  validateEmailOrPhone(value) || 'Please enter a valid email or phone number',
              })}
              error={errors.emailOrPhone}
              placeholder="john@example.com or +1 (555) 123-4567"
              disabled={isLoading}
            />

            <Button type={'submit'} loading={isLoading}>
              Send Verification Code
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
