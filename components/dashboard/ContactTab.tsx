'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Switch, PhoneInput } from '@/components/ui';
import { EmailIcon, UserIcon, UploadIcon, LockIcon } from '@/components/ui/icons';
import ChangePasswordModal from '@/components/dashboard/ChangePasswordModal';
import { usePutAccountMutation, usePostTwoFactorMutation } from '@/store/business-profile';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ContactTabProps {
  userData: any;
  session: any;
}

export default function ContactTab({ userData, session }: ContactTabProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [handleAccountUpdate, { isLoading: isAccountLoading, isSuccess: isAccountSuccess }] =
    usePutAccountMutation();
  const [handleTwoFactorUpdate, { isLoading: is2faLoading }] = usePostTwoFactorMutation();

  const firstName = userData?.first_name || '';
  const lastName = userData?.last_name || '';
  const email = userData?.email || session?.user?.email || '';
  const phone = userData?.phone || '';

  useEffect(() => {
    if (userData?.tfa_mode) setTwoFactorEnabled(userData.tfa_mode);
    if (userData?.profile_picture) setProfileImage(userData.profile_picture);
  }, [userData?.tfa_mode, userData?.profile_picture]);

  useEffect(() => {
    if (isAccountSuccess) {
      toast.success('Account updated successfully!');
    }
  }, [isAccountSuccess]);

  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    control: controlContact,
    formState: { errors: contactErrors },
  } = useForm<ContactFormData>({
    mode: 'onBlur',
    defaultValues: {
      firstName,
      lastName,
      email,
      phone,
    },
  });

  const onSubmitContact = (data: ContactFormData) => {
    handleAccountUpdate({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      email: data.email,
      logo: profileImage,
    });
  };

  const handleTwoFactorChange = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    handleTwoFactorUpdate({ mode: checked });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  return (
    <>
      <form onSubmit={handleSubmitContact(onSubmitContact)} className="space-y-8">
        {/* Contact Person Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Contact Person Details</h2>

          {/* Profile Picture Upload */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-neutral-200 border-2 border-neutral-300 overflow-hidden flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-neutral-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-4 mb-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                      <UploadIcon />
                      Upload photo
                    </span>
                  </label>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-neutral-600 hover:text-neutral-700 font-medium"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  PNG, JPG up to 5MB. Recommended 400x400px
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                register={registerContact('firstName', {
                  required: 'First name is required',
                })}
                error={contactErrors.firstName}
                containerClassName="w-full"
              />
              <Input
                label="Last Name"
                register={registerContact('lastName')}
                error={contactErrors.lastName}
                containerClassName="w-full"
              />
            </div>

            <Input
              label="Email"
              type="email"
              register={registerContact('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              error={contactErrors.email}
              containerClassName="w-full"
              prefixIcon={<EmailIcon className="w-5 h-5" />}
              disabled={true}
            />

            <Controller
              name="phone"
              control={controlContact}
              rules={{
                required: 'Phone number is required',
              }}
              render={({ field }) => (
                <PhoneInput
                  label="Phone Number"
                  value={field.value}
                  onChange={field.onChange}
                  error={contactErrors.phone}
                  defaultCountry="US"
                  containerClassName="w-full"
                />
              )}
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="border-t border-neutral-200 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <LockIcon className="w-5 h-5 text-neutral-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">Security</h2>
          </div>

          <div className="space-y-6">
            {/* Password Section */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <LockIcon className="w-5 h-5 text-neutral-600" />
                  <label className="text-sm font-medium text-neutral-700">Password</label>
                </div>
                <p className="text-sm text-neutral-500 ml-7">Last changed 3 months ago</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsChangePasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium text-neutral-700">
                    Two-Factor Authentication
                  </label>
                  <span className="text-sm text-neutral-500">
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 ml-0">
                  Adds an extra layer of security to your account
                </p>
              </div>
              <div>
                <Switch
                  checked={twoFactorEnabled}
                  onChange={(e) => handleTwoFactorChange((e.target as HTMLInputElement).checked)}
                  disabled={is2faLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-neutral-200">
          <Button type="submit" variant="primary" size="md" loading={isAccountLoading}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSuccess={() => {
          console.log('Password changed successfully');
        }}
      />
    </>
  );
}
