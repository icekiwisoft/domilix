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
        Schema::create('announcer_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid("client_id");

            $table->foreignId('user_id')->constrained()->on('users');
            $table->string('status')->default('pending'); // Default status: pending ,rejected , validated
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcer_request');
    }
};
