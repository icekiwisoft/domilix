<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubscriptionRequest;
use App\Http\Resources\SubscriptionResource;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class SubscriptionsController extends Controller
{

    public function __construct(protected PaymentService $paymentService) {}

    /**
     * List all subscriptions for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $subscriptions = Subscription::where('user_id', $user->id)->get();

        return SubscriptionResource::collection($subscriptions);
    }

    /**
     * Subscribe a user to a plan.
     */
    public function store(StoreSubscriptionRequest $request)
    {

        $validated = $request->validated();
        return  $this->paymentService->processPayment($validated["payment_info"], $validated["plan_name"], $validated["method"]);
    }

    /**
     * Show a specific subscription for the authenticated user.
     */
    public function show(Request $request, Subscription $subscription)
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return new SubscriptionResource($subscription);
    }

    /**
     * Cancel a subscription (soft delete).
     */
    public function destroy(Request $request, Subscription $subscription)
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $subscription->delete();

        return response()->json(['message' => 'Subscription cancelled successfully'], 200);
    }
}
