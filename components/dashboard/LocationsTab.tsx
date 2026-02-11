'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Select, Checkbox, PhoneInput, Textarea, Modal, TimePicker } from '@/components/ui';
import { US_STATES, COUNTRIES, IANA_TIMEZONE_OPTIONS } from '@/constants/staticData';
import { toast } from 'react-toastify';
import { useGetTradesQuery } from '@/store/trades';
import type { Trade } from '@/store/trades/types';
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from '@/store/locations';
import type { LocationAPI, LocationResponse } from '@/store/locations/types';

// Import types from store
import type { Break, WorkingHour } from '@/store/locations/types';

// UI Types
interface WorkingHours {
  [key: string]: {
    open: boolean;
    startTime: string;
    endTime: string;
    breaks: Break[];
  };
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string; // Not in API, kept for UI
  manager: string; // Not in API, kept for UI
  rooms: string; // Not in API, kept for UI
  status: 'active' | 'inactive';
  is_primary: boolean;
  timezone: string;
  working_hours: WorkingHour[];
  trades: Trade[];
}

interface LocationsFormData {
  // Primary Location
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
  locationName: string;
  phoneNumber: string; // Not in API, kept for UI
  managerAssigned: string; // Not in API, kept for UI
  rooms: string; // Not in API, kept for UI
  workingHours: WorkingHours;
  trades: number[];
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', apiDay: 'Monday' },
  { key: 'tuesday', label: 'Tuesday', apiDay: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday', apiDay: 'Wednesday' },
  { key: 'thursday', label: 'Thursday', apiDay: 'Thursday' },
  { key: 'friday', label: 'Friday', apiDay: 'Friday' },
  { key: 'saturday', label: 'Saturday', apiDay: 'Saturday' },
  { key: 'sunday', label: 'Sunday', apiDay: 'Sunday' },
];

// Mock managers list - in real app this would come from API (not in API, kept for UI)
const MANAGERS = [
  { value: 'john-smith', label: 'John Smith' },
  { value: 'sarah-johnson', label: 'Sarah Johnson' },
  { value: 'michael-brown', label: 'Michael Brown' },
];

// Use global IANA timezone options
const TIMEZONE_OPTIONS = IANA_TIMEZONE_OPTIONS;

// Helper functions
const convertAPIWorkingHoursToUI = (apiHours: WorkingHour[]): WorkingHours => {
  const uiHours: WorkingHours = {
    monday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    tuesday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    wednesday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    thursday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    friday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    saturday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    sunday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
  };

  apiHours.forEach((hour) => {
    const dayKey = hour.day.toLowerCase() as keyof WorkingHours;
    if (dayKey in uiHours) {
      uiHours[dayKey] = {
        open: true,
        startTime: hour.open,
        endTime: hour.close,
        breaks: hour.breaks || [],
      };
    }
  });

  return uiHours;
};

// Helper to format time to HH:mm (remove seconds if present)
const formatTimeToHHmm = (time: string): string => {
  if (!time) return '09:00';
  // If time includes seconds (HH:mm:ss), remove them
  if (time.length > 5) {
    return time.substring(0, 5);
  }
  return time;
};

const convertUIWorkingHoursToAPI = (uiHours: WorkingHours): WorkingHour[] => {
  const apiHours: WorkingHour[] = [];

  DAYS_OF_WEEK.forEach((day) => {
    const dayKey = day.key as keyof WorkingHours;
    const dayData = uiHours[dayKey];
    if (dayData && dayData.open) {
      apiHours.push({
        day: day.apiDay,
        open: formatTimeToHHmm(dayData.startTime),
        close: formatTimeToHHmm(dayData.endTime),
        breaks: (dayData.breaks || []).map((breakItem) => ({
          start: formatTimeToHHmm(breakItem.start),
          end: formatTimeToHHmm(breakItem.end),
        })),
      });
    }
  });

  return apiHours;
};

const convertAPILocationToUI = (apiLocation: LocationResponse): Location => {
  return {
    id: apiLocation.id || '',
    name: apiLocation.name,
    address: apiLocation.address.street,
    city: apiLocation.address.city,
    state: apiLocation.address.state,
    zipCode: apiLocation.address.zip,
    country: apiLocation.address.country,
    phone: '', // Not in API
    manager: '', // Not in API
    rooms: '', // Not in API
    status: 'active',
    is_primary: apiLocation.is_primary,
    timezone: apiLocation.address.timezone,
    working_hours: apiLocation.working_hours,
    trades: apiLocation.trades.map((t) => ({
      id: t.id.toString(),
      name: t.name,
      user_id: t.user_id,
      is_active: t.is_active,
      created_at: t.created_at,
      updated_at: t.updated_at,
      deletedAt: null,
    })),
  };
};

export default function LocationsTab() {
  const [isEditingPrimary, setIsEditingPrimary] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [primaryLocation, setPrimaryLocation] = useState<Location | null>(null);
  const [additionalLocations, setAdditionalLocations] = useState<Location[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  const { data: tradesData, isLoading: isLoadingTrades } = useGetTradesQuery();
  const {
    data: locationsData,
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useGetLocationsQuery();
  const [createLocation, { isLoading: isCreating }] = useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] = useUpdateLocationMutation();
  const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();

  const trades = tradesData || [];
  const tradeOptions = trades.map((trade) => ({
    value: trade.id,
    label: trade.name,
  }));

  // Process locations data
  useEffect(() => {
    if (locationsData) {
      const allLocations = locationsData.map(convertAPILocationToUI);
      setLocations(allLocations);

      const primary = allLocations.find((loc) => loc.is_primary);
      const additional = allLocations.filter((loc) => !loc.is_primary);

      setPrimaryLocation(primary || null);
      setAdditionalLocations(additional);

      // If there's a primary location, populate the form
      if (primary) {
        const uiWorkingHours = convertAPIWorkingHoursToUI(primary.working_hours);
        reset({
          streetAddress: primary.address,
          city: primary.city,
          state: primary.state,
          zipCode: primary.zipCode,
          country: primary.country,
          timezone: primary.timezone,
          locationName: primary.name,
          phoneNumber: primary.phone,
          managerAssigned: primary.manager,
          rooms: primary.rooms,
          workingHours: uiWorkingHours,
          trades: primary.trades.map((t) => parseInt(t.id, 10)).filter((id) => !isNaN(id)),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationsData]);

  const defaultWorkingHours: WorkingHours = {
    monday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    tuesday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    wednesday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    thursday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    friday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    saturday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    sunday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
  };

  // Primary location form
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LocationsFormData>({
    mode: 'onBlur',
    defaultValues: {
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      timezone: 'America/New_York',
      locationName: '',
      phoneNumber: '',
      managerAssigned: '',
      rooms: '',
      workingHours: defaultWorkingHours,
      trades: [],
    },
  });

  // Modal form (separate instance)
  const {
    register: registerModal,
    handleSubmit: handleSubmitModal,
    control: controlModal,
    watch: watchModal,
    reset: resetModal,
    setValue: setValueModal,
    formState: { errors: errorsModal },
  } = useForm<LocationsFormData>({
    mode: 'onBlur',
    defaultValues: {
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      timezone: 'America/New_York',
      locationName: '',
      phoneNumber: '',
      managerAssigned: '',
      rooms: '',
      workingHours: defaultWorkingHours,
      trades: [],
    },
  });

  const workingHours = watch('workingHours');
  const workingHoursModal = watchModal('workingHours');

  // Process locations data
  useEffect(() => {
    if (locationsData) {
      const allLocations = locationsData.map(convertAPILocationToUI);
      setLocations(allLocations);

      const primary = allLocations.find((loc) => loc.is_primary);
      const additional = allLocations.filter((loc) => !loc.is_primary);

      setPrimaryLocation(primary || null);
      setAdditionalLocations(additional);

      // If there's a primary location, populate the form
      if (primary) {
        const uiWorkingHours = convertAPIWorkingHoursToUI(primary.working_hours);
        reset({
          streetAddress: primary.address,
          city: primary.city,
          state: primary.state,
          zipCode: primary.zipCode,
          country: primary.country,
          timezone: primary.timezone,
          locationName: primary.name,
          phoneNumber: primary.phone,
          managerAssigned: primary.manager,
          rooms: primary.rooms,
          workingHours: uiWorkingHours,
          trades: primary.trades.map((t) => parseInt(t.id, 10)).filter((id) => !isNaN(id)),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationsData]);

  const onSubmit = async (data: LocationsFormData) => {
    if (!primaryLocation) return;

    setIsSubmitting(true);
    try {
      const apiWorkingHours = convertUIWorkingHoursToAPI(data.workingHours);

      const requestData: Omit<LocationAPI, 'id'> = {
        name: data.locationName,
        is_primary: true,
        address: {
          street: data.streetAddress,
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          country: data.country,
          timezone: data.timezone,
        },
        working_hours: apiWorkingHours,
        trades: data.trades
          .map((id) => (typeof id === 'string' ? parseInt(id, 10) : id))
          .filter((id) => !isNaN(id)),
      };

      console.log(primaryLocation, 'primaryLocation');

      await updateLocation({
        id: primaryLocation.id,
        data: requestData,
      }).unwrap();
      toast.success('Primary location updated successfully!');
      setIsEditingPrimary(false);
    } catch (error: any) {
      console.log('Failed to update primary location:', error);
      toast.error(
        error?.data?.message || error?.message || 'Failed to update location. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocation = (location: Location) => {
    setLocationToDelete(location);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      await deleteLocation({ id: locationToDelete.id }).unwrap();
      toast.success('Location deleted successfully');
      setIsDeleteModalOpen(false);
      setLocationToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete location:', error);
      toast.error(
        error?.data?.message || error?.message || 'Failed to delete location. Please try again.'
      );
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    resetModal({
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      timezone: 'America/New_York',
      locationName: '',
      phoneNumber: '',
      managerAssigned: '',
      rooms: '',
      workingHours: defaultWorkingHours,
      trades: [],
    });
    setIsAddLocationModalOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    const uiWorkingHours = convertAPIWorkingHoursToUI(location.working_hours);
    resetModal({
      streetAddress: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      country: location.country,
      timezone: location.timezone,
      locationName: location.name,
      phoneNumber: location.phone,
      managerAssigned: location.manager,
      rooms: location.rooms,
      workingHours: uiWorkingHours,
      trades: location.trades.map((t) => parseInt(t.id, 10)).filter((id) => !isNaN(id)),
    });
    setIsAddLocationModalOpen(true);
  };

  const onSubmitLocationModal = async (data: LocationsFormData) => {
    setIsSubmitting(true);
    try {
      const apiWorkingHours = convertUIWorkingHoursToAPI(data.workingHours);

      const requestData: Omit<LocationAPI, 'id'> = {
        name: data.locationName,
        is_primary: false,
        address: {
          street: data.streetAddress,
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          country: data.country,
          timezone: data.timezone,
        },
        working_hours: apiWorkingHours,
        trades: data.trades
          .map((id) => (typeof id === 'string' ? parseInt(id, 10) : id))
          .filter((id) => !isNaN(id)),
      };

      if (editingLocation) {
        await updateLocation({
          id: editingLocation.id,
          data: requestData,
        }).unwrap();
        toast.success('Location updated successfully!');
      } else {
        await createLocation(requestData).unwrap();
        toast.success('Location created successfully!');
      }

      setIsAddLocationModalOpen(false);
      setEditingLocation(null);
    } catch (error: any) {
      console.log('Failed to save location:', error);
      toast.error(
        error?.data?.message || error?.message || 'Failed to save location. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingLocations) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-600">Loading locations...</div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Primary Location Section */}
        <div className="border border-neutral-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-neutral-900">Primary Location</h2>
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                Main
              </span>
            </div>
            {!isEditingPrimary && primaryLocation && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsEditingPrimary(true)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Button>
            )}
          </div>
          <p className="text-sm text-neutral-600 mb-6">
            This is the primary location of your business. All services and schedules default to
            this location unless changed.
          </p>

          {isEditingPrimary && (
            <>
              {/* Address Section */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
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
                  <h3 className="text-lg font-semibold text-neutral-900">Address</h3>
                </div>
                <Input
                  label="Street Address *"
                  register={register('streetAddress', {
                    required: 'Street address is required',
                  })}
                  error={errors.streetAddress}
                  containerClassName="w-full"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="City *"
                    register={register('city', {
                      required: 'City is required',
                    })}
                    error={errors.city}
                    containerClassName="w-full"
                  />
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: 'State is required' }}
                    render={({ field }) => (
                      <Select
                        label="State *"
                        options={US_STATES}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.state}
                        containerClassName="w-full"
                      />
                    )}
                  />
                </div>
                <Input
                  label="ZIP Code *"
                  register={register('zipCode', {
                    required: 'ZIP code is required',
                  })}
                  error={errors.zipCode}
                  containerClassName="w-full"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Controller
                      name="country"
                      control={control}
                      rules={{ required: 'Country is required' }}
                      render={({ field }) => (
                        <Select
                          label="Country *"
                          options={COUNTRIES}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.country}
                          containerClassName="w-full"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Controller
                      name="timezone"
                      control={control}
                      rules={{ required: 'Timezone is required' }}
                      render={({ field }) => (
                        <Select
                          label="Timezone *"
                          options={TIMEZONE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.timezone}
                          containerClassName="w-full"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Location Details Section */}
              <div className="border-t border-neutral-200 pt-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
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
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Location Details (Optional / Recommended)
                  </h3>
                </div>
                <div className="space-y-6">
                  <Input
                    label="Location Name / Label"
                    register={register('locationName')}
                    error={errors.locationName}
                    containerClassName="w-full"
                  />
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        label="Phone Number"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.phoneNumber}
                        containerClassName="w-full"
                        defaultCountry="us"
                      />
                    )}
                  />
                  <Controller
                    name="managerAssigned"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Manager Assigned"
                        options={MANAGERS}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.managerAssigned}
                        containerClassName="w-full"
                      />
                    )}
                  />
                  <Textarea
                    label="Rooms"
                    register={register('rooms')}
                    error={errors.rooms}
                    containerClassName="w-full"
                    rows={3}
                    helperText="For scheduling purposes, separate by comma."
                  />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Trades * <span className="text-error">*</span>
                    </label>
                    {isLoadingTrades ? (
                      <p className="text-sm text-neutral-500">Loading trades...</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-lg p-4">
                        {tradeOptions.map((trade) => (
                          <Controller
                            key={trade.value}
                            name="trades"
                            control={control}
                            render={({ field }) => {
                              const selectedTrades = field.value || [];
                              const isChecked = selectedTrades.includes(parseInt(trade.value, 10));
                              return (
                                <Checkbox
                                  label={trade.label}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const tradeId = parseInt(trade.value, 10);
                                    if (e.target.checked) {
                                      field.onChange([...selectedTrades, tradeId]);
                                    } else {
                                      field.onChange(
                                        selectedTrades.filter((id: number) => id !== tradeId)
                                      );
                                    }
                                  }}
                                />
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {errors.trades && (
                      <p className="mt-1 text-sm text-error">
                        {typeof errors.trades === 'string' ? errors.trades : errors.trades.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {!isEditingPrimary && primaryLocation && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">Address</p>
                <p className="text-sm text-neutral-600">
                  {primaryLocation.address}, {primaryLocation.city}, {primaryLocation.state}{' '}
                  {primaryLocation.zipCode}, {primaryLocation.country}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">Location Name</p>
                  <p className="text-sm text-neutral-600">{primaryLocation.name}</p>
                </div>
                {primaryLocation.phone && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Phone</p>
                    <p className="text-sm text-neutral-600">{primaryLocation.phone}</p>
                  </div>
                )}
                {primaryLocation.manager && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Manager</p>
                    <p className="text-sm text-neutral-600">{primaryLocation.manager}</p>
                  </div>
                )}
                {primaryLocation.rooms && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Rooms</p>
                    <p className="text-sm text-neutral-600">{primaryLocation.rooms}</p>
                  </div>
                )}
                {primaryLocation.trades.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-neutral-700 mb-1">Trades</p>
                    <p className="text-sm text-neutral-600">
                      {primaryLocation.trades.map((t) => t.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working Hours Section - Editing Mode */}
          {isEditingPrimary && (
            <div className="border-t border-neutral-200 pt-8 mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-neutral-900">Working Hours</h3>
                </div>
                <span className="text-xs text-neutral-500">
                  Working hours are used for appointment scheduling and availability.
                </span>
              </div>
              <div className="space-y-6">
                {DAYS_OF_WEEK.map((day) => {
                  const dayKey = day.key as keyof WorkingHours;
                  const dayData = workingHours?.[dayKey] || {
                    open: false,
                    startTime: '09:00',
                    endTime: '17:00',
                    breaks: [],
                  };
                  const isOpen = dayData.open;
                  const breaks = dayData.breaks || [];

                  return (
                    <div key={day.key} className="border-b border-neutral-200 pb-4 last:border-0">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-32 flex-shrink-0">
                          <Controller
                            name={`workingHours.${dayKey}.open`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                label={day.label}
                                checked={field.value}
                                onChange={(e) => {
                                  field.onChange((e.target as HTMLInputElement).checked);
                                }}
                              />
                            )}
                          />
                        </div>
                        {isOpen && (
                          <>
                            <div className="flex-1">
                              <Controller
                                name={`workingHours.${dayKey}.startTime`}
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label="Open"
                                    value={field.value}
                                    onChange={field.onChange}
                                    containerClassName="w-full"
                                  />
                                )}
                              />
                            </div>
                            <span className="text-neutral-500 mt-6">to</span>
                            <div className="flex-1">
                              <Controller
                                name={`workingHours.${dayKey}.endTime`}
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label="Close"
                                    value={field.value}
                                    onChange={field.onChange}
                                    containerClassName="w-full"
                                  />
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentBreaks = breaks;
                                const newBreaks = [
                                  ...currentBreaks,
                                  { start: '12:00', end: '13:00' },
                                ];
                                const currentWorkingHours = watch('workingHours');
                                setValue('workingHours', {
                                  ...currentWorkingHours,
                                  [dayKey]: {
                                    ...currentWorkingHours[dayKey],
                                    breaks: newBreaks,
                                  },
                                });
                              }}
                              className="mt-6"
                            >
                              + Add Break
                            </Button>
                          </>
                        )}
                        {!isOpen && <span className="text-neutral-500 text-sm">Closed</span>}
                      </div>
                      {isOpen && breaks.length > 0 && (
                        <div className="ml-36 space-y-2">
                          {breaks.map((breakItem, breakIndex) => (
                            <div key={breakIndex} className="flex items-center gap-2">
                              <span className="text-xs text-neutral-600 w-12">Break:</span>
                              <div className="flex-1">
                                <TimePicker
                                  value={breakItem.start}
                                  onChange={(time) => {
                                    const newBreaks = [...breaks];
                                    newBreaks[breakIndex] = {
                                      ...newBreaks[breakIndex],
                                      start: time || '',
                                    };
                                    const currentWorkingHours = watch('workingHours');
                                    setValue('workingHours', {
                                      ...currentWorkingHours,
                                      [dayKey]: {
                                        ...currentWorkingHours[dayKey],
                                        breaks: newBreaks,
                                      },
                                    });
                                  }}
                                  containerClassName="w-full"
                                  className="py-1.5 text-sm"
                                />
                              </div>
                              <span className="text-xs text-neutral-500">to</span>
                              <div className="flex-1">
                                <TimePicker
                                  value={breakItem.end}
                                  onChange={(time) => {
                                    const newBreaks = [...breaks];
                                    newBreaks[breakIndex] = {
                                      ...newBreaks[breakIndex],
                                      end: time || '',
                                    };
                                    const currentWorkingHours = watch('workingHours');
                                    setValue('workingHours', {
                                      ...currentWorkingHours,
                                      [dayKey]: {
                                        ...currentWorkingHours[dayKey],
                                        breaks: newBreaks,
                                      },
                                    });
                                  }}
                                  containerClassName="w-full"
                                  className="py-1.5 text-sm"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newBreaks = breaks.filter((_, i) => i !== breakIndex);
                                  const currentWorkingHours = watch('workingHours');
                                  setValue('workingHours', {
                                    ...currentWorkingHours,
                                    [dayKey]: {
                                      ...currentWorkingHours[dayKey],
                                      breaks: newBreaks,
                                    },
                                  });
                                }}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button - After Working Hours */}
          {isEditingPrimary && (
            <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200 mt-8">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsEditingPrimary(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || isUpdating}
              >
                {isSubmitting || isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* Working Hours Section - View Mode */}
          {!isEditingPrimary && primaryLocation && primaryLocation.working_hours.length > 0 && (
            <div className="border-t border-neutral-200 pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-neutral-900">Working Hours</h3>
              </div>
              <div className="space-y-3">
                {primaryLocation.working_hours.map((hour) => {
                  const dayLabel =
                    DAYS_OF_WEEK.find((d) => d.apiDay === hour.day)?.label || hour.day;
                  return (
                    <div key={hour.day} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-neutral-700">{dayLabel}</div>
                      <div className="flex-1 text-sm text-neutral-600">
                        {hour.open} - {hour.close}
                        {hour.breaks && hour.breaks.length > 0 && (
                          <span className="ml-2 text-xs text-neutral-500">
                            (Breaks: {hour.breaks.map((b) => `${b.start}-${b.end}`).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Additional Locations Section */}
        <div className="border-t border-neutral-200 pt-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
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
              <h2 className="text-xl font-semibold text-neutral-900">Additional Locations</h2>
            </div>
            <Button type="button" variant="primary" size="md" onClick={handleAddLocation}>
              + Add Location
            </Button>
          </div>
          <p className="text-sm text-neutral-600 mb-6">
            Manage multiple business locations and their settings.
          </p>

          {additionalLocations.length === 0 ? (
            <div className="text-center py-12 border border-neutral-200 rounded-lg">
              <p className="text-neutral-500 mb-4">No additional locations yet.</p>
              <Button type="button" variant="outline" size="md" onClick={handleAddLocation}>
                Add Your First Location
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {additionalLocations.map((location) => (
                <div
                  key={location.id}
                  className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {location.name}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        onClick={() => handleEditLocation(location)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteLocation(location)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Address</p>
                      <p className="text-sm text-neutral-600">
                        {location.address}, {location.city}, {location.state} {location.zipCode},{' '}
                        {location.country}
                      </p>
                    </div>
                    {location.manager && (
                      <div>
                        <p className="text-sm font-medium text-neutral-700 mb-1">Manager</p>
                        <p className="text-sm text-neutral-600">{location.manager}</p>
                      </div>
                    )}
                    {location.phone && (
                      <div>
                        <p className="text-sm font-medium text-neutral-700 mb-1">Phone</p>
                        <p className="text-sm text-neutral-600">{location.phone}</p>
                      </div>
                    )}
                    {location.rooms && (
                      <div>
                        <p className="text-sm font-medium text-neutral-700 mb-1">Rooms</p>
                        <p className="text-sm text-neutral-600">{location.rooms}</p>
                      </div>
                    )}
                    {location.trades.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-neutral-700 mb-1">Trades</p>
                        <p className="text-sm text-neutral-600">
                          {location.trades.map((t) => t.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Add/Edit Location Modal */}
      <Modal
        isOpen={isAddLocationModalOpen}
        onClose={() => {
          setIsAddLocationModalOpen(false);
          setEditingLocation(null);
        }}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        size="xl"
      >
        <form
          key={isAddLocationModalOpen ? 'add-location-form' : 'closed'}
          onSubmit={handleSubmitModal(onSubmitLocationModal)}
          className="space-y-6"
        >
          <Input
            label="Location Name *"
            register={registerModal('locationName', {
              required: 'Location name is required',
            })}
            error={errorsModal.locationName}
            containerClassName="w-full"
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Address</h3>
            <Input
              label="Street Address *"
              register={registerModal('streetAddress', {
                required: 'Street address is required',
              })}
              error={errorsModal.streetAddress}
              containerClassName="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City *"
                register={registerModal('city', {
                  required: 'City is required',
                })}
                error={errorsModal.city}
                containerClassName="w-full"
              />
              <Controller
                name="state"
                control={controlModal}
                rules={{ required: 'State is required' }}
                render={({ field }) => {
                  // Ensure options are always available
                  const stateOptions =
                    Array.isArray(US_STATES) && US_STATES.length > 0 ? US_STATES : [];
                  return (
                    <Select
                      id="modal-state-select"
                      label="State *"
                      options={stateOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errorsModal.state}
                      containerClassName="w-full"
                      placeholder="Select a state"
                    />
                  );
                }}
              />
            </div>
            <Input
              label="ZIP Code *"
              register={registerModal('zipCode', {
                required: 'ZIP code is required',
              })}
              error={errorsModal.zipCode}
              containerClassName="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="country"
                control={controlModal}
                rules={{ required: 'Country is required' }}
                render={({ field }) => (
                  <Select
                    label="Country *"
                    options={COUNTRIES}
                    value={field.value}
                    onChange={field.onChange}
                    error={errorsModal.country}
                    containerClassName="w-full"
                  />
                )}
              />
              <Controller
                name="timezone"
                control={controlModal}
                rules={{ required: 'Timezone is required' }}
                render={({ field }) => (
                  <Select
                    label="Timezone *"
                    options={TIMEZONE_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    error={errorsModal.timezone}
                    containerClassName="w-full"
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-200 pt-4">
            <h3 className="text-lg font-semibold text-neutral-900">Location Details (Optional)</h3>
            <Controller
              name="phoneNumber"
              control={controlModal}
              render={({ field }) => (
                <PhoneInput
                  label="Phone Number"
                  value={field.value}
                  onChange={field.onChange}
                  error={errorsModal.phoneNumber}
                  containerClassName="w-full"
                  defaultCountry="us"
                />
              )}
            />
            <Controller
              name="managerAssigned"
              control={controlModal}
              render={({ field }) => (
                <Select
                  label="Manager Assigned"
                  options={MANAGERS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errorsModal.managerAssigned}
                  containerClassName="w-full"
                />
              )}
            />
            <Textarea
              label="Rooms"
              register={registerModal('rooms')}
              error={errorsModal.rooms}
              containerClassName="w-full"
              rows={3}
              helperText="For scheduling purposes, separate by comma."
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Trades * <span className="text-error">*</span>
              </label>
              {isLoadingTrades ? (
                <p className="text-sm text-neutral-500">Loading trades...</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-lg p-4">
                  {tradeOptions.map((trade) => (
                    <Controller
                      key={trade.value}
                      name="trades"
                      control={controlModal}
                      rules={{ required: 'At least one trade is required' }}
                      render={({ field }) => {
                        const selectedTrades = field.value || [];
                        const isChecked = selectedTrades.includes(parseInt(trade.value, 10));
                        return (
                          <Checkbox
                            label={trade.label}
                            checked={isChecked}
                            onChange={(e) => {
                              const tradeId = parseInt(trade.value, 10);
                              if (e.target.checked) {
                                field.onChange([...selectedTrades, tradeId]);
                              } else {
                                field.onChange(
                                  selectedTrades.filter((id: number) => id !== tradeId)
                                );
                              }
                            }}
                          />
                        );
                      }}
                    />
                  ))}
                </div>
              )}
              {errorsModal.trades && (
                <p className="mt-1 text-sm text-error">
                  {typeof errorsModal.trades === 'string'
                    ? errorsModal.trades
                    : errorsModal.trades.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-200 pt-4">
            <h3 className="text-lg font-semibold text-neutral-900">Working Hours</h3>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayKey = day.key as keyof WorkingHours;
                const dayData = workingHoursModal?.[dayKey] || {
                  open: false,
                  startTime: '09:00',
                  endTime: '17:00',
                  breaks: [],
                };
                const isOpen = dayData.open;
                const breaks = dayData.breaks || [];

                return (
                  <div key={day.key} className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0">
                      <Controller
                        name={`workingHours.${dayKey}.open`}
                        control={controlModal}
                        render={({ field }) => (
                          <Checkbox
                            label={day.label}
                            checked={field.value}
                            onChange={(e) => {
                              field.onChange((e.target as HTMLInputElement).checked);
                            }}
                          />
                        )}
                      />
                    </div>
                    {isOpen && (
                      <>
                        <div className="flex-1">
                          <Controller
                            name={`workingHours.${dayKey}.startTime`}
                            control={controlModal}
                            render={({ field }) => (
                              <TimePicker
                                label="Open"
                                value={field.value}
                                onChange={field.onChange}
                                containerClassName="w-full"
                              />
                            )}
                          />
                        </div>
                        <span className="text-neutral-500">to</span>
                        <div className="flex-1">
                          <Controller
                            name={`workingHours.${dayKey}.endTime`}
                            control={controlModal}
                            render={({ field }) => (
                              <TimePicker
                                label="Close"
                                value={field.value}
                                onChange={field.onChange}
                                containerClassName="w-full"
                              />
                            )}
                          />
                        </div>
                      </>
                    )}
                    {!isOpen && <span className="text-neutral-500 text-sm">Closed</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsAddLocationModalOpen(false);
                setEditingLocation(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || isCreating || isUpdating}
            >
              {isSubmitting || isCreating || isUpdating
                ? 'Saving...'
                : editingLocation
                  ? 'Update Location'
                  : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLocationToDelete(null);
        }}
        title="Delete Location"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{locationToDelete?.name}</span>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setLocationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={confirmDeleteLocation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Location'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
