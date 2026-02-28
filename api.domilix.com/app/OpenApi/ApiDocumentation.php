<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Domilix API",
 *     version="1.0.0",
 *     description="Complete API documentation for Domilix backend"
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
     *     description="Returns global API stats/status payload.",
     *     @OA\Response(
     *         response=200,
     *         description="API reachable",
     *         @OA\JsonContent(
     *             example={"status": "ok"}
     *         )
     *     )
     * )
     */
    public function apiStatus(): void {}

    /**
     * @OA\Get(
     *     path="/api/announces",
     *     tags={"Ads"},
     *     summary="List ads",
     *     description="Returns paginated ads with all available search filters.",
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="AnnouncerId", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", description="furniture|realestate", @OA\Schema(type="string")),
     *     @OA\Parameter(name="orderBy", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="liked", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="unlocked", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="budget_min", in="query", @OA\Schema(type="number")),
     *     @OA\Parameter(name="budget_max", in="query", @OA\Schema(type="number")),
     *     @OA\Parameter(name="category_id", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="ad_type", in="query", description="location|sale", @OA\Schema(type="string")),
     *     @OA\Parameter(name="city", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="address", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="devise", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="period", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="bedroom_min", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="bedroom_max", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="standing", in="query", description="standard|confort|haut_standing", @OA\Schema(type="string")),
     *     @OA\Parameter(name="amenities[]", in="query", @OA\Schema(type="array", @OA\Items(type="string"))),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated ads",
     *         @OA\JsonContent(example={"data": {}, "links": {}, "meta": {}})
     *     )
     * )
     */
    public function adsIndex(): void {}

    /**
     * @OA\Post(
     *     path="/api/announces",
     *     tags={"Ads"},
     *     summary="Create ad",
     *     description="Creates a furniture or real estate ad with medias.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"type", "description", "price", "category_id"},
     *                 @OA\Property(property="type", type="string", example="realestate"),
     *                 @OA\Property(property="description", type="string", example="Appartement moderne"),
     *                 @OA\Property(property="price", type="number", example=250000),
     *                 @OA\Property(property="category_id", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Ad created", @OA\JsonContent(example={"id": 101}))
     * )
     */
    public function adsStore(): void {}

    /**
     * @OA\Get(
     *     path="/api/announces/{announce}",
     *     tags={"Ads"},
     *     summary="Get ad details",
     *     @OA\Parameter(name="announce", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Ad details", @OA\JsonContent(example={"id": 1, "description": "..."}))
     * )
     */
    public function adsShow(): void {}

    /**
     * @OA\Put(
     *     path="/api/announces/{announce}",
     *     tags={"Ads"},
     *     summary="Update ad",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="announce", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Ad updated")
     * )
     */
    public function adsUpdate(): void {}

    /**
     * @OA\Delete(
     *     path="/api/announces/{announce}",
     *     tags={"Ads"},
     *     summary="Delete ad",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="announce", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Ad deleted")
     * )
     */
    public function adsDestroy(): void {}

    /**
     * @OA\Patch(
     *     path="/api/announces/{ad}/like",
     *     tags={"Ads"},
     *     summary="Toggle ad favorite",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="ad", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Favorite toggled", @OA\JsonContent(example={"liked": true}))
     * )
     */
    public function adsLike(): void {}

    /**
     * @OA\Post(
     *     path="/api/announces/{ad}/unlock",
     *     tags={"Ads"},
     *     summary="Unlock ad contacts",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="ad", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=201, description="Unlocked", @OA\JsonContent(example={"remaining_credits": 9}))
     * )
     */
    public function adsUnlock(): void {}

    /** @OA\Get(path="/api/categories", tags={"Categories"}, summary="List categories", @OA\Response(response=200, description="OK", @OA\JsonContent(example={"data": {}}))) */
    public function categoriesIndex(): void {}
    /** @OA\Post(path="/api/categories", tags={"Categories"}, summary="Create category", security={{"bearerAuth":{}}}, @OA\Response(response=201, description="Created")) */
    public function categoriesStore(): void {}
    /** @OA\Get(path="/api/categories/{category}", tags={"Categories"}, summary="Show category", @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function categoriesShow(): void {}
    /** @OA\Put(path="/api/categories/{category}", tags={"Categories"}, summary="Update category", security={{"bearerAuth":{}}}, @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Updated")) */
    public function categoriesUpdate(): void {}
    /** @OA\Delete(path="/api/categories/{category}", tags={"Categories"}, summary="Delete category", security={{"bearerAuth":{}}}, @OA\Parameter(name="category", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=204, description="Deleted")) */
    public function categoriesDestroy(): void {}

    /** @OA\Get(path="/api/announcers", tags={"Announcers"}, summary="List announcers", @OA\Response(response=200, description="OK")) */
    public function announcersIndex(): void {}
    /** @OA\Post(path="/api/announcers", tags={"Announcers"}, summary="Create announcer", security={{"bearerAuth":{}}}, @OA\Response(response=201, description="Created")) */
    public function announcersStore(): void {}
    /** @OA\Get(path="/api/announcers/{announcer}", tags={"Announcers"}, summary="Show announcer", @OA\Parameter(name="announcer", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function announcersShow(): void {}
    /** @OA\Put(path="/api/announcers/{announcer}", tags={"Announcers"}, summary="Update announcer", security={{"bearerAuth":{}}}, @OA\Parameter(name="announcer", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Updated")) */
    public function announcersUpdate(): void {}
    /** @OA\Delete(path="/api/announcers/{announcer}", tags={"Announcers"}, summary="Delete announcer", security={{"bearerAuth":{}}}, @OA\Parameter(name="announcer", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=204, description="Deleted")) */
    public function announcersDestroy(): void {}

    /** @OA\Get(path="/api/announcers/{announcer}/medias", tags={"Announcers"}, summary="List announcer medias", @OA\Parameter(name="announcer", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function announcersMediasIndex(): void {}

    /** @OA\Get(path="/api/medias", tags={"Medias"}, summary="List medias", @OA\Response(response=200, description="OK")) */
    public function mediasIndex(): void {}
    /** @OA\Post(path="/api/medias", tags={"Medias"}, summary="Create media", security={{"bearerAuth":{}}}, @OA\Response(response=201, description="Created")) */
    public function mediasStore(): void {}
    /** @OA\Get(path="/api/medias/{media}", tags={"Medias"}, summary="Show media", @OA\Parameter(name="media", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function mediasShow(): void {}
    /** @OA\Put(path="/api/medias/{media}", tags={"Medias"}, summary="Update media", security={{"bearerAuth":{}}}, @OA\Parameter(name="media", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Updated")) */
    public function mediasUpdate(): void {}
    /** @OA\Delete(path="/api/medias/{media}", tags={"Medias"}, summary="Delete media", security={{"bearerAuth":{}}}, @OA\Parameter(name="media", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=204, description="Deleted")) */
    public function mediasDestroy(): void {}

    /** @OA\Get(path="/api/users", tags={"Users"}, summary="List users", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="OK")) */
    public function usersIndex(): void {}
    /** @OA\Post(path="/api/users", tags={"Users"}, summary="Create user", security={{"bearerAuth":{}}}, @OA\Response(response=201, description="Created")) */
    public function usersStore(): void {}
    /** @OA\Get(path="/api/users/{user}", tags={"Users"}, summary="Show user", security={{"bearerAuth":{}}}, @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function usersShow(): void {}
    /** @OA\Put(path="/api/users/{user}", tags={"Users"}, summary="Update user", security={{"bearerAuth":{}}}, @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Updated")) */
    public function usersUpdate(): void {}
    /** @OA\Delete(path="/api/users/{user}", tags={"Users"}, summary="Delete user", security={{"bearerAuth":{}}}, @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=204, description="Deleted")) */
    public function usersDestroy(): void {}
    /** @OA\Patch(path="/api/users/{user}/become-announcer", tags={"Users"}, summary="Promote user to announcer", security={{"bearerAuth":{}}}, @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Updated")) */
    public function usersBecomeAnnouncer(): void {}

    /** @OA\Get(path="/api/announcer-requests", tags={"Announcer Requests"}, summary="List announcer requests", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="OK")) */
    public function announcerRequestsIndex(): void {}
    /** @OA\Post(path="/api/announcer-requests", tags={"Announcer Requests"}, summary="Create announcer request", security={{"bearerAuth":{}}}, @OA\Response(response=201, description="Created")) */
    public function announcerRequestsStore(): void {}
    /** @OA\Get(path="/api/announcer-requests/{announcer_request}", tags={"Announcer Requests"}, summary="Show announcer request", security={{"bearerAuth":{}}}, @OA\Parameter(name="announcer_request", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function announcerRequestsShow(): void {}
    /** @OA\Put(path="/api/announcer-requests/{announcer_request}", tags={"Announcer Requests"}, summary="Update announcer request", security={{"bearerAuth":{}}}, @OA\Parameter(name="announcer_request", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Updated")) */
    public function announcerRequestsUpdate(): void {}
    /** @OA\Delete(path="/api/announcer-requests/{announcer_request}", tags={"Announcer Requests"}, summary="Delete announcer request", security={{"bearerAuth":{}}}, @OA\Parameter(name="announcer_request", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=204, description="Deleted")) */
    public function announcerRequestsDestroy(): void {}

    /**
     * @OA\Get(
     *     path="/api/addresses/search",
     *     tags={"Addresses"},
     *     summary="Search addresses",
     *     description="Mapbox-powered autocomplete with optional geospatial filters.",
     *     @OA\Parameter(name="query", in="query", required=true, @OA\Schema(type="string")),
     *     @OA\Parameter(name="proximity[]", in="query", @OA\Schema(type="array", @OA\Items(type="number"))),
     *     @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", default=5)),
     *     @OA\Parameter(name="types[]", in="query", @OA\Schema(type="array", @OA\Items(type="string"))),
     *     @OA\Parameter(name="country", in="query", @OA\Schema(type="string", example="cm")),
     *     @OA\Parameter(name="language", in="query", @OA\Schema(type="string", example="fr")),
     *     @OA\Parameter(name="bbox[]", in="query", @OA\Schema(type="array", @OA\Items(type="number"))),
     *     @OA\Parameter(name="autocomplete", in="query", @OA\Schema(type="boolean", default=true)),
     *     @OA\Response(response=200, description="Address results", @OA\JsonContent(example={"success": true, "data": {}}))
     * )
     */
    public function addressesSearch(): void {}

    /** @OA\Get(path="/api/addresses/reverse-geocode", tags={"Addresses"}, summary="Reverse geocode", @OA\Parameter(name="longitude", in="query", required=true, @OA\Schema(type="number")), @OA\Parameter(name="latitude", in="query", required=true, @OA\Schema(type="number")), @OA\Response(response=200, description="OK", @OA\JsonContent(example={"success": true, "data": {}}))) */
    public function addressesReverse(): void {}

    /** @OA\Get(path="/api/newsletters", tags={"Newsletter"}, summary="List newsletters", @OA\Response(response=200, description="OK")) */
    public function newsletterIndex(): void {}
    /** @OA\Post(path="/api/newsletters", tags={"Newsletter"}, summary="Create newsletter", @OA\Response(response=201, description="Created")) */
    public function newsletterStore(): void {}
    /** @OA\Get(path="/api/newsletters/{newsletter}", tags={"Newsletter"}, summary="Show newsletter", @OA\Parameter(name="newsletter", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function newsletterShow(): void {}
    /** @OA\Put(path="/api/newsletters/{newsletter}", tags={"Newsletter"}, summary="Update newsletter", @OA\Parameter(name="newsletter", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Updated")) */
    public function newsletterUpdate(): void {}
    /** @OA\Delete(path="/api/newsletters/{newsletter}", tags={"Newsletter"}, summary="Delete newsletter", @OA\Parameter(name="newsletter", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=204, description="Deleted")) */
    public function newsletterDestroy(): void {}
    /** @OA\Get(path="/api/newsletter/{token}", tags={"Newsletter"}, summary="Verify newsletter token", @OA\Parameter(name="token", in="path", required=true, @OA\Schema(type="string")), @OA\Response(response=200, description="Verified")) */
    public function newsletterVerify(): void {}

    /** @OA\Get(path="/api/webhooks/campay", tags={"Webhooks"}, summary="Campay webhook", @OA\Response(response=200, description="Processed")) */
    public function webhookCampay(): void {}

    /** @OA\Post(path="/api/auth/register", tags={"Auth"}, summary="Register", description="Create an account with email or phone.", @OA\RequestBody(required=true, @OA\JsonContent(required={"name","password"}, @OA\Property(property="name", type="string"), @OA\Property(property="email", type="string", format="email"), @OA\Property(property="phone_number", type="string"), @OA\Property(property="password", type="string", minLength=8))), @OA\Response(response=200, description="Registered", @OA\JsonContent(example={"status": "success", "authorisation": {"token": "..."}}))) */
    public function authRegister(): void {}
    /** @OA\Post(path="/api/auth/login", tags={"Auth"}, summary="Login", @OA\RequestBody(required=true, @OA\JsonContent(@OA\Property(property="email", type="string"), @OA\Property(property="phone_number", type="string"), @OA\Property(property="password", type="string"))), @OA\Response(response=200, description="Authenticated", @OA\JsonContent(example={"authorisation": {"token": "..."}}))) */
    public function authLogin(): void {}
    /** @OA\Post(path="/api/auth/logout", tags={"Auth"}, summary="Logout", security={{"bearerAuth":{}}}, @OA\Response(response=203, description="Logged out")) */
    public function authLogout(): void {}
    /** @OA\Post(path="/api/auth/refresh", tags={"Auth"}, summary="Refresh token", @OA\Response(response=200, description="Refreshed", @OA\JsonContent(example={"authorisation": {"token": "..."}}))) */
    public function authRefresh(): void {}
    /** @OA\Get(path="/api/auth/me", tags={"Auth"}, summary="Get profile", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="Profile", @OA\JsonContent(example={"status": "success", "user": {}}))) */
    public function authMe(): void {}
    /** @OA\Put(path="/api/auth/me", tags={"Auth"}, summary="Update profile", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="Updated")) */
    public function authUpdateMe(): void {}
    /** @OA\Put(path="/api/auth/announcer-profile", tags={"Auth"}, summary="Update announcer profile", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="Updated")) */
    public function authUpdateAnnouncerProfilePut(): void {}
    /** @OA\Post(path="/api/auth/announcer-profile", tags={"Auth"}, summary="Update announcer profile (POST)", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="Updated")) */
    public function authUpdateAnnouncerProfilePost(): void {}
    /** @OA\Post(path="/api/auth/verifyPhone/{user_id}", tags={"Auth"}, summary="Verify phone", @OA\Parameter(name="user_id", in="path", required=true, @OA\Schema(type="integer")), @OA\RequestBody(required=true, @OA\JsonContent(required={"verification_code"}, @OA\Property(property="verification_code", type="integer", example=123456))), @OA\Response(response=200, description="Verified")) */
    public function authVerifyPhone(): void {}
    /** @OA\Post(path="/api/auth/resendVerificationCode/{user_id}", tags={"Auth"}, summary="Resend verification code", @OA\Parameter(name="user_id", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Code resent")) */
    public function authResendVerification(): void {}
    /** @OA\Post(path="/api/auth/sendEmail", tags={"Auth"}, summary="Send reset email", @OA\RequestBody(required=true, @OA\JsonContent(required={"email"}, @OA\Property(property="email", type="string", format="email", example="announcer@domilix.com"))), @OA\Response(response=200, description="Reset email sent")) */
    public function authSendResetEmail(): void {}
    /** @OA\Post(path="/api/auth/resetPassword", tags={"Auth"}, summary="Reset password", @OA\RequestBody(required=true, @OA\JsonContent(required={"email","code","password","password_confirmation"}, @OA\Property(property="email", type="string", format="email"), @OA\Property(property="code", type="integer", example=123456), @OA\Property(property="password", type="string", minLength=8), @OA\Property(property="password_confirmation", type="string", minLength=8))), @OA\Response(response=200, description="Password reset", @OA\JsonContent(example={"message": "Mot de passe reinitialise avec succes."}))) */
    public function authResetPassword(): void {}
    /** @OA\Post(path="/api/auth/changePassword", tags={"Auth"}, summary="Change password", security={{"bearerAuth":{}}}, @OA\RequestBody(required=true, @OA\JsonContent(required={"old_password","new_password","new_password_confirmation"}, @OA\Property(property="old_password", type="string"), @OA\Property(property="new_password", type="string", minLength=8), @OA\Property(property="new_password_confirmation", type="string", minLength=8))), @OA\Response(response=200, description="Password changed", @OA\JsonContent(example={"message": "Mot de passe modifie avec succes."}))) */
    public function authChangePassword(): void {}

    /** @OA\Get(path="/api/subscriptions", tags={"Subscriptions"}, summary="List subscriptions", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="OK", @OA\JsonContent(example={"data": {}}))) */
    public function subscriptionsIndex(): void {}
    /** @OA\Post(path="/api/subscriptions", tags={"Subscriptions"}, summary="Create subscription payment", security={{"bearerAuth":{}}}, @OA\RequestBody(required=true, @OA\JsonContent(required={"plan_name","method","payment_info"}, @OA\Property(property="plan_name", type="string", example="Offre Premium"), @OA\Property(property="method", type="string", example="campay"), @OA\Property(property="payment_info", type="string", example="237690000000"))), @OA\Response(response=200, description="Payment processed", @OA\JsonContent(example={"status": "success"}))) */
    public function subscriptionsStore(): void {}
    /** @OA\Get(path="/api/subscriptions/{subscription}", tags={"Subscriptions"}, summary="Show subscription", security={{"bearerAuth":{}}}, @OA\Parameter(name="subscription", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK")) */
    public function subscriptionsShow(): void {}
    /** @OA\Delete(path="/api/subscriptions/{subscription}", tags={"Subscriptions"}, summary="Cancel subscription", security={{"bearerAuth":{}}}, @OA\Parameter(name="subscription", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Cancelled", @OA\JsonContent(example={"message": "Subscription cancelled successfully"}))) */
    public function subscriptionsDestroy(): void {}

    /** @OA\Get(path="/api/notifications", tags={"Notifications"}, summary="List notifications", security={{"bearerAuth":{}}}, @OA\Parameter(name="unread_only", in="query", @OA\Schema(type="boolean")), @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")), @OA\Response(response=200, description="OK", @OA\JsonContent(example={"data": {}}))) */
    public function notificationsIndex(): void {}
    /** @OA\Get(path="/api/notifications/unread-count", tags={"Notifications"}, summary="Unread count", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="OK", @OA\JsonContent(example={"count": 5}))) */
    public function notificationsUnreadCount(): void {}
    /** @OA\Post(path="/api/notifications/{id}/read", tags={"Notifications"}, summary="Mark as read", security={{"bearerAuth":{}}}, @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="OK", @OA\JsonContent(example={"message": "Notification marquee comme lue"}))) */
    public function notificationsRead(): void {}
    /** @OA\Post(path="/api/notifications/mark-all-read", tags={"Notifications"}, summary="Mark all as read", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="OK", @OA\JsonContent(example={"message": "Toutes les notifications ont ete marquees comme lues"}))) */
    public function notificationsReadAll(): void {}
    /** @OA\Delete(path="/api/notifications/{id}", tags={"Notifications"}, summary="Delete notification", security={{"bearerAuth":{}}}, @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")), @OA\Response(response=200, description="Deleted", @OA\JsonContent(example={"message": "Notification supprimee"}))) */
    public function notificationsDeleteOne(): void {}
    /** @OA\Delete(path="/api/notifications/read/all", tags={"Notifications"}, summary="Delete all read notifications", security={{"bearerAuth":{}}}, @OA\Response(response=200, description="Deleted", @OA\JsonContent(example={"message": "Toutes les notifications lues ont ete supprimees"}))) */
    public function notificationsDeleteReadAll(): void {}
}
