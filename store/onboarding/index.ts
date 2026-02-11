import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  GetSubscriptionPlansRequest,
  GetSubscriptionPlansResponse,
  GetOnboardingRequest,
  GetOnboardingResponse,
  OnboardingStepRequest,
  OnboardingStepResponse,
  GetOnboardingTiersRequest,
  GetOnboardingTiersResponse,
  GetAvailablePlansRequest,
  GetAvailablePlansResponse,
  GetAvailableAddonsRequest,
  GetAvailableAddonsResponse,
  GetPlanSummaryRequest,
  GetPlanSummaryResponse,
  GetPaymentIntentsRequest,
  GetPaymentIntentsResponse,
  GetAvailableTradesRequest,
  GetAvailableTradesResponse,
  GetAvailableServicesRequest,
  GetAvailableServicesResponse,
  GetOnboardingLinksRequest,
  GetOnboardingLinksResponse,
} from './types';

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Onboarding'],
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<GetSubscriptionPlansResponse, GetSubscriptionPlansRequest>({
      query: () => ({
        url: `/subscription-plans/duration`,
        method: 'GET',
      }),
    }),
    getOnboarding: builder.query<GetOnboardingResponse, GetOnboardingRequest>({
      query: () => ({
        url: `/company/onboarding`,
        method: 'GET',
      }),
      providesTags: ['Onboarding'],
    }),
    getOnboardingTiers: builder.query<GetOnboardingTiersResponse, GetOnboardingTiersRequest>({
      query: () => ({
        url: `/company/onboarding/tiers`,
        method: 'GET',
      }),
    }),
    getAvailablePlans: builder.query<GetAvailablePlansResponse, GetAvailablePlansRequest>({
      query: () => ({
        url: `/company/onboarding/available-plans`,
        method: 'GET',
      }),
    }),
    getAvailableAddons: builder.query<GetAvailableAddonsResponse, GetAvailableAddonsRequest>({
      query: () => ({
        url: `/company/onboarding/available-addons`,
        method: 'GET',
      }),
    }),
    getPlanSummary: builder.query<GetPlanSummaryResponse, GetPlanSummaryRequest>({
      query: () => ({
        url: `/company/onboarding/plan-summary`,
        method: 'GET',
      }),
    }),
    getPaymentIntents: builder.query<GetPaymentIntentsResponse, GetPaymentIntentsRequest>({
      query: (params) => ({
        url: `/company/onboarding/payment-intents`,
        method: 'GET',
        params: {
          period: params.period,
        },
      }),
    }),
    getAvailableTrades: builder.query<GetAvailableTradesResponse, GetAvailableTradesRequest>({
      query: () => ({
        url: `/company/onboarding/available-trades`,
        method: 'GET',
      }),
    }),
    getAvailableServices: builder.query<GetAvailableServicesResponse, GetAvailableServicesRequest>({
      query: () => ({
        url: `/company/onboarding/available-services`,
        method: 'GET',
      }),
    }),
    getOnboardingLinks: builder.query<GetOnboardingLinksResponse, GetOnboardingLinksRequest>({
      query: () => ({
        url: `/company/onboarding/links`,
        method: 'GET',
      }),
    }),
    submitOnboardingStep: builder.mutation<OnboardingStepResponse, OnboardingStepRequest>({
      query: (request) => {
        const { step, ...data } = request;

        const cleanedData = Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value !== undefined)
        );

        return {
          url: `/company/onboarding/step/${step}`,
          method: 'POST',
          data: cleanedData,
        };
      },
      invalidatesTags: (result, error, { step }) => (step === 12 ? [] : ['Onboarding']),
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetOnboardingQuery,
  useGetOnboardingTiersQuery,
  useGetAvailablePlansQuery,
  useGetAvailableAddonsQuery,
  useGetPlanSummaryQuery,
  useGetPaymentIntentsQuery,
  useGetAvailableTradesQuery,
  useGetAvailableServicesQuery,
  useGetOnboardingLinksQuery,
  useSubmitOnboardingStepMutation,
} = onboardingApi;
