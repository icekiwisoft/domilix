<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnnouncerRequest;
use App\Http\Resources\AnnouncerResource;
use App\Models\Announcer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnouncerController extends Controller
{
    /**
     * Display a paginated listing of announcers.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Announcer::class);

        $announcers = Announcer::paginate(10);
        return AnnouncerResource::collection($announcers);
    }

    /**
     * Store a newly created announcer in storage.
     */
    public function store(StoreAnnouncerRequest $request)
    {
        // Ensure the authenticated user is an admin
        if (!$request->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

        // Ensure the provided user_id exists
        $user = User::find($validated['user_id']);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Create the announcer for the chosen user
        $announcer = Announcer::create($validated);

        // Handle the avatar file if provided
        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            $filename = $announcer->id . '.' . $request->file('avatar')->guessExtension();
            $savedFile = $request->file('avatar')->storeAs('public/images', $filename);
            $announcer->avatar = Storage::url($savedFile);
            $announcer->save();
        }

        return new AnnouncerResource($announcer);
    }

    /**
     * Display the specified announcer.
     */
    public function show(Announcer $announcer)
    {
        return new AnnouncerResource($announcer);
    }

    public function updatePresentation() {}


    public  function  updateAvatar() {}

    /**
     * Update the specified announcer in storage.
     */
    public function update(Request $request, Announcer $announcer)
    {
        // Ensure the authenticated user is an admin
        if (!$request->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'avatar' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Ensure the new user exists if user_id is being updated
        if (isset($validated['user_id'])) {
            $user = User::find($validated['user_id']);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
        }

        // Update the announcer details
        $announcer->update($validated);

        // Handle avatar update if a new file is provided
        if ($request->hasFile('avatar')) {
            if ($announcer->avatar) {
                Storage::delete(str_replace('/storage/', 'public/', $announcer->avatar));
            }

            $filename = $announcer->id . '.' . $request->file('avatar')->guessExtension();
            $savedFile = $request->file('avatar')->storeAs('public/images', $filename);
            $announcer->avatar = Storage::url($savedFile);
            $announcer->save();
        }

        return new AnnouncerResource($announcer);
    }

    /**
     * Remove the specified announcer from storage.
     */
    public function destroy(Announcer $announcer)
    {
        // Ensure the authenticated user is an admin
        if (!request()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($announcer->avatar) {
            Storage::delete(str_replace('/storage/', 'public/', $announcer->avatar));
        }

        $announcer->delete();

        return response()->json(null, 204);
    }
}
