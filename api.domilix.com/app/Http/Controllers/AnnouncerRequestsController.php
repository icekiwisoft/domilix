<?php

namespace App\Http\Controllers;


use App\Models\Announcer;
use App\Models\AnnouncerRequest;
use Illuminate\Http\Request;

class AnnouncerRequestsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // List all pending announcer requests
        $requests = AnnouncerRequest::where('status', 'pending')->get();
        return response()->json($requests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if the user already has a pending or approved request
        $user = $request->user();
        $existingRequest = AnnouncerRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'You already have a pending request or are already an advertiser.'], 400);
        }

        // Create a new announcer request
        AnnouncerRequest::create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Your request to become an announcer has been successfully submitted.'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Show details of a specific request
        $request = AnnouncerRequest::findOrFail($id);
        return response()->json($request);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Approve or reject the announcer request
        $announcerRequest = AnnouncerRequest::findOrFail($id);

        if ($announcerRequest->status !== 'pending') {
            return response()->json(['message' => 'The request has already been processed.'], 400);
        }

        // Validate inputs
        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        // Update request status
        $announcerRequest->status = $request->status;
        $announcerRequest->save();

        // If approved, create announcer account and update user role
        if ($request->status === 'approved') {
            $user = $announcerRequest->user;
            // Create announcer account
            Announcer::create([
                'user_id' => $user->id,
                'name' => $user->name,
            ]);
            $user->save();
        }

        return response()->json(['message' => 'Request status updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Delete an announcer request
        $announcerRequest = AnnouncerRequest::findOrFail($id);
        $announcerRequest->delete();

        return response()->json(['message' => 'Request deleted successfully.']);
    }
}
