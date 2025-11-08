<!DOCTYPE html>
<html>
<head>
    <title>Domilix Newsletter Subscription Confirmation</title>
</head>
<body>
    <h1>Confirm Your Subscription</h1>
    <p>Hello,</p>
    <p>You have subscribed to our newsletter with the email: {{ $mail->email }}.</p>
    <p>Please click the link below to confirm your subscription:</p>
    <a href="{{ $verification_url }}">Confirm Subscription</a>
    <p>Best regards,<br>Domilix</p>
</body>
</html>
