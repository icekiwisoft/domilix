<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
