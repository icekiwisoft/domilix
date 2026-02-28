<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        if (app()->environment('production')) {
            $appUrl = config('app.url');

            if (!empty($appUrl)) {
                URL::forceRootUrl($appUrl);
            }

            URL::forceScheme('https');
        }
    }
}
