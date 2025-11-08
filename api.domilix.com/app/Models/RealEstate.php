<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RealEstate extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $guarded = ["type"];

    protected $casts = [
        'gate' => 'boolean',
        'furnished' => 'boolean',
        'pool' => 'boolean',
        'garden' => 'boolean',
        'garage' => 'boolean',
    ];


    public function ad()
    {
        return $this->morphOne(Ad::class, 'adable', 'item_type', 'ad_id');
    }
}
