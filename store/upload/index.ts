import { axiosBaseQuery } from '@/store/customBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  UploadImageRequest,
  UploadImageResponse,
  DeleteUploadRequest,
  DeleteUploadResponse,
} from './types';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Upload'],
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadImageResponse, UploadImageRequest>({
      query: ({ file, collection, owner_type }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (collection && owner_type) {
          formData.append('collection', collection);
          formData.append('owner_type', owner_type);
        }
        return {
          url: `/upload/image`,
          method: 'POST',
          data: formData,
        };
      },
    }),
    deleteUpload: builder.mutation<DeleteUploadResponse, DeleteUploadRequest>({
      query: ({ type, filename }) => ({
        url: `/upload/${type}/${filename}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useUploadImageMutation, useDeleteUploadMutation } = uploadApi;
