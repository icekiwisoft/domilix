<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpParser\Node\Stmt\TryCatch;
use Twilio\Rest\Client;


class TwilioService
{

    protected $client;

    public function __construct()
    {

        $sid = getenv('TWILIO_ACCOUNT_SID'); // ou mettez directement votre SID
        $token = getenv('TWILIO_AUTH_TOKEN');
        try {
            $this->client = new Client($sid, $token);
        } catch (\Throwable $th) {
            Log::error("enable to create the twillo client ");
        }
    }

    public function sendSms($to, $message)
    {

        $this->client->messages->create(
            $to, // to
            [
                "from" => "+19318072505",
                "body" => $message,
            ]
        );
    }
}
