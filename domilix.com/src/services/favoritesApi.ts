import { Ad } from '../utils/types';
import api from './api';

//toggle like/unlike for an ad
export const toggleLike = async (
  adId: number
): Promise<{ message: string; liked: boolean }> => {
  const response = await api.patch(`/announces/${adId}/like`);
  return response.data;
};

//get favorite ads for authenticated user
export const getFavoriteAds = async (
  params?: Record<string, any>
): Promise<any> => {
  const response = await api.get('/announces', {
    params: { ...params, liked: true },
  });
  return response.data;
};
