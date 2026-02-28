<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;

class SubscriptionPlansController extends Controller
{
    /**
     * Display a listing of subscription plans.
     */
    public function index()
    {
        $plans = SubscriptionPlan::all();
        return response()->json($plans, 200);
    }

    /**
     * Create a new subscription plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:subscription_plans,name',
        ]);

        $plan = SubscriptionPlan::create($validated);

        return response()->json(['message' => 'Subscription plan created successfully', 'plan' => $plan], 201);
    }

    /**
     * Display the specified subscription plan.
     */
    public function show(SubscriptionPlan $subscriptionPlan)
    {
        return response()->json($subscriptionPlan, 200);
    }

    /**
     * Update the specified subscription plan.
     */
    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:subscription_plans,name,' . $subscriptionPlan->id,
        ]);

        $subscriptionPlan->update($validated);

        return response()->json(['message' => 'Subscription plan updated successfully', 'plan' => $subscriptionPlan], 200);
    }

    /**
     * Remove the specified subscription plan from storage.
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->delete();
        return response()->json(['message' => 'Subscription plan deleted successfully'], 200);
    }
}
