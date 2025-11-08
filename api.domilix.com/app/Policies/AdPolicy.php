<?php

namespace App\Policies;

use App\Models\Ad;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AdPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool {}

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Ad $ad): bool {}

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): Response
    {
        return
            $user?->isAnnouncer()
            ? Response::allow()
            : Response::denyWithStatus(401, $user ? "you're not an announcer" : "please try to log in ");
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Ad $ad): bool
    {
        return
            $user?->announcer->id == $ad->announcer_id
            ? Response::allow()
            : Response::denyWithStatus(401);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Ad $ad): bool
    {
        return
            $user?->announcer->id == $ad->announcer_id || $user->is_admin
            ? Response::allow()
            : Response::denyWithStatus(401);;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Ad $ad): bool
    {
        $user->is_admin
            ? Response::allow()
            : Response::denyWithStatus(401);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Ad $ad): bool
    {
        //
    }
}
