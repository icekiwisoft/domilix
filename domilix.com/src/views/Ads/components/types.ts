import type { Ad } from '@utils/types';

export type PromoSlide = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  chip?: string;
  cta: string;
  bg: string;
  image: string;
  actionUrl?: string;
};

export type CitySection = {
  city: string;
  country?: string;
  adsCount?: number;
  ads: Ad[];
};
