import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  GetStaffRequest,
  GetStaffResponse,
  GetStaffByIdRequest,
  GetStaffByIdResponse,
  CreateStaffRequest,
  CreateStaffResponse,
  UpdateStaffRequest,
  UpdateStaffResponse,
  DeleteStaffRequest,
  DeleteStaffResponse,
  DeleteStaffMultipleRequest,
  DeleteStaffMultipleResponse,
  StaffCountResponse,
} from './types';

export const staffApi = createApi({
  reducerPath: 'staffApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Staff', 'StaffCount'],
  endpoints: (builder) => ({
    getStaff: builder.query<GetStaffResponse, GetStaffRequest>({
      query: (params = {}) => ({
        url: `/staff`,
        method: 'GET',
        params,
      }),
      providesTags: ['Staff'],
    }),
    getStaffById: builder.query<GetStaffByIdResponse, GetStaffByIdRequest>({
      query: (params) => ({
        url: `/staff/${params.id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Staff', id: arg.id }],
    }),
    getStaffCount: builder.query<StaffCountResponse, void>({
      query: () => ({
        url: `/staff/count`,
        method: 'GET',
      }),
      providesTags: ['StaffCount'],
    }),
    createStaff: builder.mutation<CreateStaffResponse, CreateStaffRequest>({
      query: (data) => ({
        url: `/staff`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Staff', 'StaffCount'],
    }),
    updateStaff: builder.mutation<UpdateStaffResponse, UpdateStaffRequest>({
      query: ({ id, data }) => ({
        url: `/staff/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        'Staff',
        'StaffCount',
        { type: 'Staff', id: arg.id },
      ],
    }),
    deleteStaff: builder.mutation<DeleteStaffResponse, DeleteStaffRequest>({
      query: (params) => ({
        url: `/staff/${params.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        'Staff',
        'StaffCount',
        { type: 'Staff', id: arg.id },
      ],
    }),
    deleteStaffMultiple: builder.mutation<DeleteStaffMultipleResponse, DeleteStaffMultipleRequest>({
      query: (params) => ({
        url: `/staff`,
        method: 'DELETE',
        params: { ids: params.ids },
      }),
      invalidatesTags: ['Staff', 'StaffCount'],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useGetStaffCountQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useDeleteStaffMultipleMutation,
} = staffApi;




