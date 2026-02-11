'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useResetPasswordMutation } from '@/store/auth';
import { Input, Button } from '../ui';
import { parseApiError } from '@/lib/errorUtils';

interface ForgotPasswordStep3Props {
  resetToken: string;
  formData: {
    newPassword: string;
    confirmPassword: string;
  };
  updateFormData: (data: Partial<any>) => void;
  onBack: () => void;
}

interface ForgotPasswordStep3FormData {
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPasswordStep3({
  resetToken,
  formData,
  updateFormData,
  onBack,
}: ForgotPasswordStep3Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetPassword] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
  } = useForm<ForgotPasswordStep3FormData>({
    mode: 'onBlur',
    defaultValues: {
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ForgotPasswordStep3FormData) => {
    setError(null);
    // Clear any previous field errors
    setFormError('newPassword', { type: 'manual', message: '' });
    setFormError('confirmPassword', { type: 'manual', message: '' });
    updateFormData({ newPassword: data.newPassword, confirmPassword: data.confirmPassword });
    setIsLoading(true);

    try {
      await resetPassword({
        resetToken,
        password: data.newPassword,
        password_confirmation: data.confirmPassword,
      }).unwrap();

      setIsLoading(false);
      // Redirect to login page after successful password reset
      router.push('/login');
    } catch (err: any) {
      setIsLoading(false);
      const { generalError, fieldErrors } = parseApiError(
        err,
        'Failed to reset password. Please try again.'
      );

      // Map API field names to form field names
      const fieldNameMap: Record<string, keyof ForgotPasswordStep3FormData> = {
        password: 'newPassword',
        password_confirmation: 'confirmPassword',
        newPassword: 'newPassword',
        confirmPassword: 'confirmPassword',
      };

      // Set field-specific errors
      Object.keys(fieldErrors).forEach((apiFieldName) => {
        const formFieldName = fieldNameMap[apiFieldName];
        if (formFieldName) {
          setFormError(formFieldName, {
            type: 'manual',
            message: fieldErrors[apiFieldName],
          });
        }
      });

      // Show general error or other field errors
      if (generalError) {
        setError(generalError);
      } else if (Object.keys(fieldErrors).length > 0) {
        // Check if there are errors not mapped to form fields
        const unmappedErrors = Object.keys(fieldErrors).filter((key) => !fieldNameMap[key]);
        if (unmappedErrors.length > 0) {
          const errorMessages = unmappedErrors.map((key) => fieldErrors[key]).join('; ');
          setError(errorMessages);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Set New Password</h1>
          <p className="text-neutral-600">Create a strong password for your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-error-light border border-error text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Input
              label="New Password"
              type="password"
              required
              register={register('newPassword', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              error={errors.newPassword}
              helperText="Must be at least 8 characters long"
              placeholder="••••••••"
              disabled={isLoading}
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              register={register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              error={errors.confirmPassword}
              placeholder="••••••••"
              disabled={isLoading}
            />

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
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
