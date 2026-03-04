<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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

    public function test_health_endpoint_returns_degraded_when_database_is_down(): void
    {
        DB::shouldReceive('connection')->andThrow(new \RuntimeException('db down'));

        $response = $this->getJson('/api/health');

        $response
            ->assertStatus(503)
            ->assertJsonPath('status', 'degraded')
            ->assertJsonPath('services.database', 'down');
    }
}
