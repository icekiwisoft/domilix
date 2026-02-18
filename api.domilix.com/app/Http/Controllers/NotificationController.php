<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::guard('api')->user();
        
        $query = Notification::forUser($user->id)
            ->orderBy('created_at', 'desc');

        // Filter by read status if provided
        if ($request->has('unread_only') && $request->unread_only) {
            $query->unread();
        }

        $notifications = $query->paginate($request->get('per_page', 20));

        return response()->json($notifications);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        $user = Auth::guard('api')->user();
        
        $count = Notification::forUser($user->id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        $user = Auth::guard('api')->user();
        
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::guard('api')->user();
        
        Notification::forUser($user->id)
            ->unread()
            ->update([
                'read' => true,
                'read_at' => now()
            ]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        $user = Auth::guard('api')->user();
        
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notification supprimée']);
    }

    /**
     * Delete all read notifications
     */
    public function deleteAllRead()
    {
        $user = Auth::guard('api')->user();
        
        Notification::forUser($user->id)
            ->where('read', true)
            ->delete();

        return response()->json(['message' => 'Toutes les notifications lues ont été supprimées']);
    }
}
