<?php

namespace App\Observers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class MediaObserver
{


    /**
     * Handle the Media "created" event.
     */
    public function creating(Media $media)
    {

        $filename = basename($media->file);
        $pathtosave = ('thumbnails/' . $filename);
        Image::read(Storage::path($media->file))->scale(500)->save("storage/".$pathtosave);
        $media->thumbnail = $pathtosave;
    }
}
