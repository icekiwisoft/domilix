<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\AnnouncerRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    /**
     * Display a paginated listing of users.
     */
    public function index()
    {
        $users = User::paginate(15);
        return UserResource::collection($users);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:15',
            'phone_verified' => 'nullable|boolean',
            'is_admin' => 'nullable|boolean',
        ]);
        $user->update($validated);
        return new UserResource($user);
    }

    /**
     * Soft delete the specified user.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(null, 204);
    }

    /**
     * Create a request to become an announcer.
     */
    public function becomeAnnouncer(Request $request, User $user)
    {
        // Check if a request already exists for this user
        if (AnnouncerRequest::where('user_id', $user->id)->exists()) {
            return response()->json([
                'status' => 400,
                'message' => 'A request to become an announcer already exists'
            ], 400);
        }

        // Create a new announcer request
        AnnouncerRequest::create([
            'user_id' => $user->id,
            'status' => 'pending', // Default to pending, can be approved by admin later
        ]);

        return response()->json(['message' => 'Request to become an announcer has been submitted'], 201);
    }
}
