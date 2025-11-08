<?php

namespace App\Http\Resources;

use App\Models\furniture;
use App\Models\RealEstate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdDetailedResource extends JsonResource
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
        $isOwner = false;
        
        if ($user) {
            $isLiked = $user->favorites()->where('ad_id', $this->id)->exists();
            
            // Vérifier si l'utilisateur est le propriétaire de l'annonce
            $isOwner = $user->announcer && $user->announcer->id === $this->announcer_id;
            
            // Vérifier si l'annonce est débloquée pour cet utilisateur ou si c'est le propriétaire
            $unlocking = $user->unlockings()->where('ad_id', $this->id)->first();
            $isUnlocked = $isOwner || ($unlocking && $unlocking->expires_at > now());
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
            $this->mergeWhen($this->item_type == RealEstate::class, [
                'bedroom' => $this->adable->bedroom,
                'toilet' => $this->adable->toilet,
                'kitchen' => $this->adable->kitchen,
                'mainroom' => $this->adable->mainroom,
                'garden' => $this->adable->garden,
                'gate' => $this->adable->gate,
                'pool' => $this->adable->pool,
                'caution' => $this->adable->caution,

            ]),

            $this->mergeWhen($this->item_type == furniture::class, [
                'height' => $this->adable->height,
                'width' => $this->adable->width,
                'length' => $this->adable->length,
                'weight' => $this->adable->weight,
            ]),
            "announcer" => $isUnlocked ? new AnnouncerDetailedResource($this->announcer) : new AnnouncerResource($this->announcer),
            
            // Position information - only if unlocked
            $this->mergeWhen($isUnlocked, [
                'latitude' => $this->adable->lat,
                'longitude' => $this->adable->lng,
                'exact_address' => $this->adress,
            ]),
            
            'creation_date' => $this->created_at,
            'liked' => $isLiked,
            'unlocked' => $isUnlocked,
            'is_owner' => $isOwner
        ];
    }
}
