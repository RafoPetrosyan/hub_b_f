'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button, Input, Modal } from '@/components/ui';
import httpClient from '@/lib/httpClient';
import { parseApiError } from '@/lib/errorUtils';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  step: '2fa' | 'success';
  onClose: () => void;
  onSuccess?: () => void;
  passwordPayload?: ChangePasswordPayload | null;
}

export default function ChangePasswordModal({
  isOpen,
  step: stepProp,
  onClose,
  onSuccess,
  passwordPayload,
}: ChangePasswordModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'2fa' | 'success'>(stepProp);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [errors, setErrors] = useState<{ twoFactorCode?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setStep(stepProp);
  }, [isOpen, stepProp]);

  // When modal is open with success step (e.g. from page after change-password without 2FA), run redirect
  useEffect(() => {
    if (!isOpen || step !== 'success') return;
    const t = setTimeout(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      signOut({ redirect: false }).then(() => {
        router.push('/login');
        handleClose();
        onSuccess?.();
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [isOpen, step]);

  const handlePasswordChangeWithToken = async (twoFaToken: string) => {
    if (!passwordPayload) return;
    return await httpClient.post(
      '/account/change-password',
      {
        old_password: passwordPayload.currentPassword,
        password: passwordPayload.newPassword,
        password_confirmation: passwordPayload.confirmPassword,
      },
      { headers: { 'x-2fa-token': twoFaToken } }
    );
  };

  const handleClose = () => {
    setTwoFactorCode('');
    setErrors({});
    onClose();
  };

  const handleSuccessAndRedirect = () => {
    setStep('success');
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setErrors({ twoFactorCode: 'Please enter a valid 6-digit code' });
      return;
    }

    if (!passwordPayload) return;

    setIsLoading(true);
    setErrors({});

    try {
      const confirmResponse = await httpClient.post('/account/2fa/confirm', {
        code: twoFactorCode,
      });

      const twoFaToken = confirmResponse.data?.twoFaToken;

      if (!twoFaToken) {
        setErrors({ twoFactorCode: 'Invalid response from server. Please try again.' });
        setIsLoading(false);
        return;
      }

      await handlePasswordChangeWithToken(twoFaToken);
      handleSuccessAndRedirect();
    } catch (error: any) {
      const { generalError, fieldErrors } = parseApiError(
        error,
        'Invalid verification code. Please try again.'
      );
      if (fieldErrors.code || fieldErrors.twoFactorCode) {
        setErrors({ twoFactorCode: fieldErrors.code || fieldErrors.twoFactorCode });
      } else if (generalError) {
        setErrors({ twoFactorCode: generalError });
      } else if (Object.keys(fieldErrors).length > 0) {
        setErrors({ twoFactorCode: Object.values(fieldErrors).join('; ') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FACodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setTwoFactorCode(value);
    if (errors.twoFactorCode) {
      setErrors({ ...errors, twoFactorCode: undefined });
    }
  };

  const lockIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );

  const successIcon = (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  // Success step
  if (step === 'success') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Password Changed"
        titleIcon={successIcon}
        size="md"
        showCloseButton={false}
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Password Changed Successfully
            </h3>
            <p className="text-sm text-neutral-600">
              Your password has been changed. You will be redirected to the login page.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // 2FA step
  if (step === '2fa') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Two-Factor Authentication"
        titleIcon={lockIcon}
        size="md"
      >
        <form onSubmit={handle2FASubmit} className="space-y-6">
          <p className="text-sm text-neutral-600">
            Enter the 6-digit verification code sent to your device to complete the password change.
          </p>

          <Input
            label="Verification Code"
            type="text"
            value={twoFactorCode}
            onChange={handle2FACodeChange}
            placeholder="000000"
            maxLength={6}
            error={errors.twoFactorCode}
            disabled={isLoading}
            className="text-center text-2xl font-mono tracking-widest"
            containerClassName="w-full"
            required
          />

          {errors.general && <div className="text-sm text-error">{errors.general}</div>}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              disabled={isLoading || twoFactorCode.length !== 6}
            >
              Verify
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
}
