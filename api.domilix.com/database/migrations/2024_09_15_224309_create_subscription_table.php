<?php

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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('user_id')->constrainted()->on('users');
            $table->string('subscription_plan_id')->constrained()->on('subscription_plans');
            $table->decimal('price',  10, 2);
            $table->integer('duration')->default(10);
            $table->integer('initial_credits')->default(10);
            $table->integer('credits')->default(10);
            $table->timestamp('expire_at')->nullable();
            // $table->string('status')->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
