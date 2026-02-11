'use client';

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Input, Button, Select, PhoneInput, ErrorAlert } from '@/components/ui';
import { UploadIcon, InfoIcon } from '@/components/ui/icons';
import type { SelectOption } from '@/components/ui';
import { useGetLocationsQuery } from '@/store/locations';
import { getErrorMessage } from '@/lib/errorUtils';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AddUserFormData) => Promise<void> | void;
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    locationId: string;
  };
  mode?: 'add' | 'edit';
}

interface AddUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  locationId: string;
}

// Role options with descriptions
const roleOptions: SelectOption[] = [
  { value: 'Business Admin', label: 'Business Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Provider', label: 'Provider' },
];

const roleDescriptions: Record<string, string> = {
  'Business Admin': 'Full access to business features and settings',
  Manager: 'Access to assigned locations and users',
  Provider: 'Access only to assigned clients',
};

export default function AddUserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'add',
}: AddUserModalProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch locations from API
  const { data: locationsData, isLoading: isLoadingLocations } = useGetLocationsQuery();

  // Build location options
  const locationOptions: SelectOption[] = useMemo(() => {
    if (!locationsData) {
      return [];
    }

    return [
      { value: '', label: 'Select a location (optional)' },
      ...locationsData.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    ];
  }, [locationsData]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddUserFormData>({
    mode: 'onBlur',
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      locationId: '',
    },
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        locationId: '',
      });
    }
    // Clear error when modal opens or initialData changes
    setSubmitError(null);
  }, [initialData, reset, isOpen]);

  const watchedRole = watch('role');

  const handleFormSubmit = async (data: AddUserFormData) => {
    setSubmitError(null); // Clear previous errors
    if (onSubmit) {
      try {
        await onSubmit(data);
        // Only reset form and close modal on success
        reset();
        setProfileImage(null);
        setSubmitError(null);
        onClose();
      } catch (error: any) {
        // Extract error message and display in modal
        const errorMessage = getErrorMessage(error, 'An error occurred. Please try again.');
        setSubmitError(errorMessage || 'An error occurred. Please try again.');
      }
    } else {
      // If no onSubmit handler, just close
      reset();
      setProfileImage(null);
      onClose();
    }
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

  const handleClose = () => {
    reset();
    setProfileImage(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'edit' ? 'Edit User' : 'Add User'}
      size="lg"
    >
      <div>
        <p className="text-sm text-neutral-600 mb-6">
          {mode === 'edit'
            ? 'Update the user information below'
            : 'Fill out the form to add a new user'}
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* User Photo Section */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-neutral-200 border-2 border-neutral-300 overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-neutral-400 font-medium">?</span>
                )}
              </div>
            </div>
            <div className="flex-1 pt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                <UploadIcon className="w-4 h-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Enter first name"
              required
              register={register('firstName', {
                required: 'First name is required',
              })}
              error={errors.firstName}
              containerClassName="w-full"
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              required
              register={register('lastName', {
                required: 'Last name is required',
              })}
              error={errors.lastName}
              containerClassName="w-full"
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            required
            register={register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            })}
            error={errors.email}
            containerClassName="w-full"
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label="Phone"
                value={field.value}
                onChange={field.onChange}
                error={errors.phone}
                defaultCountry="us"
                containerClassName="w-full"
              />
            )}
          />

          {/* Role Selection */}
          <div>
            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Role <span className="text-error">*</span>
                    </label>
                    <InfoIcon className="w-4 h-4 text-neutral-400" />
                  </div>
                  <Select
                    options={roleOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select role"
                    containerClassName="w-full"
                  />
                  {watchedRole && roleDescriptions[watchedRole] && (
                    <p className="mt-2 text-sm text-neutral-600">{roleDescriptions[watchedRole]}</p>
                  )}
                  {errors.role && (
                    <p className="mt-1 text-sm text-error">
                      {typeof errors.role === 'string' ? errors.role : errors.role.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Location Selection */}
          <div>
            <Controller
              name="locationId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Location
                  </label>
                  <Select
                    options={locationOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      isLoadingLocations ? 'Loading locations...' : 'Select a location (optional)'
                    }
                    containerClassName="w-full"
                    disabled={isLoadingLocations}
                  />
                  {errors.locationId && (
                    <p className="mt-1 text-sm text-error">
                      {typeof errors.locationId === 'string'
                        ? errors.locationId
                        : errors.locationId.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Password Information */}
          <div className="flex items-start gap-2 p-4 bg-neutral-50 rounded-lg">
            <InfoIcon className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Password</p>
              <p className="text-sm text-neutral-600">
                An invitation with a link to set up a password will be sent to the specified email.
              </p>
            </div>
          </div>

          {/* Error Alert - Display above submit button */}
          {submitError && (
            <ErrorAlert
              message={submitError}
              onDismiss={() => setSubmitError(null)}
              title="Error"
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
            <Button type="button" variant="outline" size="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              {mode === 'edit' ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
