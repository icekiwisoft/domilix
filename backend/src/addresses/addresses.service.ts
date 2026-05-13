import { Injectable, Logger } from '@nestjs/common';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';
import { SearchAddressesDto } from './dto/search-addresses.dto';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);
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

  private parseReverseAddressComponents(features: any[]) {
    const primaryFeature = features.find(feature => feature?.place_type?.includes('address')) || features[0];
    const findByType = (type: string) => features.find(feature => feature?.place_type?.includes(type));
    const neighborhoodFeature = findByType('neighborhood');
    const localityFeature = findByType('locality');
    const districtFeature = findByType('district');
    const placeFeature = findByType('place');
    const postcodeFeature = findByType('postcode');
    const regionFeature = findByType('region');
    const countryFeature = findByType('country');
    const components = {
      address: primaryFeature?.place_name || '',
      neighborhood: neighborhoodFeature?.text || '',
      city: '',
      state: '',
      country: '',
      zip: '',
      coordinates: primaryFeature?.center || primaryFeature?.geometry?.coordinates || [0, 0],
      text: primaryFeature?.text || '',
    };

    const candidates = [
      ...features,
      ...features.flatMap(feature => Array.isArray(feature?.context) ? feature.context : []),
    ];

    const readType = (item: any) => {
      const id = item?.id || '';
      const placeTypes = Array.isArray(item?.place_type) ? item.place_type : [];
      return {
        isPostcode: id.startsWith('postcode') || placeTypes.includes('postcode'),
        isPlace: id.startsWith('place') || placeTypes.includes('place'),
        isLocality: id.startsWith('locality') || placeTypes.includes('locality'),
        isDistrict: id.startsWith('district') || placeTypes.includes('district'),
        isNeighborhood: id.startsWith('neighborhood') || placeTypes.includes('neighborhood'),
        isRegion: id.startsWith('region') || placeTypes.includes('region'),
        isCountry: id.startsWith('country') || placeTypes.includes('country'),
      };
    };

    for (const item of candidates) {
      const text = item?.text || '';
      if (!text) continue;

      const type = readType(item);
      if (!components.zip && type.isPostcode) components.zip = text;
      if (!components.city && type.isPlace) components.city = text;
      if (!components.city && type.isLocality) components.city = text;
      if (!components.city && type.isDistrict) components.city = text;
      if (!components.neighborhood && type.isNeighborhood) components.neighborhood = text;
      if (!components.state && type.isRegion) components.state = text;
      if (!components.country && type.isCountry) components.country = text;
    }

    components.neighborhood = components.neighborhood || neighborhoodFeature?.text || localityFeature?.text || '';
    components.city = placeFeature?.text || components.city || localityFeature?.text || districtFeature?.text || '';
    components.state = regionFeature?.text || components.state;
    components.country = countryFeature?.text || components.country;
    components.zip = postcodeFeature?.text || components.zip;

    if (!components.city) {
      const fallback = candidates.find(item => {
        const type = readType(item);
        return type.isNeighborhood || type.isLocality || type.isDistrict;
      });
      components.city = fallback?.text || '';
    }

    const addressParts = [
      components.neighborhood,
      components.city,
      components.state,
      components.country,
    ].filter(Boolean);
    const uniqueAddressParts = addressParts.filter((part, index) => addressParts.indexOf(part) === index);
    const composedAddress = uniqueAddressParts.join(', ');

    if (components.address) {
      const hasNeighborhood = components.neighborhood && components.address.toLowerCase().includes(components.neighborhood.toLowerCase());
      components.address = hasNeighborhood || !components.neighborhood
        ? components.address
        : [components.neighborhood, components.address].join(', ');
    } else {
      components.address = composedAddress;
    }

    return components;
  }

  private featureKey(feature: any) {
    return feature?.id || `${feature?.place_type?.join('-') || 'feature'}:${feature?.text || feature?.place_name || ''}`;
  }

  private mergeFeatures(...featureGroups: any[][]) {
    const byKey = new Map<string, any>();
    for (const feature of featureGroups.flat()) {
      if (!feature) continue;
      byKey.set(this.featureKey(feature), feature);
    }
    return Array.from(byKey.values());
  }

  private hasFeatureType(features: any[], type: string) {
    return features.some(feature => Array.isArray(feature?.place_type) && feature.place_type.includes(type));
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
      this.logger.warn(`Reverse geocoding skipped: MAPBOX_ACCESS_TOKEN is missing for coordinates ${dto.longitude},${dto.latitude}`);
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

    const fetchReverseGeocode = async (searchParams: URLSearchParams) => fetch(
      `${this.baseUrl}/${dto.longitude},${dto.latitude}.json?${searchParams.toString()}`,
    );

    let response: Response;
    try {
      response = await fetchReverseGeocode(params);
    } catch (error) {
      this.logger.warn(`Reverse geocoding request failed for coordinates ${dto.longitude},${dto.latitude}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.warn(`Reverse geocoding failed for coordinates ${dto.longitude},${dto.latitude}: Mapbox status ${response.status}${errorBody ? ` - ${errorBody.slice(0, 300)}` : ''}`);
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    const payload = await response.json();
    let features = Array.isArray(payload.features) ? payload.features : [];

    if (!features.length) {
      const fallbackParams = new URLSearchParams({
        access_token: this.accessToken,
        language: 'fr',
      });
      const fallbackResponse = await fetchReverseGeocode(fallbackParams).catch(() => null);
      if (fallbackResponse?.ok) {
        const fallbackPayload = await fallbackResponse.json().catch(() => null);
        features = Array.isArray(fallbackPayload?.features) ? fallbackPayload.features : [];
      }
    }

    if (features.length) {
      const wantedTypes = ['address', 'neighborhood', 'locality', 'district', 'place', 'postcode', 'region', 'country'];
      const missingTypes = wantedTypes.filter(type => !this.hasFeatureType(features, type));
      const typedFeatureGroups = await Promise.all(
        missingTypes.map(async (type) => {
          const typedParams = new URLSearchParams({
            access_token: this.accessToken,
            language: 'fr',
            types: type,
          });
          const typedResponse = await fetchReverseGeocode(typedParams).catch(() => null);
          if (!typedResponse?.ok) return [];
          const typedPayload = await typedResponse.json().catch(() => null);
          return Array.isArray(typedPayload?.features) ? typedPayload.features : [];
        }),
      );
      features = this.mergeFeatures(features, ...typedFeatureGroups);
    }

    if (!features.length) {
      this.logger.warn(`Reverse geocoding returned no feature for coordinates ${dto.longitude},${dto.latitude}, including broad fallback`);
      return {
        success: false,
        message: "Impossible de resoudre l'adresse pour ces coordonnees",
      };
    }

    const components = this.parseReverseAddressComponents(features);
    this.logger.log(`Reverse geocoding resolved coordinates ${dto.longitude},${dto.latitude} to ${components.address || components.city || components.state || components.country || 'unknown place'}`);

    return {
      success: true,
      data: components,
    };
  }
}
