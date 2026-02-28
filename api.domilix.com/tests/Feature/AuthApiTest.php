<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_seeded_admin_account_succeeds(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'announcer@domilix.com',
            'password' => 'domilix2024',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'user',
                'authorisation' => ['token', 'type'],
            ])
            ->assertJsonPath('authorisation.type', 'bearer');
    }

    public function test_login_with_invalid_password_fails(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'announcer@domilix.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertStatus(401)
            ->assertJsonStructure(['message']);
    }

    public function test_register_requires_email_or_phone_number(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'password' => 'StrongPassword123',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }
}
