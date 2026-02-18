<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AnnouncerResource extends JsonResource
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
            'avatar' => $this->avatar, // L'URL est déjà complète depuis le contrôleur
            'contact' => $this->contact,
            'email' => $this->user->email ?? null,
            'creation_date' => $this->created_at,
            'bio' => $this->bio,
            'verified' => (bool) $this->verified,
            'houses' => $this->ads()->where('item_type', 'App\Models\RealEstate')->count(),
            'furnitures' => $this->ads()->where('item_type', 'App\Models\Furniture')->count(),
        ];
    }
}
