<?php

namespace App\Http\Resources;

use App\Models\furniture;
use App\Models\RealEstate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class Adresource extends  JsonResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    private function getType($item)
    {
        if ($item ==  RealEstate::class) {
            return "realestate";
        }
        if ($item ==  furniture::class) {
            return "furniture";
        }
    }
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isLiked = false;
        $isUnlocked = false;
        
        if ($user) {
            $isLiked = $user->favorites()->where('ad_id', $this->id)->exists();
            
            // Vérifier si l'annonce est débloquée pour cet utilisateur
            $unlocking = $user->unlockings()->where('ad_id', $this->id)->first();
            $isUnlocked = $unlocking && $unlocking->expires_at > now();
        }

        return [
            'id' => (int) $this->id,
            'type' => $this->getType($this->item_type),
            'description' => $this->description,
            'price' => $this->price,
            'medias' => MediaResource::collection($this->medias),
            'ad_type' => $this->ad_type,
            'period' => $this->period,
            'devise' => $this->devise,
            'address'=>$this->adress,
            'city'=>$this->city,
            'country'=>$this->country,
            'postal_code'=>$this->postal_code,
            'category' => new CategoryResource($this->category),
            'creation_date' => $this->created_at,
            'liked' => $isLiked,
            'unlocked' => $isUnlocked
        ];
    }
}
