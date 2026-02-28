<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_expected_payload(): void
    {
        $response = $this->getJson('/api/health');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'status',
                'services' => ['database'],
                'environment',
                'timestamp',
            ])
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('services.database', 'up');
    }
}
