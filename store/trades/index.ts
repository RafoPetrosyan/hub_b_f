import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { GetTradesRequest, GetTradesResponse } from './types';

export const tradesApi = createApi({
  reducerPath: 'tradesApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getTrades: builder.query<GetTradesResponse, GetTradesRequest>({
      query: () => ({
        url: `/trades`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetTradesQuery } = tradesApi;
