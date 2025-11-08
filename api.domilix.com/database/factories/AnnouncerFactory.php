<?php

namespace Database\Factories;

use App\Models\Announcer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Announcer>
 */
class AnnouncerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

     protected $model=Announcer::class;


    public function definition(): array
    {
        return [
            'avatar'=>"avatars/".$this->faker->image(Storage::path("public/avatars"),300,300, null,false),
             'name' => $this->faker->name(),
            'phone_number' => $this->faker->phoneNumber(),
            'email'=>$this->faker->email(),

        ];
    }
}
