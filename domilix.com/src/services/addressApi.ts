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

export type AddressSearchResult = {
  id?: string;
  label?: string;
  text?: string;
  place_name?: string;
  city?: string;
  neighbourhood?: string;
  coordinates?: [number, number];
  longitude?: number;
  latitude?: number;
  center?: [number, number];
};

export const addressApi = {
  search: async (query: string): Promise<AddressSearchResult[]> => {
    if (!query.trim()) return [];
    try {
      const response = await api.get('/addresses/search', {
        params: { query, limit: 5, country: 'cm', language: 'fr', autocomplete: true },
      });
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

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
