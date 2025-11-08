<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class WebhooksController extends Controller
{
    //we inject the payment service
    public function __construct(protected PaymentService $paymentService) {}
    /**
     * Subscribe a user to a plan.
     */
    public function campay(Request $request)
    {

        // Retrieve the  payment plan by name
        $payment = Payment::where('id', $request->external_reference)->firstOrFail();

        // Retrieve the subscription plan by name
        $subscriptionPlan = SubscriptionPlan::where('name', $payment->payment_type_info)->firstOrFail();

        // Create a new subscription for the user
        Subscription::create([
            'subscription_plan_id' => $subscriptionPlan->id,
            'user_id' => $payment->user_id,
            'initial_credits' => $this->paymentService->getCreditsForPlan($subscriptionPlan->name),
            'credits' => $this->paymentService->getCreditsForPlan($subscriptionPlan->name),
            'price' => $this->paymentService->getPriceForPlan($subscriptionPlan->name),
            'duration' => $this->paymentService->getDurationForPlan($subscriptionPlan->name),
            'expire_at' => now()->addDays($this->paymentService->getDurationForPlan($subscriptionPlan->name)),
        ]);
        return response()->json(null, 200);
    }
}
