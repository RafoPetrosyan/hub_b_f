import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  GetTemplatesRequest,
  GetTemplatesResponse,
  UpdateTemplateRequest,
  UpdateTemplateResponse,
  ResetTemplateRequest,
  ResetTemplateResponse,
  GetTemplateVariablesRequest,
  GetTemplateVariablesResponse,
  GetTemplateRequest,
  GetTemplateResponse,
} from './types';

export const templatesApi = createApi({
  reducerPath: 'templatesApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Templates'],
  endpoints: (builder) => ({
    getTemplates: builder.query<GetTemplatesResponse, GetTemplatesRequest>({
      query: () => ({
        url: `/company/notification-templates`,
        method: 'GET',
      }),
      providesTags: ['Templates'],
    }),
    getTemplate: builder.query<GetTemplateResponse, GetTemplateRequest>({
      query: (params) => ({
        url: `/company/notification-templates/${params.id}`,
        method: 'GET',
      }),
      providesTags: ['Templates'],
    }),
    updateTemplate: builder.mutation<UpdateTemplateResponse, UpdateTemplateRequest>({
      query: (data) => ({
        url: `/company/notification-templates/${data.id}`,
        method: 'PUT',
        data: {
          title: data.title,
          body: data.body,
        },
      }),
      invalidatesTags: ['Templates'],
    }),
    resetTemplate: builder.mutation<ResetTemplateResponse, ResetTemplateRequest>({
      query: (data) => ({
        url: `/company/notification-templates/${data.id}/reset`,
        method: 'PUT',
      }),
      invalidatesTags: ['Templates'],
    }),
    getTemplateVariables: builder.query<GetTemplateVariablesResponse, GetTemplateVariablesRequest>({
      query: (params) => ({
        url: `/company/notification-templates/variables/${params.type}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useUpdateTemplateMutation,
  useResetTemplateMutation,
  useGetTemplateVariablesQuery,
} = templatesApi;

