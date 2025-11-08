<?php

namespace App\Services;

use App\Models\Payment;
use GuzzleHttp\Client as GuzzleHttpClient;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\Http;
use Twilio\Rest\Client;


class PaymentService
{

    protected $client;

    public function __construct()
    {

        $CAMPAY_URI = getenv('CAMPAY_ENDPOINT'); // ou mettez directement votre SID

    }

    /**
     * Get price based on the subscription plan name.
     */
    public  function getPriceForPlan($planName)
    {
        switch ($planName) {
            case 'Standart':
                return 5.00;
            case 'Advantage':
                return 10.00;
            case 'Premium':
                return 20.00;
            case 'Ultime':
                return 25.00;
            default:
                return 0.00;
        }
    }

    /**
     * Get duration in days based on the subscription plan name.
     */
    public function getDurationForPlan($planName)
    {
        switch ($planName) {
            case 'Standart':
                return 3;
            case 'Advantage':
                return 7;
            case 'Premium':
                return 14;
            case 'Ultime':
                return 30;
            default:
                return 0;
        }
    }
    /**
     * Get credits based on the subscription plan name.
     */
    public function getCreditsForPlan($planName)
    {
        switch ($planName) {
            case 'Standart':
                return 20;
            case 'Advantage':
                return 50;
            case 'Premium':
                return 100;
            case 'Ultime':
                return 250;
            default:
                return 0;
        }
    }

    /**
     * Process payment with Campay (mock implementation).
     */
    public function processPayment(string $payment_info, string $plan_name, string  $method)
    {

        if ($method  != "mtn"  && $method != "orange")
            return response()->json(null, ["code" => 403, "message" => "unsupported payment method"]);
        $client = new GuzzleHttpClient(["verify" => false]);
        $headers = [
            'Authorization' => 'Token 852ad3c4f6e8d40aa37e148cccb8b772e67de75d',
            'Content-Type' => 'application/json'
        ];

        $payment = Payment::create([
            "amount" => $this->getPriceForPlan($plan_name),
            "payment_method" => $method,
            "payment_info" => $payment_info,
            "user_id" => request()->user()->id,
            "payment_type_info" => $plan_name


        ]);
        $body = [
            "amount" => $this->getPriceForPlan($plan_name),
            "from" => $payment_info,
            "description" => "Test",
            "external_reference" => $payment->id
        ];
        $request = new Request('POST', 'https://demo.campay.net/api/collect/', $headers, json_encode($body));
        $res = $client->sendAsync($request)->wait();


        if ($res->getStatusCode() == 200) {
            return $res->getBody();

            // [
            //     'status' => 'success',
            //     'message' => 'valid the transaction',

            // ];
        }



        return $res->getBody();
    }
}
