<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Newsletter;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewsletterSubscription;
use App\Mail\SendNewsletterMessage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Exception;

class NewsletterController extends Controller
{
    /**
     * Display a listing of all newsletter subscribers.
     */
    public function index()
    {
        // Retrieve all verified subscribers
        $subscribers = Newsletter::where('verified', true)->get();
        return response()->json($subscribers, 200);
    }

    /**
     * Store a newly created newsletter subscription.
     */
    public function store(Request $request)
    {
        // Validate email
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:newsletters,email',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            // Create new subscription
            $mail = new Newsletter();
            $mail->email = $request->email;
            $mail->verification_token = Str::uuid();
            $mail->save();

            // Send verification email
            Mail::to($mail->email)->send(new NewsletterSubscription($mail));

            return response()->json(['message' => 'Subscription successful! Please check your email for a verification link.'], 201);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), 400);
        }
    }

    /**
     * Verify the user's email subscription.
     */
    public function verify($token)
    {
        // Find the subscriber by the verification token
        $newsletter = Newsletter::where('verification_token', $token)->first();

        if (!$newsletter) {
            return response()->json(['message' => 'Invalid verification token'], 400);
        }

        // Mark the subscriber as verified
        $newsletter->verified = true;
        $newsletter->verification_token = null; // Clear the token
        $newsletter->save();

        return response()->json(['message' => 'Email successfully verified!']);
    }

    /**
     * Send a message to all verified newsletter subscribers.
     */
    public function sendMessageToSubscribers(Request $request)
    {
        // Validate the message content
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Get all verified subscribers
        $subscribers = Newsletter::where('verified', true)->get();

        if ($subscribers->isEmpty()) {
            return response()->json(['message' => 'No verified subscribers found.'], 404);
        }

        // Send the message to all verified subscribers
        foreach ($subscribers as $subscriber) {
            Mail::to($subscriber->email)->send(new SendNewsletterMessage($request->subject, $request->message));
        }

        return response()->json(['message' => 'Message sent to all verified subscribers.'], 200);
    }

    /**
     * Send a message to a specific verified subscriber by email.
     */
    public function sendMessageToSubscriber(Request $request, $email)
    {
        // Validate the message content
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Find the subscriber by email
        $subscriber = Newsletter::where('email', $email)->where('verified', true)->first();

        if (!$subscriber) {
            return response()->json(['message' => 'Subscriber not found or not verified.'], 404);
        }

        // Send the message to the specific subscriber
        Mail::to($subscriber->email)->send(new SendNewsletterMessage($request->subject, $request->message));

        return response()->json(['message' => 'Message sent to subscriber.'], 200);
    }
}
