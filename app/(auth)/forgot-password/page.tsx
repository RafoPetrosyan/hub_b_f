'use client';

import { useState } from 'react';
import ForgotPasswordStep1 from '@/components/auth/ForgotPasswordStep1';
import ForgotPasswordStep2 from '@/components/auth/ForgotPasswordStep2';
import ForgotPasswordStep3 from '@/components/auth/ForgotPasswordStep3';

type ForgotPasswordStep = 'email' | 'code' | 'password';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [resetToken, setResetToken] = useState<string>('');
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (step === 'code') {
    return (
      <ForgotPasswordStep2
        emailOrPhone={formData.emailOrPhone}
        formData={formData}
        updateFormData={updateFormData}
        onNext={(token) => {
          setResetToken(token);
          setStep('password');
        }}
        onBack={() => setStep('email')}
      />
    );
  }

  if (step === 'password') {
    return (
      <ForgotPasswordStep3
        resetToken={resetToken}
        formData={formData}
        updateFormData={updateFormData}
        onBack={() => setStep('code')}
      />
    );
  }

  return (
    <ForgotPasswordStep1
      formData={formData}
      updateFormData={updateFormData}
      onNext={() => setStep('code')}
    />
  );
}
