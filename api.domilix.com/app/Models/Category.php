<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Ramsey\Uuid\Uuid;

class Category extends Model
{
    use HasFactory, HasUuids;

    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }


    public function uniqueIds(): array
    {
        return ['client_id'];
    }
    protected $fillable = [
        'name',
        'type'
    ];

    public function ads(): HasMany
    {
        return $this->hasMany(Ad::class);
    }
}
