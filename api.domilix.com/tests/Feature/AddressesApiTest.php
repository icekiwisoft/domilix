<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AddressesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_addresses_validates_min_query_length(): void
    {
        $response = $this->getJson('/api/addresses/search?query=ab');

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['query']);
    }

    public function test_reverse_geocode_validates_coordinates(): void
    {
        $response = $this->getJson('/api/addresses/reverse-geocode?longitude=500&latitude=200');

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['longitude', 'latitude']);
    }

    public function test_search_addresses_returns_success_payload_with_filters(): void
    {
        Http::fake([
            'https://api.mapbox.com/*' => Http::response([
                'features' => [[
                    'place_name' => 'Douala, Littoral, Cameroun',
                    'text' => 'Douala',
                    'center' => [9.7, 4.05],
                    'context' => [
                        ['id' => 'place.1', 'text' => 'Douala'],
                        ['id' => 'region.1', 'text' => 'Littoral'],
                        ['id' => 'country.1', 'text' => 'Cameroun'],
                    ],
                ]],
            ], 200),
        ]);

        $response = $this->getJson('/api/addresses/search?query=douala&country=cm&language=fr&types[]=place&limit=5&autocomplete=true');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.city', 'Douala')
            ->assertJsonPath('data.0.country', 'Cameroun');
    }

    public function test_reverse_geocode_returns_not_found_when_provider_returns_no_feature(): void
    {
        Http::fake([
            'https://api.mapbox.com/*' => Http::response(['features' => []], 200),
        ]);

        $response = $this->getJson('/api/addresses/reverse-geocode?longitude=9.7&latitude=4.05');

        $response
            ->assertStatus(404)
            ->assertJsonPath('success', false);
    }
}
