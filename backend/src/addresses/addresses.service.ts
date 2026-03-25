import { Injectable } from '@nestjs/common';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';
import { SearchAddressesDto } from './dto/search-addresses.dto';

@Injectable()
export class AddressesService {
  private readonly baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  private get accessToken() {
    return process.env.MAPBOX_ACCESS_TOKEN || '';
  }

  private parseAddressComponents(feature: any) {
    const components = {
      address: feature?.place_name || '',
      city: '',
      state: '',
      country: '',
      zip: '',
      coordinates: feature?.center || [0, 0],
      text: feature?.text || '',
    };

    if (Array.isArray(feature?.context)) {
      for (const item of feature.context) {
        const id = item?.id || '';
        const text = item?.text || '';
        if (id.startsWith('place')) components.city = text;
        else if (id.startsWith('region')) components.state = text;
        else if (id.startsWith('country')) components.country = text;
        else if (id.startsWith('postcode')) components.zip = text;
      }
    }

    if (!components.city && Array.isArray(feature?.place_type) && feature.place_type.includes('place')) {
      components.city = feature?.text || '';
    }

    return components;
  }

  async search(dto: SearchAddressesDto) {
    if (!this.accessToken) {
      return { success: true, data: [] };
    }

    const params = new URLSearchParams({
      access_token: this.accessToken,
      limit: String(dto.limit || 5),
      types: dto.types?.join(',') || 'place,locality,neighborhood,address,poi',
      language: dto.language || 'fr',
    });

    if (dto.country) params.set('country', dto.country);
    if (dto.bbox?.length === 4) params.set('bbox', dto.bbox.join(','));
    if (dto.proximity?.length === 2) params.set('proximity', dto.proximity.join(','));
    if (dto.autocomplete !== undefined) params.set('autocomplete', String(dto.autocomplete));

    const response = await fetch(
      `${this.baseUrl}/${encodeURIComponent(dto.query)}.json?${params.toString()}`,
    );
    if (!response.ok) return { success: true, data: [] };
    const payload = await response.json();
    return {
      success: true,
      data: (payload.features || []).map((feature: any) => this.parseAddressComponents(feature)),
    };
  }

  async reverseGeocode(dto: ReverseGeocodeDto) {
    if (!this.accessToken) {
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    const params = new URLSearchParams({
      access_token: this.accessToken,
      types: 'place,locality,neighborhood,address',
      language: 'fr',
    });

    const response = await fetch(
      `${this.baseUrl}/${dto.longitude},${dto.latitude}.json?${params.toString()}`,
    );
    if (!response.ok) {
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    const payload = await response.json();
    const feature = payload.features?.[0];
    if (!feature) {
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    return {
      success: true,
      data: this.parseAddressComponents(feature),
    };
  }
}
