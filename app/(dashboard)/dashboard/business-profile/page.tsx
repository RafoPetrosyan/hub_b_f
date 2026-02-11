'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { EditIcon, TrashIcon } from '@/components/ui/icons';
import { COUNTRIES, IANA_TIMEZONE_OPTIONS, CURRENCY_OPTIONS } from '@/constants/staticData';
import {
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
} from '@/store/business-profile';
import { useUploadImageMutation, useDeleteUploadMutation } from '@/store/upload';
import { toast } from 'react-toastify';

// Image icon for logo placeholder (picture icon)
const ImageIcon = ({ className = 'w-10 h-10' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

interface BusinessProfileFormData {
  businessName: string;
  businessPhone: string;
  timezone: string;
  country: string;
  businessEmail: string;
  currency: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

export default function BusinessProfilePage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);
  const { data: profile, isLoading: isProfileLoading } = useGetCompanyProfileQuery();
  const [updateCompanyProfile, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess }] =
    useUpdateCompanyProfileMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [deleteUpload, { isLoading: isDeletingImage }] = useDeleteUploadMutation();

  const company = profile?.company;
  const address = profile?.address;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BusinessProfileFormData>({
    mode: 'onBlur',
    defaultValues: {
      businessName: '',
      businessPhone: '',
      timezone: '',
      country: '',
      businessEmail: '',
      currency: 'USD',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  useEffect(() => {
    if (company) {
      setValue('businessName', company.business_name ?? '');
      setValue('timezone', company.timezone ?? '');
      setValue('country', company.country ?? '');
      setValue('businessPhone', company.phone ?? '');
      setValue('businessEmail', company.email ?? '');
      setValue('currency', company.currency ?? 'USD');
    }
    if (address) {
      setValue('addressLine1', address.line1 ?? '');
      setValue('addressLine2', address.line2 ?? '');
      setValue('city', address.city ?? '');
      setValue('state', address.state ?? '');
      setValue('postalCode', address.postal_code ?? '');
    }
    if (company?.logo) setLogo(company.logo);
  }, [company, address, setValue]);

  useEffect(() => {
    if (isUpdateSuccess) {
      toast.success('Business profile updated successfully!');
    }
  }, [isUpdateSuccess]);

  const onSubmit = (data: BusinessProfileFormData) => {
    updateCompanyProfile({
      company: {
        business_name: data.businessName,
        country: data.country,
        timezone: data.timezone,
        phone: data.businessPhone || undefined,
        email: data.businessEmail || undefined,
        currency: data.currency,
        logo: logo ?? undefined,
      },
      address: {
        line1: data.addressLine1,
        line2: data.addressLine2 || undefined,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: data.country,
      },
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage({ file }).unwrap();
      setLogo(res.url);
      setLogoFilename(res.filename);
      toast.success('Logo uploaded successfully!');
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

  const handleRemoveLogo = async () => {
    if (!logo) return;
    const filename = logoFilename ?? getFilenameFromUrl(logo);
    try {
      if (filename) {
        await deleteUpload({ type: 'image', filename }).unwrap();
      }
      setLogo(null);
      setLogoFilename(null);
      toast.success('Logo removed.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove image.');
    }
  };

  if (isProfileLoading && !profile) {
    return (
      <div className="max-w-[1600px]">
        <div className="mb-[12px]">
          <h1 className="text-xl font-bold text-d-title mb-2">Business Profile</h1>
          <p className="text-sm text-d-sub-title font-medium">Manage your business configuration</p>
        </div>
        <p className="text-d-content-item-sub-title">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-[1600px]">
        <div className="mb-[12px]">
          <h1 className="text-xl font-bold text-d-title mb-2">Business Profile</h1>
          <p className="text-sm text-d-sub-title font-medium">Manage your business configuration</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Business Logo Section */}
          <div className="bg-d-content-item-bg px-4 sm:px-5 md:px-6 py-4 sm:py-5 rounded-[12px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 relative group">
                <div className="w-[105px] h-[101px] sm:w-28 sm:h-28 rounded-[12px] bg-neutral-800 overflow-hidden flex items-center justify-center relative">
                  {logo ? (
                    <img src={logo} alt="Business logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  )}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 p-2 transition-opacity ${
                      logo ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <EditIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </label>
                    {logo && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
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
                  Business Logo
                </h3>
                <p className="text-xs sm:text-sm text-d-content-item-sub-title font-medium">
                  Upload your business logo for branding
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-d-content-item-bg rounded-[12px] p-6">
            <h2 className="text-xl font-bold text-d-content-item-title">Basic Information</h2>
            <p className="text-sm text-d-content-item-sub-title font-medium mb-6">
              Your business details and contact information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  BUSINESS NAME
                </label>
                <Input
                  placeholder="Business name"
                  register={register('businessName', { required: 'Business name is required' })}
                  error={errors.businessName}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  BUSINESS PHONE NUMBER
                </label>
                <Input
                  type="tel"
                  placeholder="Enter Business phone number"
                  register={register('businessPhone')}
                  error={errors.businessPhone}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  TIMEZONE
                </label>
                <Select
                  options={IANA_TIMEZONE_OPTIONS}
                  register={register('timezone')}
                  value={watch('timezone')}
                  placeholder="Select your time zone"
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  COUNTRY
                </label>
                <Select
                  options={COUNTRIES}
                  register={register('country')}
                  value={watch('country')}
                  placeholder="Country"
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  BUSINESS EMAIL
                </label>
                <Input
                  type="email"
                  placeholder="Enter Business email address"
                  register={register('businessEmail')}
                  error={errors.businessEmail}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  CURRENCY
                </label>
                <Select
                  options={CURRENCY_OPTIONS}
                  register={register('currency')}
                  value={watch('currency')}
                  placeholder="Select currency"
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-d-content-item-bg rounded-[12px] p-6">
            <h2 className="text-xl font-bold text-d-content-item-title">Address</h2>
            <p className="text-sm text-d-content-item-sub-title font-medium mb-6">
              Your business address
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  STREET ADDRESS LINE 1
                </label>
                <Input
                  placeholder="Street address"
                  register={register('addressLine1')}
                  error={errors.addressLine1}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  STREET ADDRESS LINE 2 (OPTIONAL)
                </label>
                <Input
                  placeholder="Apt, suite, etc."
                  register={register('addressLine2')}
                  error={errors.addressLine2}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  CITY
                </label>
                <Input
                  placeholder="City"
                  register={register('city')}
                  error={errors.city}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  STATE / PROVINCE
                </label>
                <Input
                  placeholder="State or province"
                  register={register('state')}
                  error={errors.state}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                  POSTAL CODE
                </label>
                <Input
                  placeholder="Postal code"
                  register={register('postalCode')}
                  error={errors.postalCode}
                  containerClassName="w-full"
                  borderClassName="!border-border-default border-2"
                />
              </div>
            </div>
            <div className="mt-[21px]">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isUpdateLoading}
                className="!bg-d-accent rounded-full w-[250px]"
              >
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
