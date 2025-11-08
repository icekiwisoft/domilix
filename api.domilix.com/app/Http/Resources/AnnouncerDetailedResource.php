<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AnnouncerDetailedResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'user' => new UserResource($this->user),
            'avatar' => $this->avatar ? Storage::url($this->avatar) : null,
            'creation_date' => $this->created_at,
            'bio' => $this->bio,
            'verified' => (bool) $this->verified,
            'phone' => $this->phone,
            'email' => $this->user->email ?? null,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'realestates_count' => $this->ads()->where('item_type', 'App\Models\RealEstate')->count(),
            'furnitures_count' => $this->ads()->where('item_type', 'App\Models\Furniture')->count(),
            'total_ads' => $this->ads()->count(),
            'member_since' => $this->created_at->format('Y-m-d'),
        ];
    }
}