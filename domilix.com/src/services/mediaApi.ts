import { Media } from '../utils/types';
import api from './api';

//get medias for a specific ad
export const getMediasByAd = async (adId: number): Promise<Media[]> => {
  const response = await api.get(`medias?AnnounceId=${adId}`);
  return response.data;
};

//get medias for a specific announcer
export const getMediasByAnnouncer = async (
  announcerId: number
): Promise<Media[]> => {
  const response = await api.get(`medias?AnnouncerId=${announcerId}`);
  return response.data;
};

//get all medias by page and size
export const getMedias = async (
  page: number,
  size: number
): Promise<Media[]> => {
  const response = await api.get(`medias?page=${page}&size=${size}`);
  return response.data;
};

//upload medias for a specific ad
export const uploadMediasForAd = async (
  adId: number,
  formData: FormData
): Promise<Media[]> => {
  const response = await api.post(`medias?AdId=${adId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

//attach existing medias to an ad
export const attachMediasToAd = async (
  adId: number,
  fileIds: number[]
): Promise<Media[]> => {
  const response = await api.post(`medias?AdId=${adId}`, {
    filesid: fileIds,
  });
  return response.data;
};

//detach media from ad or delete media entirely
export const deleteMedia = async (
  mediaId: number,
  adId?: number
): Promise<{ message: string }> => {
  const url = adId ? `medias/${mediaId}?AdId=${adId}` : `medias/${mediaId}`;
  const response = await api.delete(url);
  return response.data;
};

//helper function to get full media URL
export const getMediaUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  return `${api.defaults.baseURL}${path}`;
};
