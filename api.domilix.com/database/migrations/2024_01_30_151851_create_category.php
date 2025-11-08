<?php

use App\Models\Category;
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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->uuid("client_id");

            $table->timestamps();
            $table->enum("type", ["house", "furniture"])->default("house"); // 0 for house, 1 for furniture
            $table->string('name')->unique();
        });

        // Create house categories
        Category::create([
            "type" => "house",
            "name" => "Apartment"
        ]);
        Category::create([
            "type" => "house",
            "name" => "Room"
        ]);
        Category::create([
            "type" => "house",
            "name" => "House"
        ]);
        Category::create([
            "type" => "house",
            "name" => "Studio"
        ]);

        // Create furniture categories
        Category::create([
            "type" => "furniture",
            "name" => "Sofas"
        ]);
        Category::create([
            "type" => "furniture",
            "name" => "Tables"
        ]);
        Category::create([
            "type" => "furniture",
            "name" => "Chairs"
        ]);
        Category::create([
            "type" => "furniture",
            "name" => "Beds"
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
