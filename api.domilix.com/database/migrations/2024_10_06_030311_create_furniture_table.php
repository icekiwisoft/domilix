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
        Schema::create('furnitures', function (Blueprint $table) {
            $table->id();
            $table->uuid("client_id");
            $table->softDeletes();
            // $table->foreign('id')->references('id')->on('ads')->onDelete('cascade');
            $table->integer("height")->unsigned()->nullable();
            $table->integer("width")->unsigned()->nullable();
            $table->integer("length")->unsigned()->nullable();
            $table->integer("weight")->unsigned()->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('furnitures');
    }
};
