<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{

    /**
     * Toggle like/unlike for an ad
     */
    public function toggleLike(Request $request, Ad $ad)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        // Check if the ad is already in favorites
        if ($user->favorites()->where('ad_id', $ad->id)->exists()) {
            // Remove from favorites
            $user->favorites()->where('ad_id', $ad->id)->delete();
            return response()->json(['message' => 'Ad removed from favorites successfully', 'liked' => false], 200);
        } else {
            // Add to favorites
            $user->favorites()->create(['ad_id' => $ad->id]);
            return response()->json(['message' => 'Ad added to favorites successfully', 'liked' => true], 201);
        }
    }
}
