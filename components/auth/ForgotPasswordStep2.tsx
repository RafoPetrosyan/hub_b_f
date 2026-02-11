'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useVerifyForgetPasswordCodeMutation, useForgetPasswordMutation } from '@/store/auth';
import { Input, Button } from '../ui';
import { parseApiError } from '@/lib/errorUtils';

interface ForgotPasswordStep2Props {
  emailOrPhone: string;
  formData: {
    verificationCode: string;
  };
  updateFormData: (data: Partial<any>) => void;
  onNext: (resetToken: string) => void;
  onBack: () => void;
}

interface ForgotPasswordStep2FormData {
  verificationCode: string;
}

export default function ForgotPasswordStep2({
  emailOrPhone,
  formData,
  updateFormData,
  onNext,
  onBack,
}: ForgotPasswordStep2Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyCode] = useVerifyForgetPasswordCodeMutation();
  const [forgetPassword] = useForgetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordStep2FormData>({
    mode: 'onBlur',
    defaultValues: {
      verificationCode: formData.verificationCode,
    },
  });

  const handleSendCode = async () => {
    if (countdown > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      await forgetPassword({
        username: emailOrPhone,
      }).unwrap();

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
    } catch (err: any) {
      // Silently fail - user can try again
      console.error('Failed to resend code:', err);
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = async (data: ForgotPasswordStep2FormData) => {
    updateFormData({ verificationCode: data.verificationCode });
    setIsLoading(true);

    try {
      const result = await verifyCode({
        username: emailOrPhone,
        code: data.verificationCode,
      }).unwrap();

      setIsLoading(false);
      onNext(result.resetToken);
    } catch (err: any) {
      setIsLoading(false);
      const { generalError, fieldErrors } = parseApiError(
        err,
        'Invalid verification code. Please try again.'
      );

      // Handle field-specific errors
      if (fieldErrors.code || fieldErrors.verificationCode) {
        setError('verificationCode', {
          type: 'manual',
          message: fieldErrors.code || fieldErrors.verificationCode,
        });
      } else if (generalError) {
        setError('verificationCode', {
          type: 'manual',
          message: generalError,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Verify Your Identity</h1>
          <p className="text-neutral-600">Enter the verification code sent to</p>
          <p className="text-primary-700 font-medium mt-1">{emailOrPhone}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="Verification Code"
                type="text"
                register={register('verificationCode', {
                  required: 'Verification code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Please enter a valid 6-digit code',
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  },
                })}
                error={errors.verificationCode}
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
                disabled={countdown > 0 || resendLoading}
                loading={resendLoading}
                variant="ghost"
                size="sm"
                className={`text-primary-600 font-medium h-auto p-0 ${
                  countdown > 0 || resendLoading
                    ? 'text-neutral-400 cursor-not-allowed'
                    : 'hover:text-primary-700'
                }`}
              >
                {resendLoading
                  ? 'Sending...'
                  : countdown > 0
                    ? `Resend code in ${countdown}s`
                    : 'Resend code'}
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
                Verify Code
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
