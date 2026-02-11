import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  GetLocationsResponse,
  GetLocationRequest,
  GetLocationResponse,
  CreateLocationRequest,
  CreateLocationResponse,
  UpdateLocationRequest,
  UpdateLocationResponse,
  DeleteLocationRequest,
  DeleteLocationResponse,
} from './types';

export const locationsApi = createApi({
  reducerPath: 'locationsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Locations'],
  endpoints: (builder) => ({
    getLocations: builder.query<GetLocationsResponse, void>({
      query: () => ({
        url: `/location`,
        method: 'GET',
      }),
      providesTags: ['Locations'],
    }),
    getLocation: builder.query<GetLocationResponse, GetLocationRequest>({
      query: (params) => ({
        url: `/location/${params.id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Locations', id: arg.id }],
    }),
    createLocation: builder.mutation<CreateLocationResponse, CreateLocationRequest>({
      query: (data) => ({
        url: `/location`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Locations'],
    }),
    updateLocation: builder.mutation<UpdateLocationResponse, UpdateLocationRequest>({
      query: ({ id, data }) => ({
        url: `/location/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        'Locations',
        { type: 'Locations', id: arg.id },
      ],
    }),
    deleteLocation: builder.mutation<DeleteLocationResponse, DeleteLocationRequest>({
      query: (params) => ({
        url: `/location/${params.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        'Locations',
        { type: 'Locations', id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationsApi;

