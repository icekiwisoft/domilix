<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class passwordResetRequestController extends Controller
{

    // public function __construct()
    // {
    //     $this->middleware('auth:api', ['except' => ['sendResetLinkEmail','resetPassword']]);

    // }

   public function sendResetLinkEmail(Request $request)
    {
        // Validation de l'email
        $request->validate(['email' => 'required|email']);

        // Recherche de l'utilisateur par email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Aucun utilisateur trouvé avec cet email.'], 404);
        }

        // Générer un code de vérification aléatoire
        $verificationCode = rand(100000, 999999);

        // Stocker le code de vérification dans le cache avec une expiration de 10 minutes
        Cache::put('verification_code_' . $user->id, $verificationCode, now()->addMinutes(10));

        // Envoyer le code de vérification par email
        try {
            Mail::raw(
                'Votre code de vérification est : ' . $verificationCode,
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Code de vérification pour réinitialiser votre mot de passe');
                }
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'envoi de l\'email : ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Un code de vérification a été envoyé à votre email.']);
    }

    public function resetPassword(Request $request)
    {
        // Validation des données
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|integer',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Recherche de l'utilisateur par email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Aucun utilisateur trouvé avec cet email.'], 404);
        }

        // Vérifier le code de vérification
        $cachedCode = Cache::get('verification_code_' . $user->id);

        if ($cachedCode != $request->code) {
            return response()->json(['message' => 'Code de vérification invalide.'], 400);
        }

        // Mise à jour du mot de passe
        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le code de vérification du cache
        Cache::forget('verification_code_' . $user->id);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    public function changePassword(Request $request)
    {
        // Validation des données
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Récupérer l'utilisateur authentifié
        $user = Auth::user();

        // Vérifier si l'ancien mot de passe est correct
        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json(['message' => 'L’ancien mot de passe est incorrect.'], 401);
        }

        // Mettre à jour le mot de passe
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }


}
