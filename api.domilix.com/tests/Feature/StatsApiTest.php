<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_stats_endpoint_returns_expected_keys(): void
    {
        $response = $this->getJson('/api');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'furnitures',
                'houses',
                'announcers',
                'users',
                'month_income',
                'mont',
                'verified_announcers',
            ]);
    }
}
