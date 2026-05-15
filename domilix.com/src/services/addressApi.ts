import api from './api';

export type ReverseGeocodeResult = {
  address: string;
  neighbourhood?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  coordinates: [number, number];
  text: string;
};

export const addressApi = {
  reverseGeocode: async (longitude: number, latitude: number): Promise<ReverseGeocodeResult | null> => {
    try {
      const response = await api.get('/addresses/reverse-geocode', {
        params: { longitude, latitude },
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  },
};
