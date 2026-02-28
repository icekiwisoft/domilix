<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke()
    {
        $databaseStatus = 'up';

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $databaseStatus = 'down';
        }

        $ok = $databaseStatus === 'up';

        return response()->json([
            'status' => $ok ? 'ok' : 'degraded',
            'services' => [
                'database' => $databaseStatus,
            ],
            'environment' => app()->environment(),
            'timestamp' => now()->toIso8601String(),
        ], $ok ? 200 : 503);
    }
}
