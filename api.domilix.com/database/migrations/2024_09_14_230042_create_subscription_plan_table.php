<?php

use App\Models\SubscriptionPlan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('name');
        });

        // Insert default subscription plans using the model
        SubscriptionPlan::create(['name' => 'Standart']);
        SubscriptionPlan::create(['name' => 'Advantage']);
        SubscriptionPlan::create(['name' => 'Premium']);
        SubscriptionPlan::create(['name' => 'Ultimate']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
