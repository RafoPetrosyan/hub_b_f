'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Select, Checkbox } from '@/components/ui';
import { UploadIcon } from '@/components/ui/icons';
import { US_STATES, COUNTRIES, TIMEZONES, BUSINESS_TYPES } from '@/constants/staticData';
import { API_BASE_URL } from '@/constants/constants';
import {
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
} from '@/store/business-profile';
import { toast } from 'react-toastify';

interface BusinessFormData {
  businessName: string;
  subdomain: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
  legalBusinessName: string;
  businessType: string;
  einTin: string;
  legalAddressSame: boolean;
  legalStreetAddress: string;
  legalCity: string;
  legalState: string;
  legalZipCode: string;
}

// Helper function to map timezone from API format to form format
const mapTimezoneFromAPI = (timezone: string): string => {
  const timezoneMap: Record<string, string> = {
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Denver': 'MT',
    'America/Los_Angeles': 'PT',
    'America/Anchorage': 'AKT',
    'Pacific/Honolulu': 'HST',
  };
  return timezoneMap[timezone] || 'ET';
};

// Helper function to map timezone from form format to API format
const mapTimezoneToAPI = (timezone: string): string => {
  const timezoneMap: Record<string, string> = {
    ET: 'America/New_York',
    CT: 'America/Chicago',
    MT: 'America/Denver',
    PT: 'America/Los_Angeles',
    AKT: 'America/Anchorage',
    HST: 'Pacific/Honolulu',
  };
  return timezoneMap[timezone] || 'America/New_York';
};

// Helper function to map country name to country code
const mapCountryToCode = (country: string): string => {
  const countryMap: Record<string, string> = {
    'United States': 'US',
    Canada: 'CA',
    Mexico: 'MX',
  };
  return countryMap[country] || country;
};

export default function BusinessTab() {
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerBusiness,
    handleSubmit: handleSubmitBusiness,
    control: controlBusiness,
    watch: watchBusiness,
    reset,
    formState: { errors: businessErrors },
  } = useForm<BusinessFormData>({
    mode: 'onBlur',
    defaultValues: {
      businessName: '',
      subdomain: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      timezone: 'ET',
      legalBusinessName: '',
      businessType: 'LLC',
      einTin: '',
      legalAddressSame: false,
      legalStreetAddress: '',
      legalCity: '',
      legalState: '',
      legalZipCode: '',
    },
  });

  const { data: profileData, isLoading, error } = useGetCompanyProfileQuery();
  const [updateCompanyProfile] = useUpdateCompanyProfileMutation();

  // Populate form when data is fetched
  useEffect(() => {
    if (profileData) {
      const { company, address } = profileData;

      reset({
        businessName: company.name || '',
        subdomain: company.subdomain || '',
        streetAddress: address.line1 || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.postal_code || '',
        country: mapCountryToCode(address.country || company.country || 'US'),
        timezone: mapTimezoneFromAPI(company.timezone || 'America/New_York'),
        legalBusinessName: company.legal_name || '',
        businessType: company.entity_type || 'LLC',
        einTin: company.ein || '',
        legalAddressSame: false,
        legalStreetAddress: '',
        legalCity: '',
        legalState: '',
        legalZipCode: '',
      });

      // Set logo if available
      if (company.logo) {
        // If logo is a relative path, prefix with API base URL
        // Otherwise, use as-is (could be full URL or data URL)
        const logoUrl =
          company.logo.startsWith('http') || company.logo.startsWith('data:')
            ? company.logo
            : `${API_BASE_URL}/${company.logo}`;
        setBusinessLogo(logoUrl);
      }
    }
  }, [profileData, reset]);

  const legalAddressSame = watchBusiness('legalAddressSame');

  const onSubmitBusiness = async (data: BusinessFormData) => {
    setIsSubmitting(true);
    try {
      // Only include logo if it's a server URL (not a data URL from local upload)
      // Since image upload API is not integrated yet, we skip logo in the request
      const logoValue =
        businessLogo && !businessLogo.startsWith('data:')
          ? businessLogo.replace(`${API_BASE_URL}/`, '') // Remove base URL prefix if present
          : undefined;

      const requestData = {
        company: {
          business_name: data.businessName,
          country: data.country,
          timezone: mapTimezoneToAPI(data.timezone),
          legal_name: data.legalBusinessName || undefined,
          dba_name: undefined, // Not in form yet
          entity_type: data.businessType || undefined,
          registration_number: undefined, // Not in form yet
          ein: data.einTin || undefined,
          logo: logoValue, // Only include if it's a server URL
        },
        address: {
          line1: data.streetAddress,
          line2: undefined, // Not in form
          city: data.city,
          state: data.state,
          postal_code: data.zipCode,
          country: data.country,
        },
      };

      await updateCompanyProfile(requestData).unwrap();
      toast.success('Business profile updated successfully!');
    } catch (error: any) {
      console.log('Failed to update company profile:', error);
      
      // Extract error messages from the API response
      const errorMessages = error?.data?.data?.message || error?.data?.message || [];
      
      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        // Show each error message as a toast
        errorMessages.forEach((message: string) => {
          toast.error(message);
        });
      } else if (typeof errorMessages === 'string') {
        toast.error(errorMessages);
      } else {
        // Fallback error message
        toast.error('Failed to update business profile. Please check your input and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBusinessLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBusinessLogo = () => {
    setBusinessLogo(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-600">Loading business profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">Failed to load business profile. Please try again.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitBusiness(onSubmitBusiness)} className="space-y-8">
      {/* Business Profile Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Business Profile</h2>
        </div>
        <p className="text-sm text-neutral-600 ml-[52px]">
          Manage your business information and branding.
        </p>
      </div>

      {/* Business Details Section */}
      <div className="space-y-6">
        <Input
          label="Business Name"
          register={registerBusiness('businessName', {
            required: 'Business name is required',
          })}
          error={businessErrors.businessName}
          containerClassName="w-full"
        />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-neutral-700">Subdomain</label>
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-600"
              title="Subdomain information"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
          <Input
            register={registerBusiness('subdomain', {
              required: 'Subdomain is required',
            })}
            error={businessErrors.subdomain}
            containerClassName="w-full"
            disabled
          />
        </div>
      </div>

      {/* Business Logo Section */}
      <div className="border-t border-neutral-200 pt-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Business Logo</h3>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-neutral-200 border-2 border-neutral-300 overflow-hidden flex items-center justify-center">
              {businessLogo ? (
                <img
                  src={businessLogo}
                  alt="Business Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                  <svg
                    className="w-12 h-12 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex gap-4 mb-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleBusinessLogoUpload}
                  className="hidden"
                />
                <span className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                  <UploadIcon />
                  Upload logo
                </span>
              </label>
              {businessLogo && (
                <button
                  onClick={handleRemoveBusinessLogo}
                  className="text-sm text-neutral-600 hover:text-neutral-700 font-medium"
                >
                  Remove logo
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              PNG, JPG, SVG up to 2MB. Recommended 400x400px.
            </p>
          </div>
        </div>
      </div>

      {/* Business Address Section */}
      <div className="border-t border-neutral-200 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Business Address</h3>
        </div>
        <p className="text-sm text-neutral-600 ml-[52px] mb-6">
          Used for business information, billing, and notifications.
        </p>

        <div className="space-y-6">
          <Input
            label="Street Address"
            register={registerBusiness('streetAddress', {
              required: 'Street address is required',
            })}
            error={businessErrors.streetAddress}
            containerClassName="w-full"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="City"
              register={registerBusiness('city', {
                required: 'City is required',
              })}
              error={businessErrors.city}
              containerClassName="w-full"
            />
            <Controller
              name="state"
              control={controlBusiness}
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <Select
                  label="State"
                  options={US_STATES}
                  value={field.value}
                  onChange={field.onChange}
                  error={businessErrors.state}
                  containerClassName="w-full"
                />
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="ZIP Code"
              register={registerBusiness('zipCode', {
                required: 'ZIP code is required',
              })}
              error={businessErrors.zipCode}
              containerClassName="w-full"
            />
            <Controller
              name="country"
              control={controlBusiness}
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <Select
                  label="Country"
                  options={COUNTRIES}
                  value={field.value}
                  onChange={field.onChange}
                  error={businessErrors.country}
                  containerClassName="w-full"
                />
              )}
            />
            <Controller
              name="timezone"
              control={controlBusiness}
              rules={{ required: 'Timezone is required' }}
              render={({ field }) => (
                <Select
                  label="Timezone"
                  options={TIMEZONES}
                  value={field.value}
                  onChange={field.onChange}
                  error={businessErrors.timezone}
                  containerClassName="w-full"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Business Requisites Section */}
      <div className="border-t border-neutral-200 pt-8">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-neutral-900">Business Requisites</h3>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Required for payouts
          </a>
        </div>
        <p className="text-sm text-neutral-600 mb-6">
          This information is required for payment processing and tax purposes.
        </p>

        <div className="space-y-6">
          <Input
            label="Legal Business Name"
            register={registerBusiness('legalBusinessName', {
              required: 'Legal business name is required',
            })}
            error={businessErrors.legalBusinessName}
            containerClassName="w-full"
          />
          <Controller
            name="businessType"
            control={controlBusiness}
            rules={{ required: 'Business type is required' }}
            render={({ field }) => (
              <Select
                label="Business Type"
                options={BUSINESS_TYPES}
                value={field.value}
                onChange={field.onChange}
                error={businessErrors.businessType}
                containerClassName="w-full"
              />
            )}
          />
          <Input
            label="EIN / TIN"
            register={registerBusiness('einTin', {
              required: 'EIN / TIN is required',
            })}
            error={businessErrors.einTin}
            containerClassName="w-full"
          />

          <Controller
            name="legalAddressSame"
            control={controlBusiness}
            render={({ field }) => (
              <Checkbox
                label="Legal address is the same as business address"
                checked={field.value}
                onChange={(e) => {
                  field.onChange((e.target as HTMLInputElement).checked);
                }}
                containerClassName="w-full"
              />
            )}
          />

          {!legalAddressSame && (
            <div className="space-y-6 pl-0">
              <Input
                label="Legal Street Address"
                register={registerBusiness('legalStreetAddress', {
                  required: !legalAddressSame ? 'Legal street address is required' : false,
                })}
                error={businessErrors.legalStreetAddress}
                containerClassName="w-full"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="City"
                  register={registerBusiness('legalCity', {
                    required: !legalAddressSame ? 'Legal city is required' : false,
                  })}
                  error={businessErrors.legalCity}
                  containerClassName="w-full"
                />
                <Controller
                  name="legalState"
                  control={controlBusiness}
                  rules={{
                    required: !legalAddressSame ? 'Legal state is required' : false,
                  }}
                  render={({ field }) => (
                    <Select
                      label="State"
                      options={US_STATES}
                      value={field.value}
                      onChange={field.onChange}
                      error={businessErrors.legalState}
                      placeholder="Select state"
                      containerClassName="w-full"
                    />
                  )}
                />
              </div>
              <Input
                label="ZIP Code"
                register={registerBusiness('legalZipCode', {
                  required: !legalAddressSame ? 'Legal ZIP code is required' : false,
                })}
                error={businessErrors.legalZipCode}
                containerClassName="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-neutral-200">
        <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
