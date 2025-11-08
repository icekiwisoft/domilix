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
        Schema::create('real_estates', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            $table->integer("toilet")->unsigned()->default(0);
            $table->integer("kitchen")->unsigned()->default(0);
            $table->integer("bedroom")->unsigned()->default(0);
            $table->integer("mainroom")->unsigned()->default(0);

            $table->boolean("gate")->default(false);
            $table->boolean("furnished")->default(false);
            $table->boolean("pool")->default(false);
            $table->boolean("garden")->default(false);
            $table->boolean("garage")->default(false);

            $table->float("lng")->nullable();
            $table->float("lat")->nullable();

            $table->float("caution")->nullable();

            $table->enum("standing", ["standart", "comfort", "bigstanding"])->default("standart");


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('real_estates');
    }
};
