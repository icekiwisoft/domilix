import axios from 'axios';

const MAPBOX_ACCESS_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'your_mapbox_token_here';

export interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
    address?: string;
    category?: string;
    maki?: string;
    wikidata?: string;
    short_code?: string;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
  }>;
}

export interface MapboxGeocodingResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

export interface MapboxReverseGeocodingResponse {
  type: string;
  query: [number, number];
  features: MapboxFeature[];
  attribution: string;
}

// Service pour l'autocomplétion d'adresses
export const searchPlaces = async (
  query: string,
  proximity?: [number, number]
): Promise<MapboxFeature[]> => {
  if (!query || query.length < 3) return [];

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      limit: '5',
      types: 'place,locality,neighborhood,address,poi',
      language: 'fr',
    });

    if (proximity) {
      params.append('proximity', `${proximity[0]},${proximity[1]}`);
    }

    const response = await axios.get<MapboxGeocodingResponse>(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
    );

    return response.data.features;
  } catch (error) {
    console.error('Erreur lors de la recherche de lieux:', error);
    return [];
  }
};

// Service pour le géocodage inverse (coordonnées -> adresse)
export const reverseGeocode = async (
  longitude: number,
  latitude: number
): Promise<MapboxFeature | null> => {
  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      types: 'place,locality,neighborhood,address',
      language: 'fr',
    });

    const response = await axios.get<MapboxReverseGeocodingResponse>(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?${params}`
    );

    return response.data.features[0] || null;
  } catch (error) {
    console.error('Erreur lors du géocodage inverse:', error);
    return null;
  }
};

// Fonction utilitaire pour extraire les composants d'adresse
export const parseAddressComponents = (feature: MapboxFeature) => {
  const components = {
    address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
  };

  // Adresse principale
  components.address = feature.place_name;

  // Parcourir le contexte pour extraire les composants
  if (feature.context) {
    feature.context.forEach(item => {
      if (item.id.startsWith('place')) {
        components.city = item.text;
      } else if (item.id.startsWith('region')) {
        components.state = item.text;
      } else if (item.id.startsWith('country')) {
        components.country = item.text;
      } else if (item.id.startsWith('postcode')) {
        components.zip = item.text;
      }
    });
  }

  // Si pas de ville dans le contexte, utiliser le texte principal si c'est une place
  if (!components.city && feature.place_type.includes('place')) {
    components.city = feature.text;
  }

  return components;
};
