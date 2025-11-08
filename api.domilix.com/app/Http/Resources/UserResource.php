<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "name" => $this->name,
            "sex" => $this->sex,
            "devise" => $this->devise,
            "phone_number" => $this->phone_number,
            "liked" => $this->favorites()->count(),
            "announcer" => $this->announcer ? $this->announcer->id : null
        ];
    }
}
