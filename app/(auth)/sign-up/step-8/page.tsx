'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button, Input, Select, Textarea, PhoneInput } from '@/components/ui';
import { EditIcon, TrashIcon, BuildingIcon } from '@/components/ui/icons';
import { COUNTRIES, US_STATES, IANA_TIMEZONE_OPTIONS } from '@/constants/staticData';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { useSubmitOnboardingStepMutation } from '@/store/onboarding';
import { useUploadImageMutation, useDeleteUploadMutation } from '@/store/upload';
import { parseApiError } from '@/lib/errorUtils';

interface BusinessInfoFormData {
  businessName: string;
  businessPhone?: string;
  city: string;
  stateRegion: string;
  country: string;
  timeZone: string;
  physicalAddress?: string;
}

export default function Step8Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(8);
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [deleteUpload] = useDeleteUploadMutation();
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors },
  } = useForm<BusinessInfoFormData>({
    mode: 'onBlur',
    shouldFocusError: false,
    defaultValues: {
      businessName: '',
      businessPhone: '',
      city: '',
      stateRegion: '',
      country: '',
      timeZone: '',
      physicalAddress: '',
    },
  });

  // Restore data from onboardingData if available
  useEffect(() => {
    const step8Data = onboardingData?.steps_data?.['8'];
    if (step8Data) {
      reset({
        businessName: step8Data.business_name || '',
        businessPhone: step8Data.phone || '',
        city: step8Data.city || '',
        stateRegion: step8Data.state || '',
        country: step8Data.country || '',
        timeZone: step8Data.timezone || '',
        physicalAddress: step8Data.address || '',
      });
      // Restore logo URL if available
      if (step8Data.logo_url) {
        setUploadedImageUrl(step8Data.logo_url);
        setBusinessLogo(step8Data.logo_url);
      }
    }
  }, [onboardingData, reset]);

  // Map API field names to form field names
  const fieldNameMap: { [key: string]: keyof BusinessInfoFormData } = {
    business_name: 'businessName',
    phone: 'businessPhone',
    city: 'city',
    state: 'stateRegion',
    country: 'country',
    timezone: 'timeZone',
    address: 'physicalAddress',
  };

  const onSubmit = async (data: BusinessInfoFormData) => {
    try {
      // Prepare the request body
      const requestBody: {
        step: number;
        business_name: string;
        logo_url?: string;
        phone?: string;
        city: string;
        state: string;
        country: string;
        timezone: string;
        address?: string;
      } = {
        step: 8,
        business_name: data.businessName,
        city: data.city,
        state: data.stateRegion,
        country: data.country,
        timezone: data.timeZone,
      };

      // Only include optional fields if they have values
      if (data.businessPhone) {
        requestBody.phone = data.businessPhone;
      }
      if (data.physicalAddress) {
        requestBody.address = data.physicalAddress;
      }
      // Include logo_url if an image was uploaded (optional field)
      if (uploadedImageUrl) {
        requestBody.logo_url = uploadedImageUrl;
      }

      // Submit the onboarding step
      await submitOnboardingStep(requestBody).unwrap();

      toast.success('Business information saved successfully!');
      // Navigate to next step on success
      router.push('/sign-up/step-9');
    } catch (error: any) {
      console.log('Failed to submit onboarding step:', error);

      // Parse API error to get field errors and general error
      const { generalError, fieldErrors } = parseApiError(
        error,
        'Failed to submit form. Please check the errors below.'
      );

      // Set field-specific errors
      const errorFieldNames: string[] = [];
      Object.keys(fieldErrors).forEach((apiFieldName) => {
        const formFieldName = fieldNameMap[apiFieldName] || apiFieldName;
        if (formFieldName in fieldNameMap || formFieldName in data) {
          setError(formFieldName as keyof BusinessInfoFormData, {
            type: 'server',
            message: fieldErrors[apiFieldName],
          });
          errorFieldNames.push(formFieldName);
        }
      });

      // Show general error toast if no field-specific errors
      if (generalError && Object.keys(fieldErrors).length === 0) {
        toast.error(generalError);
      } else if (Object.keys(fieldErrors).length > 0) {
        toast.error('Please fix the errors in the form');

        // Scroll to first error field
        if (errorFieldNames.length > 0) {
          setTimeout(() => {
            const firstErrorFieldName = errorFieldNames[0];
            const fieldElement = document.getElementById(`field-${firstErrorFieldName}`);
            if (fieldElement) {
              fieldElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          }, 100);
        }
      }
    }
  };

  const handleBusinessLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error('Please upload a PNG, JPG, or SVG file');
      return;
    }

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessLogo(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the image
      const response = await uploadImage({
        file,
        collection: 'company_logo',
        owner_type: 'Company',
      }).unwrap();

      // Store the uploaded image URL and filename
      setUploadedImageUrl(response.url);
      setUploadedFilename(response.filename);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      const errorMessage =
        error?.data?.message ||
        error?.error?.data?.message ||
        'Failed to upload image. Please try again.';
      toast.error(errorMessage);
      // Reset preview on error
      setBusinessLogo(null);
    }
  };

  const handleRemoveBusinessLogo = async () => {
    // If there's an uploaded image, delete it from the server
    // Try to get filename from state, or extract it from URL if not available (e.g., after refresh)
    let filenameToDelete: string | null = uploadedFilename;
    
    if (!filenameToDelete && uploadedImageUrl) {
      // Extract filename from URL (everything after the last slash)
      const urlParts = uploadedImageUrl.split('/');
      filenameToDelete = urlParts[urlParts.length - 1];
    }

    if (filenameToDelete) {
      try {
        await deleteUpload({ type: 'image', filename: filenameToDelete }).unwrap();
      } catch (error) {
        console.error('Failed to delete uploaded image:', error);
        // Continue with removal even if delete fails
      }
    }

    // Clear local state
    setBusinessLogo(null);
    setUploadedImageUrl(null);
    setUploadedFilename(null);

    // Submit the onboarding step with empty logo_url to save the deletion
    // This ensures the backend knows the logo was removed
    try {
      const currentFormData = getValues();
      const requestBody: {
        step: number;
        business_name: string;
        logo_url?: string;
        phone?: string;
        city: string;
        state: string;
        country: string;
        timezone: string;
        address?: string;
      } = {
        step: 8,
        business_name: currentFormData.businessName,
        city: currentFormData.city,
        state: currentFormData.stateRegion,
        country: currentFormData.country,
        timezone: currentFormData.timeZone,
        logo_url: '', // Empty URL to indicate deletion
      };

      // Include optional fields if they have values
      if (currentFormData.businessPhone) {
        requestBody.phone = currentFormData.businessPhone;
      }
      if (currentFormData.physicalAddress) {
        requestBody.address = currentFormData.physicalAddress;
      }

      await submitOnboardingStep(requestBody).unwrap();
      toast.success('Logo removed successfully');
    } catch (error: any) {
      console.error('Failed to update onboarding step after logo deletion:', error);
      // Don't show error toast as the deletion was successful, just the update failed
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Tell us about your business
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
          Basic information to get you started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[852px] mx-auto">
        {/* Business Logo Section */}
        <div className="mb-6 sm:mb-8 bg-primary-light px-4 sm:px-5 md:px-[24px] py-4 sm:py-[18px] rounded-[12px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0 relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-neutral-800 border-2 border-primary-150 overflow-hidden flex items-center justify-center relative">
                {businessLogo ? (
                  <img
                    src={businessLogo}
                    alt="Business Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BuildingIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                )}
                {/* Overlay with Edit and Delete Icons */}
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 sm:gap-3 transition-opacity ${
                    businessLogo ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <label className="cursor-pointer p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleBusinessLogoUpload}
                      className="hidden"
                    />
                    <EditIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </label>
                  {businessLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveBusinessLogo}
                      className="cursor-pointer p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg md:text-md font-bold text-text-subheading mb-1">Business Logo</h3>
              <p className="text-xs sm:text-sm text-secondary">
                Upload your business logo to display on your website, booking page, and
                communications.
              </p>
            </div>
          </div>
        </div>

        {/* Business Name */}
        <div id="field-businessName" className="mb-4 sm:mb-6">
          <Input
            label="BUSINESS NAME"
            type="text"
            required
            register={register('businessName', {
              required: 'Business name is required',
            })}
            error={errors.businessName}
            placeholder="Business name"
            labelClassName="font-bold text-xs"
          />
        </div>

        {/* Business Phone (Optional) */}
        <div id="field-businessPhone" className="mb-4 sm:mb-6">
          <Controller
            name="businessPhone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label="BUSINESS PHONE (OPTIONAL)"
                value={field.value}
                onChange={field.onChange}
                error={errors.businessPhone}
                placeholder="Business phone"
                labelClassName="font-bold text-xs"
              />
            )}
          />
        </div>

        {/* City and State/Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div id="field-city">
            <Input
              label="CITY"
              type="text"
              required
              register={register('city', {
                required: 'City is required',
              })}
              error={errors.city}
              placeholder="City"
              labelClassName="font-bold text-xs"
            />
          </div>
          <div id="field-stateRegion">
            <Controller
              name="stateRegion"
              control={control}
              rules={{
                required: 'State/Region is required',
              }}
              render={({ field }) => (
                <Select
                  label="STATE/REGION"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.stateRegion}
                  options={US_STATES}
                  placeholder="State/Region"
                  labelClassName="font-bold text-xs"
                />
              )}
            />
          </div>
        </div>

        {/* Country */}
        <div id="field-country" className="mb-4 sm:mb-6">
          <Controller
            name="country"
            control={control}
            rules={{
              required: 'Country is required',
            }}
            render={({ field }) => (
              <Select
                label="COUNTRY"
                value={field.value}
                onChange={field.onChange}
                error={errors.country}
                options={COUNTRIES}
                placeholder="Country"
                labelClassName="font-bold text-xs"
              />
            )}
          />
        </div>

        {/* Time Zone */}
        <div id="field-timeZone" className="mb-4 sm:mb-6">
          <Controller
            name="timeZone"
            control={control}
            rules={{
              required: 'Time zone is required',
            }}
            render={({ field }) => (
              <Select
                label="TIME ZONE"
                value={field.value}
                onChange={field.onChange}
                error={errors.timeZone}
                options={IANA_TIMEZONE_OPTIONS}
                placeholder="Select your time zone"
                labelClassName="font-bold text-xs"
              />
            )}
          />
        </div>

        {/* Physical Address (Optional) */}
        <div id="field-physicalAddress" className="mb-6 sm:mb-8">
          <Textarea
            label="PHYSICAL ADDRESS (OPTIONAL)"
            register={register('physicalAddress')}
            error={errors.physicalAddress}
            placeholder="Only required if you have a physical location clients visit"
            labelClassName="font-bold text-xs"
            rows={4}
          />
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Leave blank if you operate mobile-only or virtually.
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
