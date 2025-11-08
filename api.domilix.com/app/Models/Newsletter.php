<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class Newsletter extends Model
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
        'email',
        'verification_token',
        'verified'
    ];
}
