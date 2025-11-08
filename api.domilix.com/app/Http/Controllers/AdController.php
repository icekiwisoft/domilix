<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdRequest;
use App\Http\Resources\AdDetailedResource;
use App\Http\Resources\Adresource;
use App\Models\Ad;
use App\Models\Furniture;
use App\Models\RealEstate;
use App\Models\Announcer;
use App\Models\Media;
use App\Models\Subscription;
use App\Models\Unlocking;
use App\Services\MapboxService;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AdController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check if AnnouncerId is provided
        if ($request->has('AnnouncerId')) {
            // Find the announcer by ID and return its ads
            $announcer = Announcer::findOrFail($request->AnnouncerId);
            $ads = $announcer->ads()->paginate(15);
            return Adresource::collection($ads);
        }

        $query = Ad::query();

        if ($request->has('search')) {
            $query->where(function (Builder $query) {
                $query->where('description', 'like', '%' . request('search') . '%')
                    ->orWhere('price', 'like', '%' . request('search') . '%')
                    ->orWhere('adress', 'like', '%' . request('search') . '%')
                    ->orWhere('city', 'like', '%' . request('search') . '%') ;
            });
        }

        // Filter by item type (furniture or real estate)
        if ($request->has('type')) {
            $query->where('adable_type', $request->type == 'furniture' ? Furniture::class : RealEstate::class);
        }

        if ($request->has('orderBy')) {
            $query->orderBy($request->orderBy);
        }

        // Filter ads liked by authenticated user
        if ($request->has('liked')) {
            $user = $request->user();
            $query->whereIn('id', $user->favorites()->pluck('ad_id'));
        }

        // Filter by budget
        if ($request->filled('budget_min') && $request->filled('budget_max')) {
            $query->whereBetween('price', [$request->budget_min, $request->budget_max]);
        } elseif ($request->filled('budget_min')) {
            $query->where('price', '>=', $request->budget_min);
        } elseif ($request->filled('budget_max')) {
            $query->where('price', '<=', $request->budget_max);
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $categoryIds = is_array($request->category_id) ? $request->category_id : [$request->category_id];
            $query->whereIn('category_id', $categoryIds);
        }

        // Filter by ad_type (location/sale)
        if ($request->filled('ad_type')) {
            $query->where('ad_type', $request->ad_type);
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Filter by devise (currency)
        if ($request->filled('devise')) {
            $query->where('devise', $request->devise);
        }

        // Filter by period
        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        // Filters specific to real estate
        if ($request->type === 'realestate' || !$request->has('type')) {
            // Filter by number of bedrooms
            if ($request->filled('bedroom_min') || $request->filled('bedroom_max')) {
                $query->whereHas('adable', function ($q) use ($request) {
                    if ($request->filled('bedroom_min') && $request->filled('bedroom_max')) {
                        $q->whereBetween('bedroom', [$request->bedroom_min, $request->bedroom_max]);
                    } elseif ($request->filled('bedroom_min')) {
                        $q->where('bedroom', '>=', $request->bedroom_min);
                    } elseif ($request->filled('bedroom_max')) {
                        $q->where('bedroom', '<=', $request->bedroom_max);
                    }
                });
            }

            // Filter by amenities
            if ($request->filled('amenities')) {
                $amenities = is_array($request->amenities) ? $request->amenities : [$request->amenities];
                $query->whereHas('adable', function ($q) use ($amenities) {
                    foreach ($amenities as $amenity) {
                        if (in_array($amenity, ['gate', 'pool', 'garage', 'furnitured'])) {
                            $q->where($amenity, true);
                        }
                    }
                });
            }

            // Filter by standing (based on amenities count)
            if ($request->filled('standing')) {
                $standing = $request->standing;
                $query->whereHas('adable', function ($q) use ($standing) {
                    switch ($standing) {
                        case 'standard':
                            // 0-1 amenities
                            $q->whereRaw('(CAST(gate AS UNSIGNED) + CAST(pool AS UNSIGNED) + CAST(garage AS UNSIGNED) + CAST(furnitured AS UNSIGNED)) <= 1');
                            break;
                        case 'confort':
                            // 2-3 amenities
                            $q->whereRaw('(CAST(gate AS UNSIGNED) + CAST(pool AS UNSIGNED) + CAST(garage AS UNSIGNED) + CAST(furnitured AS UNSIGNED)) BETWEEN 2 AND 3');
                            break;
                        case 'haut_standing':
                            // 4 amenities
                            $q->whereRaw('(CAST(gate AS UNSIGNED) + CAST(pool AS UNSIGNED) + CAST(garage AS UNSIGNED) + CAST(furnitured AS UNSIGNED)) = 4');
                            break;
                    }
                });
            }
        }

        // Filter ads unlocked by authenticated user
        if ($request->has("unlocked")) {
            $user = $request->user();
            $query->whereIn('id', $user->unlockedAds->pluck('ad_id'));
        }

        $ads = $query->with('adable')->paginate(20);

        if ($request->has("likeAdmin") && $request->user()?->is_admin)
            return AdDetailedResource::collection($ads);

        return Adresource::collection($ads);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAdRequest $request, MapboxService $mapboxService)
    {
        $this->authorize('create', Ad::class);
        $validated = $request->validated();
        $adable = null;

        // Géocodage inverse si les coordonnées sont fournies mais pas d'adresse complète
        if (isset($validated['localization']) && count($validated['localization']) === 2) {
            $longitude = (float) $validated['localization'][0];
            $latitude = (float) $validated['localization'][1];
            $validated['lng'] = $longitude;
            $validated['lat'] = $latitude;
            // Si pas d'adresse fournie ou adresse incomplète, faire un géocodage inverse
            if (empty($validated['address']) || empty($validated['city'])) {
                $addressData = $mapboxService->reverseGeocode($longitude, $latitude);
                
                if ($addressData) {
                    $validated['adress'] = $validated['address'] ?: $addressData['address'];
                    $validated['city'] = $validated['city'] ?: $addressData['city'];
                    $validated['state'] = $validated['state'] ?: $addressData['state'];
                    $validated['country'] = $validated['country'] ?: $addressData['country'];
                    $validated['zip'] = $validated['zip'] ?: $addressData['zip'];
                    
                    Log::info('Address resolved via reverse geocoding', [
                        'coordinates' => [$longitude, $latitude],
                        'resolved_address' => $addressData
                    ]);
                }
            }
        }

        // Check if the ad is for furniture or real estate and create accordingly
        if ($request->type == 'furniture') {
            $adable = Furniture::create($validated);
        } elseif ($request->type == 'realestate') {
            $adable = RealEstate::create($validated);
        }
        
        // Create ad and associate it with the specific ad type
        $ad = new Ad($validated);
        $announcer = $request->user()->announcer;

        $ad->announcer()->associate($announcer);

        $adable->ad()->save($ad);
        if ($request->hasFile("medias")) {
            $medias = new Collection();
            foreach ($request->medias as $index => $file) {
                $img = new Media();
                $mimetype = $file->getMimeType();
                $filename = date("d_m_y") . "---" . $file->hashName();
                $savedfile = $file->storeAs('public/medias', $filename);
                $img->file = $savedfile;
                $img->type = $mimetype;
                $img->announcer()->associate($ad->announcer);
                $img->save();
                $medias->push($img);
                
                // Si c'est le premier média, on l'attache avec is_presentation = true
                if ($index === 0) {
                    $ad->medias()->attach($img->id, ['is_presentation' => true]);
                } else {
                    $ad->medias()->attach($img->id, ['is_presentation' => false]);
                }
            }
        }

        if ($request->filled("filesid")) {
            $filesid = $request->collect("filesid");
            // Si aucun nouveau média n'a été uploadé, le premier filesid sera le média de présentation
            $isFirst = !$request->hasFile("medias");
            
            foreach ($filesid as $index => $id) {
                $ad->medias()->attach($id, [
                    'is_presentation' => ($isFirst && $index === 0)
                ]);
            }
        }

        $ad->save();

        return new Adresource($ad);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ad $announce)
    {
        $announce->load('adable'); // Load the related furniture or real estate
        return new AdDetailedResource($announce);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ad $ad)
    {
        $ad->update([
            'description' => $request->description,
            'price' => $request->price
        ]);

        // Update specific adable fields based on type (furniture or real estate)
        if ($ad->adable_type == Furniture::class) {
            $ad->adable->update($request->only(['height', 'width', 'length', 'weight']));
        } elseif ($ad->adable_type == RealEstate::class) {
            $ad->adable->update($request->only(['toilet', 'kitchen', 'bedroom', 'mainroom']));
        }

        return new Adresource($ad);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ad $ad)
    {
        $ad->adable->delete(); // Delete related adable (furniture or real estate)
        $ad->delete(); // Then delete the ad itself
        return response()->json(null, 204);
    }

    /**
     * Check if the ad information is unlocked for the user.
     */
    public function isUnlocked(Request $request, $adId)
    {
        $user = $request->user();
        $unlocking = Unlocking::where('user_id', $user->id)
            ->where('ad_id', $adId)
            ->first();

        if ($unlocking && !$unlocking->isExpired()) {
            return response()->json(['message' => 'Ad information is unlocked'], 200);
        }

        return response()->json(['message' => 'Ad information is not unlocked'], 403);
    }

    /**
     * Unlock ad information for a user for 7 days.
     */
    public function unlock(Request $request, $adId)
    {
        $user = $request->user();

        $existingUnlocking = Unlocking::where('user_id', $user->id)
            ->where('ad_id', $adId)
            ->first();

        if ($existingUnlocking && !$existingUnlocking->isExpired()) {
            return response()->json(['message' => 'Ad information already unlocked'], 200);
        }

        $subscription = Subscription::getActiveSubscription($user->id);

        if (!$subscription) {
            return response()->json(['message' => 'No valid subscription with sufficient credits'], 403);
        }

        $subscription->deductCredit();

        $unlocking = Unlocking::updateOrCreate(
            ['user_id' => $user->id, 'ad_id' => $adId],
            [
                'unlocked_at' => now(),
                'expires_at' => now()->addDays(7),
            ]
        );

        return response()->json(['message' => 'Ad information unlocked successfully', 'unlocking' => $unlocking], 201);
    }

    /**
     * Unlock ad information for a user (route method).
     */
    public function unlockAd(Request $request, Ad $ad)
    {
        $user = $request->user();

        // Vérifier si l'annonce est déjà débloquée
        $existingUnlocking = Unlocking::where('user_id', $user->id)
            ->where('ad_id', $ad->id)
            ->first();

        if ($existingUnlocking && !$existingUnlocking->isExpired()) {
            return response()->json(['message' => 'Annonce déjà débloquée'], 200);
        }

        // Vérifier si l'utilisateur a des crédits
        if ($user->credits < 1) {
            return response()->json(['message' => 'Crédits insuffisants'], 403);
        }

        // Déduire 1 crédit
        $user->decrement('credits', 1);

        // Créer ou mettre à jour le déblocage
        $unlocking = Unlocking::updateOrCreate(
            ['user_id' => $user->id, 'ad_id' => $ad->id],
            [
                'unlocked_at' => now(),
                'expires_at' => now()->addDays(7),
            ]
        );

        return response()->json([
            'message' => 'Annonce débloquée avec succès',
            'unlocking' => $unlocking,
            'remaining_credits' => $user->fresh()->credits
        ], 201);
    }

    /**
     * Recherche d'adresses avec autocomplétion
     */
    public function searchAddresses(Request $request, MapboxService $mapboxService)
    {
        $request->validate([
            'query' => 'required|string|min:3|max:100',
            'proximity' => 'nullable|array|size:2',
            'proximity.*' => 'numeric',
            'limit' => 'nullable|integer|min:1|max:10'
        ]);

        $query = $request->input('query');
        $proximity = $request->input('proximity');
        $limit = $request->input('limit', 5);

        $results = $mapboxService->searchPlaces($query, $proximity, $limit);

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    /**
     * Géocodage inverse pour obtenir l'adresse à partir des coordonnées
     */
    public function reverseGeocode(Request $request, MapboxService $mapboxService)
    {
        $request->validate([
            'longitude' => 'required|numeric|between:-180,180',
            'latitude' => 'required|numeric|between:-90,90'
        ]);

        $longitude = (float) $request->input('longitude');
        $latitude = (float) $request->input('latitude');

        $result = $mapboxService->reverseGeocode($longitude, $latitude);

        if ($result) {
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Impossible de résoudre l\'adresse pour ces coordonnées'
        ], 404);
    }
}
