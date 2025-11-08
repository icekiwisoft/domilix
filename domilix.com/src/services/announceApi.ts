import { Ad } from '../utils/types';
import api from './api';

//get all ads by page and size
export const getAds = async (params?: Record<string, any>): Promise<Ad[]> => {
  const response = await api.get('announces', {
    params,
  });
  return response.data;
};

export const getAd = async (id: number): Promise<Ad> => {
  const response = await api.get(`announces/${id}`);
  return response.data;
};

//get paginated ads for an announcer
export const getAdsByAnnouncer = async (
  id: string,
  page: number,
  size: number
): Promise<Ad[]> => {
  const response = await api.get(
    `announces?AnnouncerId=${id}&page=${page}&size=${size}`
  );
  return response.data.data || [];
};

// Unlock an ad
export const unlockAd = async (
  adId: number
): Promise<{
  message: string;
  unlocking: any;
  remaining_credits: number;
}> => {
  const response = await api.post(`announces/${adId}/unlock`);
  return response.data;
};

// Get categories
export const getCategories = async (type?: string): Promise<any[]> => {
  const response = await api.get('categories', {
    params: type ? { type } : {},
  });
  return response.data.data || [];
};
