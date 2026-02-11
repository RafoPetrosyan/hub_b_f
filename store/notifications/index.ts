import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  GetNotificationSettingsRequest,
  GetNotificationSettingsResponse,
  UpdateNotificationSettingRequest,
  UpdateNotificationSettingResponse,
  UpdateMasterSettingsRequest,
  UpdateMasterSettingsResponse,
  UpdateGlobalSettingsRequest,
  UpdateGlobalSettingsResponse,
} from './types';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['NotificationSettings'],
  endpoints: (builder) => ({
    getNotificationSettings: builder.query<GetNotificationSettingsResponse, GetNotificationSettingsRequest>({
      query: () => ({
        url: `/notification-settings`,
        method: 'GET',
      }),
      providesTags: ['NotificationSettings'],
    }),
    updateNotificationSetting: builder.mutation<
      UpdateNotificationSettingResponse,
      UpdateNotificationSettingRequest
    >({
      query: (data) => ({
        url: `/notification-settings/notification/${data.alias}`,
        method: 'PUT',
        data: {
          email: data.email,
          phone: data.phone,
          push: data.push,
        },
      }),
      invalidatesTags: ['NotificationSettings'],
    }),
    updateMasterSettings: builder.mutation<UpdateMasterSettingsResponse, UpdateMasterSettingsRequest>({
      query: (data) => ({
        url: `/notification-settings/master`,
        method: 'PUT',
        data: {
          enabled: data.enabled,
        },
      }),
      async onQueryStarted({ enabled }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotificationSettings', undefined, (draft) => {
            draft.master.enabled = enabled;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          // If the mutation fails, rollback the optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: ['NotificationSettings'],
    }),
    updateGlobalSettings: builder.mutation<UpdateGlobalSettingsResponse, UpdateGlobalSettingsRequest>({
      query: (data) => ({
        url: `/notification-settings/global`,
        method: 'PUT',
        data: {
          digest_frequency: data.digest_frequency,
          quiet_hours: data.quiet_hours,
        },
      }),
      async onQueryStarted({ digest_frequency, quiet_hours }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotificationSettings', undefined, (draft) => {
            if (digest_frequency !== undefined) {
              draft.master.digest_frequency = digest_frequency;
            }
            if (quiet_hours !== undefined) {
              draft.master.quiet_hours = quiet_hours;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          // If the mutation fails, rollback the optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: ['NotificationSettings'],
    }),
  }),
});

export const {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingMutation,
  useUpdateMasterSettingsMutation,
  useUpdateGlobalSettingsMutation,
} = notificationsApi;

