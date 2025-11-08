<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use App\Services\TwilioService;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\UserDetailedResource;


class AuthController extends Controller
{

    public function __construct(protected TwilioService $twilioService)
    {
        $this->middleware('auth:api', ['except' => ['login', 'register', 'refresh', 'verifyPhone', 'resendVerificationCode']]);
        $this->twilioService = $twilioService;
    }


    public function register(Request $request)
    {
        // Validation des champs de la requête
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users',
            'phone_number' => 'required|numeric|unique:users',
            'password' => 'required|string|min:8',
        ]);

        // Vérifier si la validation échoue
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Générer un code de vérification aléatoire
        $verificationCode = rand(100000, 999999);

        // Enregistrement de l'utilisateur
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'phone_verified' => false,
        ]);

        // Stocker le code de vérification dans le cache avec une expiration de 10 minutes
        Cache::put('verification_code_' . $user->id, $verificationCode, now()->addMinutes(10));

        // Envoyer le SMS de vérification
        $this->twilioService->sendSms($request->phone_number, "Votre code de vérification est {$verificationCode}");

        // Générer un token d'authentification
        $token = Auth::guard('api')->login($user);

        // Réponse JSON
        return response()->json([
            'status' => 'success',
            'message' => 'Un SMS de vérification a été envoyé.',
            'user' => new UserDetailedResource($user),
            'authorisation' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ]);
    }


    public function resendVerificationCode($user_id)
    {

        $user = User::find($user_id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        // Vérifiez si le numéro de téléphone de l'utilisateur n'est pas déjà vérifié
        if ($user->phone_verified) {
            return response()->json(['message' => 'Le numéro de téléphone est déjà vérifié.'], 422);
        }

        // Générer un nouveau code de vérification
        $verificationCode = rand(100000, 999999);

        // Stocker le nouveau code de vérification dans le cache avec une expiration de 10 minutes
        Cache::put('verification_code_' . $user->id, $verificationCode, now()->addMinutes(10));

        // Envoyer le nouveau SMS de vérification
        $this->twilioService->sendSms($user->phone_number, "Votre nouveau code de vérification est {$verificationCode}");

        return response()->json(['message' => 'Un nouveau SMS de vérification a été envoyé.']);
    }

    public function verifyPhone(Request $request, $user_id)
    {
        $request->validate([
            'verification_code' => 'required|numeric',
        ]);

        $user = User::find($user_id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        // Récupérer le code de vérification depuis le cache
        $cachedCode = Cache::get('verification_code_' . $user->id);

        if (!$cachedCode) {
            return response()->json(['message' => 'Le code de vérification a expiré.'], 422);
        }

        if ($request->verification_code == $cachedCode) {
            $user->phone_verified = true;
            $user->save();

            // Supprimer le code de vérification du cache
            Cache::forget('verification_code_' . $user->id);

            return response()->json(['message' => 'Vérification réussie, votre compte est activé.']);
        }

        return response()->json(['message' => 'Code de vérification incorrect.'], 422);
    }


    public function login(Request $request)
    {
        // Validation des données
        $request->validate([
            'phone_number' => 'nullable|numeric',
            'email' => 'nullable|string|email',
            'password' => 'required|string',
        ]);

        // Détermination des credentials
        if ($request->has('email')) {
            $credentials = $request->only('email', 'password');
        } elseif ($request->has('phone_number')) {
            $credentials = $request->only('phone_number', 'password');
        } else {
            return response()->json(['message' => 'Email ou numéro de téléphone requis.'], 422);
        }

        // Recherche de l'utilisateur
        $user = User::where($request->has('email') ? 'email' : 'phone_number', $request->input($request->has('email') ? 'email' : 'phone_number'))->first();

        // Vérification des informations d'identification
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Les informations de connexion sont incorrectes.'], 401);
        }

        // Vérification du numéro de téléphone
        if (!$user->phone_verified) {
            return response()->json(['message' => 'Le numéro de téléphone n\'est pas vérifié.'], 403);
        }

        // Tentative de connexion
        $token = Auth::guard('api')->attempt($credentials);
        if (!$token) {
            return response()->json([
                'code' => '403',
                'message' => 'bad credentials',
            ], 403);
        }

        // Réponse de succès
        $user = Auth::guard('api')->user();
        return response()->json([
            'user' => new UserDetailedResource($user),
            'authorisation' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ]);
    }


    public function logout()
    {
        // Vérifiez si l'utilisateur est authentifié
        if (!Auth::guard('api')->check()) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }
        Auth::guard('api')->logout();

        // Réponse de succès
        return response()->json(null, 203);
    }


    public function refresh()
    {
        try {
            return response()->json([
                'status' => 'success',
                'user' => new UserDetailedResource(Auth::guard('api')->user()),
                'authorisation' => [
                    'token' => Auth::guard('api')->refresh(),
                    'type' => 'bearer',
                ]
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'code' => 400,
                'message' => "token cannot be longer refreshed"
            ], 400);
        }
    }

    public function profile()
    {
        // Vérifiez si l'utilisateur est authentifié
        if (!Auth::guard('api')->check()) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $user = Auth::guard('api')->user();
        
        return response()->json([
            'status' => 'success',
            'user' => new UserDetailedResource($user)
        ]);
    }

    public function updateProfile(Request $request)
    {
        // Vérifiez si l'utilisateur est authentifié
        if (!Auth::guard('api')->check()) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $user = Auth::guard('api')->user();

        // Validation des données
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|required|numeric|unique:users,phone_number,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Mise à jour des données
        $user->update($request->only(['name', 'email', 'phone_number']));

        return response()->json([
            'status' => 'success',
            'message' => 'Profil mis à jour avec succès',
            'user' => new UserDetailedResource($user)
        ]);
    }

    public function updateAnnouncerProfile(Request $request)
    {
        // Vérifiez si l'utilisateur est authentifié
        if (!Auth::guard('api')->check()) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $user = Auth::guard('api')->user();

        // Vérifier si l'utilisateur est un annonceur
        if (!$user->announcer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'êtes pas un annonceur'
            ], 403);
        }

        // Validation des données
        $validator = Validator::make($request->all(), [
            'company_name' => 'sometimes|nullable|string|max:255',
            'bio' => 'sometimes|nullable|string|max:1000',
            'professional_phone' => 'sometimes|nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Mise à jour du profil annonceur
        $announcer = $user->announcer;
        $announcer->update([
            'name' => $request->company_name ?? $announcer->name,
            'bio' => $request->bio ?? $announcer->bio,
            'contact' => $request->professional_phone ?? $announcer->contact,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil annonceur mis à jour avec succès',
            'user' => new UserDetailedResource($user)
        ]);
    }
}
