<?php

namespace App\Policies;

use App\Models\Announcer;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AnnouncerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user)
    {
        return $user?->is_admin
            ? Response::allow()
            : Response::denyWithStatus(401);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Announcer $announcer): bool
    {
        return $user->id === $announcer->user_id
            ? Response::allow()
            : Response::denyAsNotFound();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return
            $user?->is_admin
            ? Response::allow()
            : Response::denyWithStatus(401);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Announcer $announcer): bool
    {
        return
            $user?->announcer() == $announcer
            ? Response::allow()
            : Response::denyWithStatus(401);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Announcer $announcer): bool
    {
        return
            $user?->is_admin
            ? Response::allow()
            : Response::denyWithStatus(401);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Announcer $announcer): bool
    {
        return
            $user?->is_admin
            ? Response::allow()
            : Response::denyWithStatus(401);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Announcer $announcer): bool
    {
        //
    }
}
