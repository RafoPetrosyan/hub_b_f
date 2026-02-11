import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
  PutAccountInfoReq,
  PutAccountInfoRes,
  PostTwoFactorReq,
  PostTwoFactorRes,
  CompanyProfileResponse,
  CompanyProfileRequest,
  OnboardingResponse,
} from '@/store/business-profile/types';

export const businessProfileApi = createApi({
  reducerPath: 'businessProfileApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    putAccount: builder.mutation<PutAccountInfoRes, PutAccountInfoReq>({
      query: (data) => ({
        url: `/account/profile`,
        method: 'PUT',
        data,
      }),
    }),
    postTwoFactor: builder.mutation<PostTwoFactorRes, PostTwoFactorReq>({
      query: (data) => ({
        url: `/account/2fa`,
        method: 'POST',
        data,
      }),
    }),
    getCompanyProfile: builder.query<CompanyProfileResponse, void>({
      query: () => ({
        url: `/company/profile`,
        method: 'GET',
      }),
    }),
    updateCompanyProfile: builder.mutation<CompanyProfileResponse, CompanyProfileRequest>({
      query: (data) => ({
        url: `/company/profile`,
        method: 'PUT',
        data,
      }),
    }),
    getOnboarding: builder.query<OnboardingResponse, void>({
      query: () => ({
        url: `/company/onboarding`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  usePutAccountMutation,
  usePostTwoFactorMutation,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useGetOnboardingQuery,
} = businessProfileApi;
