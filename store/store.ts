import { authApi } from '@/store/auth';
import { tradesApi } from '@/store/trades';
import { configureStore } from '@reduxjs/toolkit';

import auth from './auth/reducer';
import { businessProfileApi } from '@/store/business-profile';
import { templatesApi } from '@/store/templates';
import { notificationsApi } from '@/store/notifications';
import { locationsApi } from '@/store/locations';
import { staffApi } from '@/store/staff';
import { onboardingApi } from '@/store/onboarding';
import { uploadApi } from '@/store/upload';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth,
      [authApi.reducerPath]: authApi.reducer,
      [tradesApi.reducerPath]: tradesApi.reducer,
      [businessProfileApi.reducerPath]: businessProfileApi.reducer,
      [templatesApi.reducerPath]: templatesApi.reducer,
      [notificationsApi.reducerPath]: notificationsApi.reducer,
      [locationsApi.reducerPath]: locationsApi.reducer,
      [staffApi.reducerPath]: staffApi.reducer,
      [onboardingApi.reducerPath]: onboardingApi.reducer,
      [uploadApi.reducerPath]: uploadApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        tradesApi.middleware,
        businessProfileApi.middleware,
        templatesApi.middleware,
        notificationsApi.middleware,
        locationsApi.middleware,
        staffApi.middleware,
        onboardingApi.middleware,
        uploadApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
