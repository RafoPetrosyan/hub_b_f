'use client';

import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Input, Switch, PasswordInput, PhoneInput } from '@/components/ui';
import { UserIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import ChangePasswordModal from '@/components/dashboard/ChangePasswordModal';
import { usePutAccountMutation, usePostTwoFactorMutation } from '@/store/business-profile';
import { useUploadImageMutation, useDeleteUploadMutation } from '@/store/upload';
import { toast } from 'react-toastify';
import httpClient from '@/lib/httpClient';
import { parseApiError } from '@/lib/errorUtils';

interface AccountOwnerFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function AccountOwnerPage() {
  const { data: session, update: updateSession } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [changePasswordModalStep, setChangePasswordModalStep] = useState<'2fa' | 'success' | null>(
    null
  );
  const [passwordPayload, setPasswordPayload] = useState<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [handleAccountUpdate, { isLoading: isAccountLoading }] = usePutAccountMutation();
  const [handleTwoFactorUpdate, { isLoading: is2faLoading, isSuccess: is2faSuccess }] =
    usePostTwoFactorMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [deleteUpload, { isLoading: isDeletingImage }] = useDeleteUploadMutation();

  // Store filename from upload response so we can pass it to delete API
  const [profileImageFilename, setProfileImageFilename] = useState<string | null>(null);

  const userData = (session?.user as any)?.userData;
  const firstName = userData?.first_name || '';
  const lastName = userData?.last_name || '';
  const email = userData?.email || session?.user?.email || '';
  const phone = userData?.phone || '';

  useEffect(() => {
    if (userData?.tfa_mode) setTwoFactorEnabled(userData.tfa_mode);
    if (userData?.profile_picture) setProfileImage(userData.profile_picture);
  }, [userData?.tfa_mode, userData?.profile_picture]);

  useEffect(() => {
    if (is2faSuccess) {
      toast.success('Two-factor authentication updated successfully!');
      updateSession({
        userData: { ...(userData || {}), tfa_mode: twoFactorEnabled },
      }).then(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when 2FA update succeeds
  }, [is2faSuccess]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountOwnerFormData>({
    mode: 'onBlur',
    defaultValues: {
      firstName,
      lastName,
      email,
      phone,
    },
  });

  const onSubmit = async (data: AccountOwnerFormData) => {
    try {
      await handleAccountUpdate({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        logo: profileImage,
      }).unwrap();
      await updateSession({
        userData: {
          ...(userData || {}),
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          email: data.email,
          profile_picture: profileImage ?? undefined,
          logo: profileImage ?? undefined,
        },
      });
      toast.success('Account updated successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update account.');
    }
  };

  const handleTwoFactorChange = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    handleTwoFactorUpdate({ mode: checked });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage({ file }).unwrap();
      setProfileImage(res.url);
      setProfileImageFilename(res.filename);
      await handleAccountUpdate({
        first_name: firstName,
        last_name: lastName,
        phone: userData?.phone ?? '',
        email: userData?.email ?? '',
        logo: res.url,
      }).unwrap();
      await updateSession({
        userData: {
          ...(userData || {}),
          profile_picture: res.url,
          logo: res.url,
        },
      });
      toast.success('Profile photo updated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload image.');
    }
    e.target.value = '';
  };

  const getFilenameFromUrl = (url: string): string | null => {
    try {
      const pathname = new URL(url).pathname;
      const segment = pathname.split('/').filter(Boolean).pop();
      return segment || null;
    } catch {
      return null;
    }
  };

  const handleRemoveImage = async () => {
    if (!profileImage) return;
    const filename = profileImageFilename ?? getFilenameFromUrl(profileImage);
    try {
      if (filename) {
        await deleteUpload({ type: 'image', filename }).unwrap();
      }
      await handleAccountUpdate({
        first_name: firstName,
        last_name: lastName,
        phone: userData?.phone ?? '',
        email: userData?.email ?? '',
        logo: null,
      }).unwrap();
      await updateSession({
        userData: {
          ...(userData || {}),
          profile_picture: null,
          logo: null,
        },
      });
      setProfileImage(null);
      setProfileImageFilename(null);
      toast.success('Profile photo removed.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove image.');
    }
  };

  const validatePasswordForm = () => {
    const err: typeof passwordErrors = {};
    if (!currentPassword) err.currentPassword = 'Current password is required';
    if (!newPassword) {
      err.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      err.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      err.newPassword = 'Password must contain letters and numbers';
    }
    if (!confirmPassword) {
      err.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      err.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;
    setIsPasswordLoading(true);
    setPasswordErrors({});
    try {
      const response = await httpClient.post('/account/change-password', {
        old_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (response.data?.code === '2FA_REQUIRED') {
        setPasswordPayload({
          currentPassword,
          newPassword,
          confirmPassword,
        });
        setChangePasswordModalStep('2fa');
        return;
      }

      setChangePasswordModalStep('success');
    } catch (error: any) {
      const { generalError, fieldErrors } = parseApiError(
        error,
        'Failed to change password. Please try again.'
      );
      const fieldNameMap: Record<string, keyof typeof passwordErrors> = {
        old_password: 'currentPassword',
        password: 'newPassword',
        password_confirmation: 'confirmPassword',
      };
      const newErrors: typeof passwordErrors = {};
      Object.keys(fieldErrors).forEach((apiField) => {
        const key = fieldNameMap[apiField];
        if (key) newErrors[key] = fieldErrors[apiField];
      });
      if (generalError) newErrors.general = generalError;
      setPasswordErrors(newErrors);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const closeChangePasswordModal = () => {
    setChangePasswordModalStep(null);
    setPasswordPayload(null);
  };

  const onPasswordChangeSuccess = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
  };

  return (
    <div>
      <div className="max-w-[1600px]">
        <div className="mb-[12px]">
          <h1 className="text-xl font-bold text-d-title mb-2">Account Owner</h1>
          <p className="text-sm text-d-sub-title font-medium">Manage your business configuration</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Profile Photo Section - same pattern as sign-up step-8 */}
          <div className="bg-d-content-item-bg px-4 sm:px-5 md:px-6 py-4 sm:py-5 rounded-[12px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 relative group">
                <div className="w-[105px] h-[101px] sm:w-28 sm:h-28 rounded-[28px] bg-neutral-800 overflow-hidden flex items-center justify-center relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  )}
                  {/* Overlay with Edit and Delete Icons (bottom right) */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 p-2 transition-opacity ${
                      profileImage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <label
                      className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ${
                        isUploadingImage ? 'pointer-events-none opacity-60' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <EditIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </label>
                    {profileImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isDeletingImage}
                        className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ${
                          isDeletingImage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-d-content-item-title mb-1">
                  Profile Photo
                </h3>
                <p className="text-xs sm:text-sm text-d-content-item-sub-title font-medium">
                  Update your profile picture
                </p>
              </div>
            </div>
          </div>

          <div className="bg-d-content-item-bg rounded-[12px] p-6">
            <h2 className="text-xl font-bold text-d-content-item-title">Personal Information</h2>
            <p className="text-sm text-d-content-item-sub-title font-medium mb-6">
              Your account owner details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  FIRST NAME
                </label>
                <Input
                  placeholder="First name"
                  register={register('firstName', { required: 'First name is required' })}
                  error={errors.firstName}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  LAST NAME
                </label>
                <Input
                  placeholder="Last name"
                  register={register('lastName')}
                  error={errors.lastName}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  PHONE NUMBER
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      placeholder="Enter phone number"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.phone}
                      containerClassName="w-full"
                      defaultCountry="us"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  EMAIL
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  register={register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  error={errors.email}
                  containerClassName="w-full"
                  disabled={true}
                  borderClassName="!border-border-default border-2"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isAccountLoading}
                className="!bg-d-accent rounded-full w-[250px]"
              >
                Save changes
              </Button>
            </div>
          </div>

          {/* Password section: 2FA + password change in one block */}
          <div className="bg-d-content-item-bg rounded-lg p-6">
            {/* Two-Factor Authentication - inside password content, separate functionality */}
            <div className="bg-d-content-bg rounded-xl p-4 sm:p-5 mb-6">
              <div className="flex items-center gap-4">
                <Switch
                  checked={twoFactorEnabled}
                  onChange={(e) => handleTwoFactorChange((e.target as HTMLInputElement).checked)}
                  disabled={is2faLoading}
                  className="flex-shrink-0"
                  variant="dashboard"
                />
                <div>
                  <h2 className="text-sm font-bold text-d-content-item-title">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-d-content-item-sub-title mt-0.5 font-medium">
                    Add an extra layer of security to your account. Require a verification code in
                    addition to your password
                  </p>
                </div>
              </div>
            </div>

            {/* Password change */}
            <h2 className="text-lg font-bold text-d-content-item-title">Password</h2>
            <p className="text-sm text-d-content-item-sub-title mb-6">
              Change your account password
            </p>
            {passwordErrors.general && (
              <div className="text-sm text-error bg-error/10 p-3 rounded-lg mb-4">
                {passwordErrors.general}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  CURRENT PASSWORD
                </label>
                <PasswordInput
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword)
                      setPasswordErrors((p) => ({ ...p, currentPassword: undefined }));
                  }}
                  containerClassName="w-full max-w-[767px]"
                  borderClassName="!border-border-default border-2"
                  error={passwordErrors.currentPassword}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  NEW PASSWORD
                </label>
                <PasswordInput
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword)
                      setPasswordErrors((p) => ({ ...p, newPassword: undefined }));
                  }}
                  containerClassName="w-full max-w-[767px]"
                  borderClassName="!border-border-default border-2"
                  error={passwordErrors.newPassword}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  CONFIRM NEW PASSWORD
                </label>
                <PasswordInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                  containerClassName="w-full max-w-[767px]"
                  borderClassName="!border-border-default border-2"
                  error={passwordErrors.confirmPassword}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleUpdatePassword}
                loading={isPasswordLoading}
                disabled={isPasswordLoading}
                className="!bg-d-accent rounded-full w-[250px]"
              >
                Update Password
              </Button>
            </div>
          </div>
        </form>
      </div>

      <ChangePasswordModal
        isOpen={changePasswordModalStep !== null}
        step={changePasswordModalStep ?? 'success'}
        onClose={closeChangePasswordModal}
        onSuccess={onPasswordChangeSuccess}
        passwordPayload={changePasswordModalStep === '2fa' ? passwordPayload : undefined}
      />
    </div>
  );
}
