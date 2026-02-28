<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Domilix API",
 *     version="1.0.0",
 *     description="API documentation for Domilix backend"
 * )
 *
 * @OA\Server(
 *     url="/",
 *     description="Default server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
class ApiDocumentation
{
    /**
     * @OA\Get(
     *     path="/api",
     *     tags={"System"},
     *     summary="API status",
     *     description="Returns basic API status information",
     *     @OA\Response(
     *         response=200,
     *         description="API is reachable"
     *     )
     * )
     */
    public function status(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     tags={"Auth"},
     *     summary="Login",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="announcer@domilix.com"),
     *             @OA\Property(property="password", type="string", example="domilix2024")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Authenticated"),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
    public function login(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     tags={"Auth"},
     *     summary="Register",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "phone_number"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", example="StrongPassword123"),
     *             @OA\Property(property="phone_number", type="string", example="+237690000000")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Registered")
     * )
     */
    public function register(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     tags={"Auth"},
     *     summary="Current user profile",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Profile")
     * )
     */
    public function me(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/announces",
     *     tags={"Ads"},
     *     summary="List ads",
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="AnnouncerId", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", description="furniture|realestate", @OA\Schema(type="string")),
     *     @OA\Parameter(name="orderBy", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="liked", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="unlocked", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="category_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="budget_min", in="query", @OA\Schema(type="number")),
     *     @OA\Parameter(name="budget_max", in="query", @OA\Schema(type="number")),
     *     @OA\Parameter(name="ad_type", in="query", description="location|sale", @OA\Schema(type="string")),
     *     @OA\Parameter(name="city", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="address", in="query", description="Address contains filter (alias: adress)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="adress", in="query", description="Legacy address contains filter", @OA\Schema(type="string")),
     *     @OA\Parameter(name="devise", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="period", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="bedroom_min", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="bedroom_max", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="standing", in="query", description="standard|confort|haut_standing", @OA\Schema(type="string")),
     *     @OA\Parameter(name="amenities[]", in="query", @OA\Schema(type="array", @OA\Items(type="string"))),
     *     @OA\Response(response=200, description="Ads list")
     * )
     */
    public function announces(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/announces/{announce}",
     *     tags={"Ads"},
     *     summary="Get ad details",
     *     @OA\Parameter(name="announce", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Ad details")
     * )
     */
    public function announceShow(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/categories",
     *     tags={"Categories"},
     *     summary="List categories",
     *     @OA\Response(response=200, description="Categories list")
     * )
     */
    public function categories(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/addresses/search",
     *     tags={"Addresses"},
     *     summary="Search addresses",
     *     @OA\Parameter(name="query", in="query", required=true, @OA\Schema(type="string")),
     *     @OA\Parameter(name="proximity[]", in="query", @OA\Schema(type="array", @OA\Items(type="number"))),
     *     @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", default=5)),
     *     @OA\Parameter(name="types[]", in="query", description="Mapbox types filter", @OA\Schema(type="array", @OA\Items(type="string", enum={"country","region","postcode","district","place","locality","neighborhood","address","poi"}))),
     *     @OA\Parameter(name="country", in="query", description="ISO-3166 country code", @OA\Schema(type="string", example="cm")),
     *     @OA\Parameter(name="language", in="query", @OA\Schema(type="string", example="fr")),
     *     @OA\Parameter(name="bbox[]", in="query", description="Bounding box: minLon,minLat,maxLon,maxLat", @OA\Schema(type="array", @OA\Items(type="number"))),
     *     @OA\Parameter(name="autocomplete", in="query", @OA\Schema(type="boolean", default=true)),
     *     @OA\Response(response=200, description="Address results")
     * )
     */
    public function searchAddresses(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/notifications",
     *     tags={"Notifications"},
     *     summary="List user notifications",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Notifications list")
     * )
     */
    public function notifications(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     tags={"Auth"},
     *     summary="Logout",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Logged out")
     * )
     */
    public function logout(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/refresh",
     *     tags={"Auth"},
     *     summary="Refresh JWT token",
     *     @OA\Response(response=200, description="Token refreshed")
     * )
     */
    public function refreshToken(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/sendEmail",
     *     tags={"Auth"},
     *     summary="Request password reset email",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="announcer@domilix.com")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Reset email sent")
     * )
     */
    public function sendResetEmail(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/resetPassword",
     *     tags={"Auth"},
     *     summary="Reset password",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "code", "password", "password_confirmation"},
     *             @OA\Property(property="email", type="string", format="email", example="announcer@domilix.com"),
     *             @OA\Property(property="code", type="integer", example=123456),
     *             @OA\Property(property="password", type="string", minLength=8, example="NewStrongPassword123"),
     *             @OA\Property(property="password_confirmation", type="string", minLength=8, example="NewStrongPassword123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Password reset"),
     *     @OA\Response(response=400, description="Invalid verification code"),
     *     @OA\Response(response=404, description="User not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function resetPassword(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/addresses/reverse-geocode",
     *     tags={"Addresses"},
     *     summary="Reverse geocode coordinates",
     *     @OA\Parameter(name="latitude", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="longitude", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Response(response=200, description="Reverse geocode result")
     * )
     */
    public function reverseGeocode(): void
    {
    }

    /**
     * @OA\Patch(
     *     path="/api/announces/{ad}/like",
     *     tags={"Ads"},
     *     summary="Toggle ad favorite",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="ad", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Favorite toggled")
     * )
     */
    public function toggleFavorite(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/announces/{ad}/unlock",
     *     tags={"Ads"},
     *     summary="Unlock an ad",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="ad", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Ad unlocked")
     * )
     */
    public function unlockAd(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/verifyPhone/{user_id}",
     *     tags={"Auth"},
     *     summary="Verify phone number",
     *     @OA\Parameter(name="user_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"verification_code"},
     *             @OA\Property(property="verification_code", type="integer", example=123456)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Phone verified")
     * )
     */
    public function verifyPhone(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/resendVerificationCode/{user_id}",
     *     tags={"Auth"},
     *     summary="Resend phone verification code",
     *     @OA\Parameter(name="user_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Verification code resent")
     * )
     */
    public function resendVerificationCode(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/auth/changePassword",
     *     tags={"Auth"},
     *     summary="Change user password",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"old_password", "new_password", "new_password_confirmation"},
     *             @OA\Property(property="old_password", type="string", example="CurrentPassword123"),
     *             @OA\Property(property="new_password", type="string", minLength=8, example="NewStrongPassword123"),
     *             @OA\Property(property="new_password_confirmation", type="string", minLength=8, example="NewStrongPassword123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Password changed"),
     *     @OA\Response(response=401, description="Invalid old password"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function changePassword(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/notifications/unread-count",
     *     tags={"Notifications"},
     *     summary="Unread notifications count",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Unread count")
     * )
     */
    public function notificationsUnreadCount(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/notifications/{id}/read",
     *     tags={"Notifications"},
     *     summary="Mark notification as read",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Notification marked as read")
     * )
     */
    public function markNotificationRead(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/notifications/mark-all-read",
     *     tags={"Notifications"},
     *     summary="Mark all notifications as read",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="All notifications marked as read")
     * )
     */
    public function markAllNotificationsRead(): void
    {
    }

    /**
     * @OA\Delete(
     *     path="/api/notifications/{id}",
     *     tags={"Notifications"},
     *     summary="Delete one notification",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Notification deleted")
     * )
     */
    public function deleteNotification(): void
    {
    }

    /**
     * @OA\Delete(
     *     path="/api/notifications/read/all",
     *     tags={"Notifications"},
     *     summary="Delete all read notifications",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Read notifications deleted")
     * )
     */
    public function deleteAllReadNotifications(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/subscriptions",
     *     tags={"Subscriptions"},
     *     summary="List subscriptions",
     *     @OA\Response(response=200, description="Subscriptions list")
     * )
     */
    public function subscriptions(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/newsletters",
     *     tags={"Newsletter"},
     *     summary="List newsletters",
     *     @OA\Response(response=200, description="Newsletter list")
     * )
     */
    public function newsletters(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/newsletter/{token}",
     *     tags={"Newsletter"},
     *     summary="Verify newsletter token",
     *     @OA\Parameter(name="token", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Token verified")
     * )
     */
    public function verifyNewsletterToken(): void
    {
    }

    /**
     * @OA\Get(
     *     path="/api/webhooks/campay",
     *     tags={"Webhooks"},
     *     summary="Campay webhook endpoint",
     *     @OA\Response(response=200, description="Webhook processed")
     * )
     */
    public function webhookCampay(): void
    {
    }
}
