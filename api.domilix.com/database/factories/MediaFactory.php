<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Media::class;
    public function definition(): array
    {
        return [
            'file' =>"medias/". $this->faker->image(Storage::path("public/medias"),400,300, null, false),
            'type' => "image"
        ];
    }
}
