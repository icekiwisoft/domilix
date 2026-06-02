import api from './api';
import { MapListing } from '../views/Carte/data/types';

export interface MapsListingsResponse {
  data: MapListing[];
  total: number;
}

export const getMapListings = async (params?: Record<string, any>): Promise<MapsListingsResponse> => {
  const response = await api.get('/maps/listings', { params });
  return response.data;
};

export const getMapListingsNearby = async (
  lat: number,
  lng: number,
  radius?: number,
): Promise<MapsListingsResponse> => {
  const response = await api.get('/maps/listings/nearby', {
    params: { lat, lng, radius },
  });
  return response.data;
};
