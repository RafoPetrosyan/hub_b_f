'use client';

import { toast, ToastContainer } from 'react-toastify';
import Switch from '@/components/ui/Switch';
import Select, { SelectOption } from '@/components/ui/Select';
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingMutation,
  useUpdateMasterSettingsMutation,
  useUpdateGlobalSettingsMutation,
} from '@/store/notifications';
import type { Notification } from '@/store/notifications/types';

const emailDigestOptions: SelectOption[] = [
  { value: 'off', label: 'Off' },
  { value: 'hourly', label: 'Hourly Digest' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' },
];

export default function NotificationsPage() {
  const { data, isLoading, error, refetch } = useGetNotificationSettingsQuery();
  const [updateNotificationSetting] = useUpdateNotificationSettingMutation();
  const [updateMasterSettings] = useUpdateMasterSettingsMutation();
  const [updateGlobalSettings] = useUpdateGlobalSettingsMutation();

  const handleUpdateMaster = async (enabled: boolean) => {
    try {
      await updateMasterSettings({ enabled }).unwrap();
      toast.success('Master settings updated');
    } catch (error: any) {
      console.error('Failed to update master settings:', error);
      toast.error(error?.data?.message || 'Failed to update master settings');
    }
  };

  const handleUpdateGlobal = async (field: 'digest_frequency' | 'quiet_hours', value: any) => {
    if (!data) return;
    try {
      const payload: any = {
        digest_frequency: data.master.digest_frequency,
      };

      if (field === 'digest_frequency') {
        payload.digest_frequency = value;
      } else if (field === 'quiet_hours') {
        payload.quiet_hours = value;
      }

      await updateGlobalSettings(payload).unwrap();
      toast.success('Global settings updated');
    } catch (error: any) {
      console.error('Failed to update global settings:', error);
      toast.error(error?.data?.message || 'Failed to update global settings');
    }
  };

  const handleUpdateNotification = async (
    alias: string,
    channel: 'email' | 'phone' | 'push',
    enabled: boolean
  ) => {
    if (!data) return;
    try {
      // Find the notification to get current settings
      let currentSettings = { email: false, phone: false, push: false };
      for (const category of data.categories) {
        const notification = category.notifications.find((n) => n.alias === alias);
        if (notification) {
          currentSettings = notification.settings;
          break;
        }
      }

      const newSettings = {
        ...currentSettings,
        [channel]: enabled,
      };

      await updateNotificationSetting({
        alias,
        ...newSettings,
      }).unwrap();

      toast.success('Notification setting updated');
    } catch (error: any) {
      console.error('Failed to update notification setting:', error);
      toast.error(error?.data?.message || 'Failed to update notification setting');
    }
  };

  const isNotificationEnabled = (notification: Notification): boolean => {
    return notification.settings.email || notification.settings.phone || notification.settings.push;
  };

  const handleToggleNotification = async (notification: Notification, enabled: boolean) => {
    if (!data) return;
    try {
      // Update all channels at once in a single API call
      await updateNotificationSetting({
        alias: notification.alias,
        email: enabled,
        phone: enabled,
        push: enabled,
      }).unwrap();

      toast.success('Notification setting updated');
    } catch (error: any) {
      console.error('Failed to update notification setting:', error);
      toast.error(error?.data?.message || 'Failed to update notification setting');
    }
  };

  const NotificationSectionComponent = ({ notification }: { notification: Notification }) => {
    const enabled = isNotificationEnabled(notification);

    return (
      <div
        key={notification.id}
        className="border-b border-neutral-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-neutral-900 mb-1">{notification.name}</h3>
            <p className="text-sm text-neutral-600">{notification.description}</p>
          </div>
          <Switch
            id={`notification-${notification.alias}-main`}
            variant="dark"
            checked={enabled}
            onChange={(e) => {
              e.stopPropagation();
              handleToggleNotification(notification, e.target.checked);
            }}
          />
        </div>
        {enabled && (
          <div className="ml-0 mt-4 pl-0">
            <p className="text-sm font-medium text-neutral-700 mb-3">Notify me via:</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Email</span>
                <Switch
                  id={`notification-${notification.alias}-email`}
                  variant="dark"
                  checked={notification.settings.email}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdateNotification(notification.alias, 'email', e.target.checked);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Push Notification</span>
                <Switch
                  id={`notification-${notification.alias}-push`}
                  variant="dark"
                  checked={notification.settings.push}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdateNotification(notification.alias, 'push', e.target.checked);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">SMS</span>
                <Switch
                  id={`notification-${notification.alias}-phone`}
                  variant="dark"
                  checked={notification.settings.phone}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdateNotification(notification.alias, 'phone', e.target.checked);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Failed to load notification settings</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <ToastContainer />
      {/* Header */}
      <div className="bg-neutral-800 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h1 className="text-2xl font-semibold text-white">Notification Settings</h1>
        </div>
        <p className="text-sm text-neutral-300 ml-9">
          Manage how and when you receive notifications.
        </p>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-4xl">
        {/* Master Control */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Master Control</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Control all notifications with a single switch
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Enable All Notifications</p>
              <p className="text-xs text-neutral-500">
                Turn off to pause all notifications temporarily
              </p>
            </div>
            <Switch
              id="master-notification-switch"
              variant="dark"
              checked={data.master.enabled}
              onChange={(e) => {
                e.stopPropagation();
                handleUpdateMaster(e.target.checked);
              }}
            />
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Global Settings</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Configure notification delivery preferences
          </p>

          <div className="space-y-6">
            <div>
              <Select
                label="Email Digest Frequency"
                options={emailDigestOptions}
                value={data.master.digest_frequency}
                onChange={(value) => handleUpdateGlobal('digest_frequency', value)}
                helperText="Group multiple notifications into a single email"
                containerClassName="max-w-xs"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">Quiet Hours</p>
                <p className="text-xs text-neutral-500">
                  {data.master.quiet_hours && data.master.quiet_hours.length > 0
                    ? 'Quiet hours are configured'
                    : 'Pause notifications during specific hours'}
                </p>
              </div>
              <Switch
                id="quiet-hours-switch"
                variant="dark"
                checked={data.master.quiet_hours !== null && data.master.quiet_hours.length > 0}
                onChange={(e) => {
                  // Toggle quiet hours - if enabling, set a default, if disabling, set to null
                  if (e.target.checked) {
                    handleUpdateGlobal('quiet_hours', [
                      { day: 'monday', start: '22:00', end: '07:00' },
                    ]);
                  } else {
                    handleUpdateGlobal('quiet_hours', null);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        {data.categories.map((category) => (
          <div key={category.id} className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">{category.title}</h2>
            <p className="text-sm text-neutral-600 mb-6">
              {category.title === 'Account & Security'
                ? 'Critical updates about your account security and settings'
                : category.title === 'Appointments'
                  ? 'Updates about appointments, bookings, and activity on your account'
                  : category.title === 'Billing & Payments'
                    ? 'Invoices, payment confirmations, and subscription updates'
                    : category.title === 'Messages'
                      ? 'Conversations and message notifications'
                      : category.title === 'System & Platform'
                        ? 'Platform updates and system notifications'
                        : 'Notification preferences'}
            </p>

            <div className="space-y-6">
              {category.notifications.map((notification) => (
                <NotificationSectionComponent key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
