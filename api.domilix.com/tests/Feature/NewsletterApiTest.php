<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_newsletter_subscription_requires_valid_email(): void
    {
        $response = $this->postJson('/api/newsletters', ['email' => 'invalid-email']);

        $response->assertStatus(400);
    }

    public function test_newsletter_subscription_can_be_created(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/newsletters', ['email' => 'newuser@example.com']);

        $response
            ->assertStatus(201)
            ->assertJsonStructure(['message']);
    }

    public function test_newsletter_verify_returns_error_for_invalid_token(): void
    {
        $response = $this->getJson('/api/newsletter/invalid-token');

        $response
            ->assertStatus(400)
            ->assertJsonPath('message', 'Invalid verification token');
    }
}
