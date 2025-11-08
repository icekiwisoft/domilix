<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Media extends Model
{
    use HasFactory, HasUuids;
    protected $uploadedFile;
    protected $fillable = [
        'file',
        'description',
        'announcer_id'
    ];

    public function ads(): BelongsToMany
    {
        return $this->belongsToMany(Ad::class, 'ad_media', 'media_id', 'ad_id')
                    ->withPivot('is_presentation')
                    ->withTimestamps();
    }

    public function announcer(): BelongsTo
    {
        return $this->belongsTo(Announcer::class);
    }
}
