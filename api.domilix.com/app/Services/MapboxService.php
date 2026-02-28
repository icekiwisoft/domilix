<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MapboxService
{
    private string $accessToken;
    private string $baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

    public function __construct()
    {
        $this->accessToken = config('services.mapbox.access_token');
    }

    /**
     * Effectue un géocodage inverse pour obtenir l'adresse à partir des coordonnées
     *
     * @param float $longitude
     * @param float $latitude
     * @return array|null
     */
    public function reverseGeocode(float $longitude, float $latitude): ?array
    {
        try {
            $response = Http::get("{$this->baseUrl}/{$longitude},{$latitude}.json", [
                'access_token' => $this->accessToken,
                'types' => 'place,locality,neighborhood,address',
                'language' => 'fr',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (!empty($data['features'])) {
                    return $this->parseAddressComponents($data['features'][0]);
                }
            }

            Log::warning('Mapbox reverse geocoding failed', [
                'longitude' => $longitude,
                'latitude' => $latitude,
                'response' => $response->body()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Mapbox reverse geocoding error', [
                'longitude' => $longitude,
                'latitude' => $latitude,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * Effectue une recherche d'adresse (géocodage direct)
     *
     * @param string $query
     * @param array|null $proximity [longitude, latitude]
     * @param int $limit
     * @param array $filters
     * @return array
     */
    public function searchPlaces(string $query, ?array $proximity = null, int $limit = 5, array $filters = []): array
    {
        try {
            $params = [
                'access_token' => $this->accessToken,
                'limit' => $limit,
                'types' => 'place,locality,neighborhood,address,poi',
                'language' => 'fr',
            ];

            if (!empty($filters['types'])) {
                $params['types'] = implode(',', $filters['types']);
            }

            if (!empty($filters['country'])) {
                $params['country'] = $filters['country'];
            }

            if (!empty($filters['language'])) {
                $params['language'] = $filters['language'];
            }

            if (!empty($filters['bbox']) && count($filters['bbox']) === 4) {
                $params['bbox'] = implode(',', $filters['bbox']);
            }

            if (array_key_exists('autocomplete', $filters)) {
                $params['autocomplete'] = $filters['autocomplete'] ? 'true' : 'false';
            }

            if ($proximity && count($proximity) === 2) {
                $params['proximity'] = "{$proximity[0]},{$proximity[1]}";
            }

            $response = Http::get("{$this->baseUrl}/" . urlencode($query) . ".json", $params);

            if ($response->successful()) {
                $data = $response->json();
                
                return array_map(function ($feature) {
                    return $this->parseAddressComponents($feature);
                }, $data['features'] ?? []);
            }

            Log::warning('Mapbox geocoding search failed', [
                'query' => $query,
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Mapbox geocoding search error', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Parse les composants d'adresse à partir d'une feature Mapbox
     *
     * @param array $feature
     * @return array
     */
    private function parseAddressComponents(array $feature): array
    {
        $components = [
            'address' => $feature['place_name'] ?? '',
            'city' => '',
            'state' => '',
            'country' => '',
            'zip' => '',
            'coordinates' => $feature['center'] ?? [0, 0],
            'text' => $feature['text'] ?? '',
        ];

        // Parcourir le contexte pour extraire les composants
        if (isset($feature['context']) && is_array($feature['context'])) {
            foreach ($feature['context'] as $item) {
                $id = $item['id'] ?? '';
                $text = $item['text'] ?? '';

                if (str_starts_with($id, 'place')) {
                    $components['city'] = $text;
                } elseif (str_starts_with($id, 'region')) {
                    $components['state'] = $text;
                } elseif (str_starts_with($id, 'country')) {
                    $components['country'] = $text;
                } elseif (str_starts_with($id, 'postcode')) {
                    $components['zip'] = $text;
                }
            }
        }

        // Si pas de ville dans le contexte, utiliser le texte principal si c'est une place
        if (empty($components['city']) && isset($feature['place_type']) && in_array('place', $feature['place_type'])) {
            $components['city'] = $feature['text'] ?? '';
        }

        return $components;
    }

    /**
     * Valide si les coordonnées sont valides
     *
     * @param float $longitude
     * @param float $latitude
     * @return bool
     */
    public function validateCoordinates(float $longitude, float $latitude): bool
    {
        return $longitude >= -180 && $longitude <= 180 && $latitude >= -90 && $latitude <= 90;
    }
}
