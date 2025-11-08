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
        Schema::create('ads', function (Blueprint $table) {

            $table->id();
            $table->uuid("client_id");

            $table->softDeletes();
            $table->string("adress")->default("");
            $table->string("city")->default("");
            $table->string("country")->default("");
            $table->string("state")->default("");
            $table->string("zip")->default("");
            
            $table->boolean("hidden")->default(false); //do you whant to hide this ads ?
            $table->enum("copyrigth_status", ["allowed", "checking", "fraude"])->default("allowed");
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


            //check if is furniture or realestate
            $table->string("item_type");
            $table->decimal("price", 15, 6, true)->default(0);

            $table->enum("ad_type", ["location", "sale"])->default("location");
            $table->unsignedBigInteger("ad_id");
            $table->string("announcer_id");
            $table->string("category_id")->nullable();
            $table->enum("period", ["hour", "day", "night", "month", "year"])->default("month")->nullable(); //the period of payment available (nigth , day , month , year),

            $table->timestamps();
            $table->text("description")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad');
    }
};
