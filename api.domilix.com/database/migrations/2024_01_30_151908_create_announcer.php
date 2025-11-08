<?php

use App\Models\Announcer;
use App\Models\User;
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
        Schema::create('announcers', function (Blueprint $table) {
            $table->string("id")->primary();
            $table->string("client_id")->unique();

            $table->string('name');
            $table->string('banned')->default(false);
            $table->foreignId('user_id')->constrained()->on('users');
            $table->boolean('verified')->default(false);
            $table->string('presentation')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
        });

        Announcer::create([
            "name" => "Domilix",
            "user_id" => User::firstWhere("email", "announcer@domilix.com")->id,
            "verified" => true,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcer');
    }
};
