<?php

namespace App\Observers;

use App\Models\Announcer;

class AnnouncerObserver
{
    /**
     * Handle the Announcer "created" event.
     */
    public function creating(Announcer $announcer): void
    {
        $announcer->id = date("j-m-y") . 'A' . Announcer::count();
    }
}
