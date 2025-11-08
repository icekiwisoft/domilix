<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum("sex", ["m", "f"])->default("m");
            $table->dateTime("birthday")->nullable();
            $table->string('phone_number')->unique();
            $table->boolean('phone_verified')->default(false);
            $table->boolean('is_admin')->default(false);

            // Added devise enum with all major currencies, defaulting to XOF (Franc CFA)
            $table->enum('devise', [
                'USD',
                'EUR',
                'GBP',
                'XOF',
                'XAF',
                'NGN',
                'KES',
                'GHS',
                'ZAR',
                'JPY',
                'CNY',
                'INR',
                'BRL',
                'RUB',
                'CAD',
                'AUD',
                'CHF',
                'SGD',
                'NZD',
                'MXN',
                'TRY',
                'AED',
                'SAR'
            ])->default('XOF');

            $table->rememberToken();
            $table->timestamps();
        });


        User::create([
            "name" => "domilix",
            "password" => Hash::make("domilix2024"),
            "phone_number" => "+237698555511",
            "phone_verified" => true,
            "email" => "announcer@domilix.com",
            "is_admin" => true
        ]);

        User::create([
            "name" => "nguewo fossong christian",
            "password" => Hash::make("nguewo"),
            "phone_number" => "+237696555511",
            "phone_verified" => true,
            "email" => "ngdream1953@gmail.com",
            "is_admin" => true
        ]);

        User::create([
            "name" => "kinkeu demessong frank",
            "password" => Hash::make("kinkeu"),
            "phone_number" => "+237697555511",
            "phone_verified" => true,
            "email" => "kinkeufrank@gmail.com",
            "is_admin" => true
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
