<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Ramsey\Uuid\Uuid;

class Announcer extends Model
{

    public $incrementing = false;


    protected $fillable = [
        'name',
        'user_id',
        'verified',
    ];

    use HasFactory, HasUuids;

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }


    public function uniqueIds(): array
    {
        return ['client_id'];
    }

    public function ads(): HasMany
    {

        return $this->hasMany(Ad::class);
    }


    public function medias(): HasMany
    {

        return $this->hasMany(Media::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
