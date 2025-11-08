// a furniture ad type can be a location or a sale
export enum AdType {
  location = 'location',
  sale = 'sale',
}

//interface for announcer
export interface Announcer {
  name: string;
  avatar: string;
  furnitures: number;
  houses: number;
  contact: string;
  email: string;
  verified: boolean;
  id: string;
  bio: string;
  creation_date: string;
  // Detailed fields (available when unlocked)
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  realestates_count?: number;
  furnitures_count?: number;
  total_ads?: number;
  member_since?: string;
}

//interface for media
export interface Media {
  file: string;
  thumbnail: string;
  id: string;
  type: string;
  announcer: Announcer;
  ads: number;
}

//interface for ad
export interface Ad {
  description: string;
  item_type: AdType;
  ad_type: AdType;
  medias: Media[];
  presentation: string;
  mediasCount: number;
  category: Category;
  id: number;
  price: number;
  announcer: Announcer;
  creation_date: string;
  liked?: boolean;
  unlocked?: boolean;
  is_owner?: boolean;
  type?: string;
  devise?: string;
  period?: string;
  // Location fields
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  // Position fields (available when unlocked)
  latitude?: number;
  longitude?: number;
  exact_address?: string;
  // Real estate specific properties
  bedroom?: number;
  toilet?: number;
  mainroom?: number;
  kitchen?: number;
  garden?: number;
  gate?: number;
  pool?: number;
  caution?: number;
  // Furniture specific properties
  height?: number;
  width?: number;
  length?: number;
  weight?: number;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  is_admin?: boolean;
  sex?: string;
  devise?: string;
  phone_number: string;
  phone_verified?: boolean;
  liked?: number;
  announcer?: string | null;
  credits?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthData {
  status: 'guess' | 'logged' | 'unknow';
  user: User | null;
}

export interface MessageDialog {
  message: string;
  type: 'warn' | 'error' | 'info';
}

export interface Category {
  name: string;
  items: number;
  id: string;
  type: number;
  creation_date: string;
}

export interface TimerProps {
  targetDate: Date;
}

export interface OfferDetailsProps {
  title: string;
  credit: string;
  validity: string;
  price: string;
  features: string[];
  onClose: () => void;
}

export interface PricingProps {
  title: string;
  credits: string;
  validity: string;
  price: string;
  features: string[];
  isActive: boolean;
  onChoose: () => void;
}

export interface PhoneProps {
  value: string;
  onChange: (phone: string) => void;
}

export interface EncodedEmailProps {
  email: string;
}

export interface AdCreationRequest {
  category_id: string;
  price: number;
  type: string;
  ad_type: string;
  bedroom: number;
  mainroom: number;
  medias: File[];
  gate: number;
  pool: number;
  garage: number;
  toilet: number;
  furnitured: number;
  localization: string[];
  period: string;
}
