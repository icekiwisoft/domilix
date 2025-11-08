<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\Announcer;
use App\Models\User;
use Illuminate\Http\Request;

class StatController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        return response()->json([
            "furnitures" => Ad::where("item_type", 1)->count(),
            "houses" => Ad::where("item_type", 0)->count(),
            "announcers" => Announcer::count(),
            "users" => User::count(),
            "month_income" => 0,
            "mont" => 9,
            "verified_announcers" => Announcer::where("verified", true)->count()

        ]);
    }
}
