import api from './api';

export type UploadType = 'media' | 'avatar' | 'presentation-image';

export type UploadResponse = {
  url: string;
  thumbnail: string | null;
  type: UploadType;
  mime_type: string;
  size: number;
  original_name?: string;
};

export const uploadApi = {
  uploadFile: async (file: File, type: UploadType): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    const response = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};
