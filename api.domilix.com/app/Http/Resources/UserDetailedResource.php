<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserDetailedResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "sex" => $this->sex,
            "devise" => $this->devise,
            "phone_number" => $this->phone_number,
            "email" => $this->email,
            "phone_verified" => $this->phone_verified,
            "liked" => $this->favorites()->count(),
            "announcer" => $this->announcer ? $this->announcer->id : null,
            "credits" => $this->subscriptions()
                ->where('expire_at', '>', now())
                ->where('credits', '>', 0)
                ->sum('credits'),
            "unlocked" => $this->unlockings()
                ->where('expires_at', '>', now())
                ->count(),
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at
        ];
    }
}