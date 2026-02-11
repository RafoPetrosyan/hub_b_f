'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Select,
  Checkbox,
  PhoneInput,
  Textarea,
  Modal,
  TimePicker,
} from '@/components/ui';
import { US_STATES, COUNTRIES, IANA_TIMEZONE_OPTIONS } from '@/constants/staticData';
import { toast } from 'react-toastify';
import { useGetTradesQuery } from '@/store/trades';
import {
  useCreateLocationMutation,
  useUpdateLocationMutation,
} from '@/store/locations';
import type { LocationAPI, LocationResponse } from '@/store/locations/types';
import type { Break, WorkingHour } from '@/store/locations/types';

interface WorkingHoursUI {
  [key: string]: {
    open: boolean;
    startTime: string;
    endTime: string;
    breaks: Break[];
  };
}

interface LocationFormData {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
  locationName: string;
  phoneNumber: string;
  managerAssigned: string;
  rooms: string;
  workingHours: WorkingHoursUI;
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

const MANAGERS = [
  { value: 'john-smith', label: 'John Smith' },
  { value: 'sarah-johnson', label: 'Sarah Johnson' },
  { value: 'michael-brown', label: 'Michael Brown' },
];

const formatTimeToHHmm = (time: string): string => {
  if (!time) return '09:00';
  if (time.length > 5) return time.substring(0, 5);
  return time;
};

const convertAPIWorkingHoursToUI = (apiHours: WorkingHour[]): WorkingHoursUI => {
  const uiHours: WorkingHoursUI = {
    monday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    tuesday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    wednesday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    thursday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    friday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    saturday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    sunday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
  };
  apiHours.forEach((hour) => {
    const dayKey = hour.day.toLowerCase();
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

const convertUIWorkingHoursToAPI = (uiHours: WorkingHoursUI): WorkingHour[] => {
  const apiHours: WorkingHour[] = [];
  DAYS_OF_WEEK.forEach((day) => {
    const dayData = uiHours[day.key];
    if (dayData?.open) {
      apiHours.push({
        day: day.apiDay,
        open: formatTimeToHHmm(dayData.startTime),
        close: formatTimeToHHmm(dayData.endTime),
        breaks: (dayData.breaks || []).map((b) => ({
          start: formatTimeToHHmm(b.start),
          end: formatTimeToHHmm(b.end),
        })),
      });
    }
  });
  return apiHours;
};

const defaultWorkingHours: WorkingHoursUI = {
  monday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
  tuesday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
  wednesday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
  thursday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
  friday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
  saturday: { open: true, startTime: '09:00', endTime: '17:00', breaks: [] },
  sunday: { open: false, startTime: '09:00', endTime: '17:00', breaks: [] },
};

const getDefaultFormValues = (): LocationFormData => ({
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

function locationToFormData(loc: LocationResponse): LocationFormData {
  return {
    streetAddress: loc.address.street,
    city: loc.address.city,
    state: loc.address.state,
    zipCode: loc.address.zip,
    country: loc.address.country,
    timezone: loc.address.timezone,
    locationName: loc.name,
    phoneNumber: '',
    managerAssigned: '',
    rooms: '',
    workingHours: convertAPIWorkingHoursToUI(loc.working_hours || []),
    trades: (loc.trades || []).map((t) => t.id),
  };
}

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLocation: LocationResponse | null;
  onSuccess: () => void;
}

export default function LocationFormModal({
  isOpen,
  onClose,
  editingLocation,
  onSuccess,
}: LocationFormModalProps) {
  const { data: tradesData, isLoading: isLoadingTrades } = useGetTradesQuery();
  const [createLocation, { isLoading: isCreating }] = useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] = useUpdateLocationMutation();

  const tradeOptions = (tradesData || []).map((t) => ({ value: t.id, label: t.name }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
    mode: 'onBlur',
    defaultValues: getDefaultFormValues(),
  });

  const workingHoursModal = watch('workingHours');

  useEffect(() => {
    if (isOpen) {
      if (editingLocation) {
        reset(locationToFormData(editingLocation));
      } else {
        reset(getDefaultFormValues());
      }
    }
  }, [isOpen, editingLocation, reset]);

  const onSubmit = async (data: LocationFormData) => {
    try {
      const apiWorkingHours = convertUIWorkingHoursToAPI(data.workingHours);
      const requestData: Omit<LocationAPI, 'id'> = {
        name: data.locationName,
        is_primary: !!editingLocation?.is_primary,
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
        await updateLocation({ id: editingLocation.id, data: requestData }).unwrap();
        toast.success('Location updated successfully!');
      } else {
        await createLocation(requestData).unwrap();
        toast.success('Location created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(
        err?.data?.message || err?.message || 'Failed to save location. Please try again.'
      );
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingLocation ? 'Edit Location' : 'Add New Location'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Location Name *"
          register={register('locationName', { required: 'Location name is required' })}
          error={errors.locationName}
          containerClassName="w-full"
          borderClassName="!border-border-default border-2"
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-d-content-item-title">Address</h3>
          <Input
            label="Street Address *"
            register={register('streetAddress', { required: 'Street address is required' })}
            error={errors.streetAddress}
            containerClassName="w-full"
            borderClassName="!border-border-default border-2"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City *"
              register={register('city', { required: 'City is required' })}
              error={errors.city}
              containerClassName="w-full"
              borderClassName="!border-border-default border-2"
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
                  placeholder="Select a state"
                />
              )}
            />
          </div>
          <Input
            label="ZIP Code *"
            register={register('zipCode', { required: 'ZIP code is required' })}
            error={errors.zipCode}
            containerClassName="w-full"
            borderClassName="!border-border-default border-2"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Controller
              name="timezone"
              control={control}
              rules={{ required: 'Timezone is required' }}
              render={({ field }) => (
                <Select
                  label="Timezone *"
                  options={IANA_TIMEZONE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.timezone}
                  containerClassName="w-full"
                  placeholder="Select timezone"
                />
              )}
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-[var(--border-default)] pt-4">
          <h3 className="text-lg font-semibold text-d-content-item-title">
            Location Details (Optional)
          </h3>
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
              Trades *
            </label>
            {isLoadingTrades ? (
              <p className="text-sm text-d-content-item-sub-title">Loading trades...</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-[var(--border-default)] rounded-lg p-4 bg-d-content-item-bg">
                {tradeOptions.map((trade) => (
                  <Controller
                    key={trade.value}
                    name="trades"
                    control={control}
                    render={({ field }) => {
                      const selectedTrades = field.value || [];
                      const isChecked = selectedTrades.includes(
                        typeof trade.value === 'number' ? trade.value : parseInt(String(trade.value), 10)
                      );
                      const tradeId = typeof trade.value === 'number' ? trade.value : parseInt(String(trade.value), 10);
                      return (
                        <Checkbox
                          label={trade.label}
                          checked={isChecked}
                          onChange={(e) => {
                            if ((e.target as HTMLInputElement).checked) {
                              field.onChange([...selectedTrades, tradeId]);
                            } else {
                              field.onChange(selectedTrades.filter((id: number) => id !== tradeId));
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

        <div className="space-y-4 border-t border-[var(--border-default)] pt-4">
          <h3 className="text-lg font-semibold text-d-content-item-title">Working Hours</h3>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayKey = day.key;
              const dayData = workingHoursModal?.[dayKey] || {
                open: false,
                startTime: '09:00',
                endTime: '17:00',
                breaks: [],
              };
              const isOpen = dayData.open;

              return (
                <div key={day.key} className="flex items-center gap-4 flex-wrap">
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
                      <div className="flex-1 min-w-[100px]">
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
                      <span className="text-d-content-item-sub-title">to</span>
                      <div className="flex-1 min-w-[100px]">
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
                    </>
                  )}
                  {!isOpen && (
                    <span className="text-sm text-d-content-item-sub-title">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-default)]">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="!bg-d-accent rounded-full"
          >
            {isSubmitting
              ? 'Saving...'
              : editingLocation
                ? 'Update Location'
                : 'Create Location'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
