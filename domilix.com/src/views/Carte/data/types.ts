export interface MapListing {
  id: number;
  type?: string;
  title: string;
  description?: string;
  price: number;
  devise: string;
  period: string;
  item_type: string;
  ad_type: string;
  city: string;
  neighbourhood: string;
  address: string;
  country: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  thumbnail: string | null;
  medias?: Array<{
    id: string;
    file: string | null;
    thumbnail: string | null;
    url?: string | null;
    path?: string | null;
    type: string | null;
  }>;
  is_liked: boolean;
  is_verified: boolean;
  is_unlocked: boolean;
  advertiser_type: string;
  advertiser_name: string;
  contact_phone?: string | null;
  contact_email?: string | null;
}

export type MapTab = 'listings' | 'favorites' | 'unlocked' | 'directions' | 'filters' | 'pro';

export interface DirectionPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapFiltersState {
  city: string;
  item_type: string;
  price_min: string;
  price_max: string;
  ad_type: string;
  verified_only: boolean;
}

export const DEFAULT_FILTERS: MapFiltersState = {
  city: '',
  item_type: '',
  price_min: '',
  price_max: '',
  ad_type: '',
  verified_only: false,
};
