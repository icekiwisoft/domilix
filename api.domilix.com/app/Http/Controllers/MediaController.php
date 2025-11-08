<?php

namespace App\Http\Controllers;

use App\Http\Resources\MediaResource;
use App\Http\Resources\Adresource;
use App\Models\Media;
use App\Models\Announcer;
use App\Models\Ad;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class MediaController extends Controller
{

    public function index(Request $request)
    {
        // Check if AnnounceId is provided
        if ($request->has('AnnounceId')) {
            // Find the ad by ID and return its medias
            $ad = Ad::findOrFail($request->AnnounceId);
            $medias = $ad->medias()->paginate(15);
            return MediaResource::collection($medias);
        }
        
        // Check if AnnouncerId is provided
        if ($request->has('AnnouncerId')) {
            // Find the announcer by ID and return its medias
            $announcer = Announcer::findOrFail($request->AnnouncerId);
            $medias = $announcer->medias()->paginate(15);
            return MediaResource::collection($medias);
        }
        
        // If no specific ID, return all media
        $medias = Media::paginate(15);
        return MediaResource::collection($medias);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if AdId is provided for ad-specific media storage
        if ($request->has('AdId')) {
            $ad = Ad::findOrFail($request->AdId);
            
            if ($request->hasFile("medias")) {
                $medias = new Collection();
                foreach ($request->medias as $file) {
                    $img = new Media();
                    $mimetype = $file->getMimeType();
                    $filename = date("d_m_y") . "---" . $file->hashName();
                    $savedfile = $file->storeAs('public/medias', $filename);
                    $img->file = $savedfile;
                    $img->type = $mimetype;
                    $img->announcer()->associate($ad->announcer);
                    $img->save();
                    $medias->push($img);
                }

                $ad->medias()->syncWithoutDetaching($medias);
                return MediaResource::collection($medias);
            }

            if ($request->filled("filesid")) {
                $filesid = $request->collect("filesid");
                $attached = $ad->medias()->syncWithoutDetaching($filesid);
                $medias = Media::whereIn("id", $attached["attached"])->get();

                return MediaResource::collection($medias);
            }
        }
        
        // Handle general media storage without specific ad association
        if ($request->hasFile("medias")) {
            $medias = new Collection();
            foreach ($request->medias as $file) {
                $img = new Media();
                $mimetype = $file->getMimeType();
                $filename = date("d_m_y") . "---" . $file->hashName();
                $savedfile = $file->storeAs('public/medias', $filename);
                $img->file = $savedfile;
                $img->type = $mimetype;
                $img->save();
                $medias->push($img);
            }
            return MediaResource::collection($medias);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Media $media)
    {
        // Check if AdId is provided to detach media from specific ad
        if ($request->has('AdId')) {
            $ad = Ad::findOrFail($request->AdId);
            $ad->medias()->detach($media->id);
            return response()->json(['message' => 'Media detached from ad successfully'], 200);
        }
        
        // If no AdId, delete the media entirely
        $media->delete();
        return response()->json(['message' => 'Media deleted successfully'], 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function show(Media $media)
    {
        return new  MediaResource($media);
    }
}
