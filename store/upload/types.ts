export interface UploadImageRequest {
  file: File;
  collection?: string;
  owner_type?: string;
}

export interface UploadImageResponse {
  url: string;
  filename: string;
  file_format: string;
  file_size_kb: number;
  metadata: {
    mime: string;
    width: number;
    height: number;
    format: string;
  };
  mediaId: number;
}

export interface DeleteUploadRequest {
  type: 'image' | 'video' | 'pdf';
  filename: string;
}

export type DeleteUploadResponse = void;
