<?php

namespace Tests\Feature;

use App\Models\User;
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

    public function test_register_with_email_succeeds(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'API Tester',
            'email' => 'apitester@example.com',
            'password' => 'StrongPassword123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'user',
                'authorisation' => ['token', 'type'],
            ]);
    }

    public function test_login_requires_email_or_phone_number(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'password' => 'StrongPassword123',
        ]);

        $response->assertStatus(422);
    }

    public function test_me_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_me_endpoint_returns_authenticated_user_profile(): void
    {
        $user = User::where('email', 'announcer@domilix.com')->firstOrFail();

        $response = $this->actingAs($user, 'api')->getJson('/api/auth/me');

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('user.email', 'announcer@domilix.com');
    }

    public function test_reset_password_endpoint_validates_required_fields(): void
    {
        $response = $this->postJson('/api/auth/resetPassword', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'code', 'password']);
    }

    public function test_refresh_endpoint_returns_error_without_token(): void
    {
        $response = $this->postJson('/api/auth/refresh');

        $response
            ->assertStatus(400)
            ->assertJsonStructure(['code', 'message']);
    }
}
