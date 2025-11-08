<?php

use App\Models\Newsletter;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('newsletters', function (Blueprint $table) {
            $table->id();
            $table->uuid("client_id")->unique();
            $table->string('email');
            $table->string('verification_token')->nullable();
            $table->boolean("verified")->default(false);
            $table->timestamps();
        });


        Newsletter::create([
            "email" => "ngdream1953@gmail.com",
            "verified" => true,
            "verification_token" => Str::uuid()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsletters');
    }
};
