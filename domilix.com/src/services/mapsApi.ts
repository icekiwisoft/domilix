import api from './api';
import { MapListing } from '../views/Carte/data/types';

export interface MapsListingsResponse {
  data: MapListing[];
  total: number;
}

export interface MapsPlan {
  id: string;
  label: string;
  price: number;
  duration_days: number;
  duration_hours: number;
  unlock_count: number;
}

export interface MapsSubscription {
  id: number;
  plan: string;
  active: boolean;
  price: number;
  unlock_count: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface MapsSubscriptionStatusResponse {
  active: boolean;
  subscription: MapsSubscription | null;
}

export const getMapListings = async (params?: Record<string, any>): Promise<MapsListingsResponse> => {
  const response = await api.get('/maps/announces', { params });
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

export const getMapsPlans = async (): Promise<MapsPlan[]> => {
  const response = await api.get('/maps/plans');
  return response.data;
};

export const subscribeMaps = async (plan: string, paymentMethod?: string, phoneNumber?: string): Promise<any> => {
  const response = await api.post('/maps/subscribe', { plan, payment_method: paymentMethod, phone_number: phoneNumber });
  return response.data;
};

export const getMapsSubscriptionStatus = async (): Promise<MapsSubscriptionStatusResponse> => {
  const response = await api.get('/maps/subscription');
  return response.data;
};

export const cancelMapsSubscription = async (): Promise<{ message: string }> => {
  const response = await api.post('/maps/cancel');
  return response.data;
};
