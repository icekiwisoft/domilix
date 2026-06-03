import axios from 'axios';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';

export interface GeoapifyFeature {
  id?: string;
  properties: {
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    lon: number;
    lat: number;
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

export const searchPlaces = async (
  query: string,
  proximity?: [number, number]
): Promise<GeoapifyFeature[]> => {
  if (!query || query.length < 3 || !GEOAPIFY_API_KEY) return [];

  try {
    const params = new URLSearchParams({
      text: query,
      limit: '5',
      lang: 'fr',
      apiKey: GEOAPIFY_API_KEY,
    });

    if (proximity) params.set('bias', `proximity:${proximity[0]},${proximity[1]}`);

    const response = await axios.get<GeoapifyResponse>(
      `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`
    );

    return response.data.features || [];
  } catch (error) {
    console.error('Erreur lors de la recherche de lieux:', error);
    return [];
  }
};

export const reverseGeocode = async (
  longitude: number,
  latitude: number
): Promise<GeoapifyFeature | null> => {
  if (!GEOAPIFY_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      lon: String(longitude),
      lat: String(latitude),
      lang: 'fr',
      apiKey: GEOAPIFY_API_KEY,
    });

    const response = await axios.get<GeoapifyResponse>(
      `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`
    );

    return response.data.features?.[0] || null;
  } catch (error) {
    console.error('Erreur lors du géocodage inverse:', error);
    return null;
  }
};

export const parseAddressComponents = (feature: GeoapifyFeature) => {
  const props = feature.properties;
  const city = props.city || props.town || props.village || props.municipality || props.county || '';

  return {
    address: props.formatted || [props.address_line1, props.address_line2, city, props.country].filter(Boolean).join(', '),
    city,
    state: props.state || '',
    country: props.country || '',
    zip: props.postcode || '',
  };
};

export const getFeatureCoordinates = (feature: GeoapifyFeature): [number, number] => [
  Number(feature.properties.lon),
  Number(feature.properties.lat),
];
