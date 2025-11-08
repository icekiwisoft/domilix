<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;
    protected $fillable = [
        'credits',
        'duration',
        'subscription_plan_id',
        'user_id',
        'price',
        'expire_at',
        'initial_credits',
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active subscriptions (not expired and with credits).
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now())
            ->where('credits', '>', 0);
    }

    /**
     * Deduct a credit from the subscription.
     */
    public function deductCredit()
    {
        if ($this->credits > 0) {
            $this->credits -= 1;
            $this->save();
        }
    }


    public function subscription_plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }
}
