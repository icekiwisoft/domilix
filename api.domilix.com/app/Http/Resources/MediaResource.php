<?php

namespace App\Http\Resources;

use App\Models\Announcer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MediaResource extends JsonResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "file" => Storage::url($this->file),
            "thumbnail" => Storage::url($this->thumbnail),
            "type" => $this->type,
            "announcer" => new AnnouncerResource($this->announcer),
            "ads" => $this->ads()->count()

        ];
    }
}
