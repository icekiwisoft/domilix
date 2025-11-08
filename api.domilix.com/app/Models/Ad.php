<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Ramsey\Uuid\Uuid;

class Ad extends Model
{
    use SoftDeletes;
    use HasFactory, HasUuids;


    public function uniqueIds(): array
    {
        return ['client_id'];
    }

    protected $fillable = [
        'ad_type',
        'announcer_id',
        'category_id',
        'presentation_img',
        'description',
        'item_type',
        'devise',
        'period',
        'price',
        'adress',
        'city',
        'country',
        'postal_code',
        'latitude',
        'longitude',
    ];
    protected $casts = [
        'price' => 'double',
    ];


    // Relation polymorphique
    public function adable()
    {
        return $this->morphTo(__FUNCTION__, 'item_type', 'ad_id');
    }


    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }


    public function announcer(): BelongsTo
    {
        return $this->belongsTo(Announcer::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function unlockings()
    {
        return $this->hasMany(Unlocking::class);
    }


    public function medias(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'ad_media', 'ad_id', 'media_id')
                    ->withPivot('is_presentation')
                    ->withTimestamps();
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }
}
