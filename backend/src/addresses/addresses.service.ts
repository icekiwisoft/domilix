import { Injectable, Logger } from '@nestjs/common';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';
import { SearchAddressesDto } from './dto/search-addresses.dto';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);
  private readonly baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private readonly geoapifyReverseUrl = 'https://api.geoapify.com/v1/geocode/reverse';

  private get accessToken() {
    return process.env.MAPBOX_ACCESS_TOKEN || '';
  }

  private get geoapifyApiKey() {
    return process.env.GEOAPIFY_API_KEY || '';
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

  private parseGeoapifyReverseResult(result: any) {
    const neighbourhood = result?.neighbourhood || result?.neighborhood || result?.suburb || result?.quarter || '';
    const city = result?.city || result?.town || result?.village || result?.municipality || result?.county || '';
    const state = result?.state || result?.region || '';
    const country = result?.country || '';
    const address = result?.formatted || [
      result?.address_line1,
      result?.address_line2,
      neighbourhood,
      city,
      state,
      country,
    ].filter(Boolean).join(', ');

    return {
      address,
      neighbourhood,
      city,
      state,
      country,
      zip: result?.postcode || '',
      coordinates: [Number(result?.lon || 0), Number(result?.lat || 0)],
      text: result?.name || result?.address_line1 || neighbourhood || city || address,
    };
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
    if (!this.geoapifyApiKey) {
      this.logger.warn(`Reverse geocoding skipped: GEOAPIFY_API_KEY is missing for coordinates ${dto.longitude},${dto.latitude}`);
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    const params = new URLSearchParams({
      apiKey: this.geoapifyApiKey,
      lon: String(dto.longitude),
      lat: String(dto.latitude),
      format: 'json',
      lang: 'fr',
    });

    let response: Response;
    try {
      response = await fetch(`${this.geoapifyReverseUrl}?${params.toString()}`);
    } catch (error) {
      this.logger.warn(`Reverse geocoding request failed for coordinates ${dto.longitude},${dto.latitude}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.warn(`Reverse geocoding failed for coordinates ${dto.longitude},${dto.latitude}: Geoapify status ${response.status}${errorBody ? ` - ${errorBody.slice(0, 300)}` : ''}`);
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    const payload = await response.json();
    const results = Array.isArray(payload.results) ? payload.results : [];

    if (!results.length) {
      this.logger.warn(`Geoapify reverse geocoding returned no result for coordinates ${dto.longitude},${dto.latitude}`);
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    const components = this.parseGeoapifyReverseResult(results[0]);
    this.logger.log(`Reverse geocoding resolved coordinates ${dto.longitude},${dto.latitude} to ${components.address || components.city || components.state || components.country || 'unknown place'}`);

    return {
      success: true,
      data: components,
    };
  }
}
