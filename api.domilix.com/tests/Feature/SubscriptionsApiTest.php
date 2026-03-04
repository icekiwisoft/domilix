<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscriptions_index_requires_authentication(): void
    {
        $response = $this->getJson('/api/subscriptions');

        $response->assertStatus(401);
    }

    public function test_subscriptions_index_returns_ok_for_authenticated_user(): void
    {
        $user = User::where('email', 'announcer@domilix.com')->firstOrFail();

        $response = $this->actingAs($user, 'api')->getJson('/api/subscriptions');

        $response->assertOk();
    }

    public function test_subscriptions_store_validates_required_fields(): void
    {
        $user = User::where('email', 'announcer@domilix.com')->firstOrFail();

        $response = $this->actingAs($user, 'api')->postJson('/api/subscriptions', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['plan_name', 'method', 'payment_info']);
    }

    public function test_user_cannot_view_subscription_of_another_user(): void
    {
        $owner = User::where('email', 'announcer@domilix.com')->firstOrFail();
        $other = User::where('email', 'ngdream1953@gmail.com')->firstOrFail();
        $plan = SubscriptionPlan::firstOrFail();

        $subscription = Subscription::create([
            'user_id' => $owner->id,
            'subscription_plan_id' => (string) $plan->id,
            'price' => 1000,
            'duration' => 10,
            'initial_credits' => 10,
            'credits' => 10,
            'expire_at' => Carbon::now()->addDays(10),
        ]);

        $response = $this->actingAs($other, 'api')
            ->getJson('/api/subscriptions/' . $subscription->id);

        $response->assertStatus(403);
    }

    public function test_user_can_cancel_own_subscription(): void
    {
        $owner = User::where('email', 'announcer@domilix.com')->firstOrFail();
        $plan = SubscriptionPlan::firstOrFail();

        $subscription = Subscription::create([
            'user_id' => $owner->id,
            'subscription_plan_id' => (string) $plan->id,
            'price' => 1000,
            'duration' => 10,
            'initial_credits' => 10,
            'credits' => 10,
            'expire_at' => Carbon::now()->addDays(10),
        ]);

        $response = $this->actingAs($owner, 'api')
            ->deleteJson('/api/subscriptions/' . $subscription->id);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Subscription cancelled successfully');
    }
}
