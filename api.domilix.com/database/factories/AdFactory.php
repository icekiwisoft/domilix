<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\House>
 */
class AdFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        return [
            'item_type' => $this->faker->randomElement([1,0]),
            'price' => $this->faker->numberBetween(5000,20000),
            'description' => $this->faker->streetName(),
            'presentation_img'=>"images/".$this->faker->image(Storage::path("public/images"),400,300,'animals', false,false,"dogs")
        ];
    }
}
