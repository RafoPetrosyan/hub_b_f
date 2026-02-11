import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyRegistrationCodeRequest,
  VerifyRegistrationCodeResponse,
  SendRegistrationVerificationCodeRequest,
  SendRegistrationVerificationCodeResponse,
  SendLoginVerificationCodeRequest,
  SendLoginVerificationCodeResponse,
  VerifyLoginCodeRequest,
  VerifyLoginCodeResponse,
  CheckSlugRequest,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  VerifyForgetPasswordCodeRequest,
  VerifyForgetPasswordCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: `/login`,
        method: 'POST',
        data,
      }),
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: `/register`,
        method: 'POST',
        data,
      }),
    }),

    sendRegistrationVerificationCode: builder.mutation<
      SendRegistrationVerificationCodeResponse,
      SendRegistrationVerificationCodeRequest
    >({
      query: (data) => ({
        url: `/register/send-verification-code`,
        method: 'POST',
        data,
      }),
    }),

    verifyRegistrationCode: builder.mutation<
      VerifyRegistrationCodeResponse,
      VerifyRegistrationCodeRequest
    >({
      query: (data) => ({
        url: `/register/verify-code`,
        method: 'POST',
        data,
      }),
    }),

    sendLoginVerificationCode: builder.mutation<
      SendLoginVerificationCodeResponse,
      SendLoginVerificationCodeRequest
    >({
      query: (data) => ({
        url: `/login/send-verification-code`,
        method: 'POST',
        data,
      }),
    }),

    verifyLoginCode: builder.mutation<VerifyLoginCodeResponse, VerifyLoginCodeRequest>({
      query: (data) => ({
        url: `/login/verify-code`,
        method: 'POST',
        data,
      }),
    }),

    checkSlug: builder.query<any, CheckSlugRequest>({
      query: (params) => ({
        url: `/register/slug`,
        method: 'GET',
        params,
      }),
    }),

    forgetPassword: builder.mutation<ForgetPasswordResponse, ForgetPasswordRequest>({
      query: (data) => ({
        url: `/login/forget-password`,
        method: 'POST',
        data,
      }),
    }),

    verifyForgetPasswordCode: builder.mutation<
      VerifyForgetPasswordCodeResponse,
      VerifyForgetPasswordCodeRequest
    >({
      query: (data) => ({
        url: `/login/forget-password/verify`,
        method: 'POST',
        data,
      }),
    }),

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: `/login/reset-password`,
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendRegistrationVerificationCodeMutation,
  useVerifyRegistrationCodeMutation,
  useSendLoginVerificationCodeMutation,
  useForgetPasswordMutation,
  useVerifyForgetPasswordCodeMutation,
  useResetPasswordMutation,
} = authApi;
