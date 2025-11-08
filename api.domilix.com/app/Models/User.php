<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Support\Facades\Auth;


class User extends Authenticatable implements JWTSubject
{

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'phone_verified',
        'is_admin'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];



    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    // public function getJWTCustomClaims() {
    //     return [];
    // }

    public function getJWTCustomClaims()
    {

        return [
            'email' => $this->email,
            'name' => $this->name,
            'is_admin' => $this->is_admin,
        ];
    }


    public function isAnnouncer()
    {
        return $this->announcer != null;
    }

    public function unlockedAds()
    {
        return $this->hasMany(Unlocking::class);
    }

    public function unlockings()
    {
        return $this->hasMany(Unlocking::class);
    }

    public function announcer(): HasOne
    {
        return $this->hasOne(Announcer::class);
    }

    public function announcerRequest(): HasOne
    {
        return $this->hasOne(AnnouncerRequest::class);
    }

    public function favorites(): HasMany
    {

        return $this->hasMany(Favorite::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
