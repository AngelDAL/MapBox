<?php
require_once('../Env.php');
loadEnv(__DIR__ . '/../../.env');

require_once('../PHPMailer-master/PHPMailerAutoload.php');

$smtpFromAddress = getenv('SMTP_FROM_ADDRESS') ?: '';
$smtpFromName = getenv('SMTP_FROM_NAME') ?: 'Sistema automatico de Taxis';
$smtpHost = getenv('SMTP_HOST') ?: 'smtp.office365.com';
$smtpPort = getenv('SMTP_PORT') ?: '587';
$smtpUser = getenv('SMTP_USERNAME') ?: '';
$smtpPass = getenv('SMTP_PASSWORD') ?: '';
$smtpDemoTo = getenv('SMTP_DEMO_TO') ?: 'angelcona98@gmail.com';

$Mail = new PHPMailer();
$Mail->isSMTP();
$Mail->setFrom($smtpFromAddress, utf8_decode($smtpFromName), true);
$Mail->SMTPAuth = true;
$Mail->SMTPSecure = 'STARTTLS';
$Mail->Host = $smtpHost;
$Mail->Port = $smtpPort;
$Mail->isHTML();
$Mail->Username = $smtpUser;
$Mail->Password = $smtpPass;
$Mail->Subject = utf8_decode('Confirmación de correo electrónico');	// Asunto del mensaje
$Mail->Body = utf8_decode("Confirme su correo electrónico ")."";
$Mail->addAddress($smtpDemoTo);



//send the message, check for errors
if (!$Mail->send()) {
    echo "¡Ups! Ocurrio un error al enviar e-mail: " . $Mail->ErrorInfo;
} else {
    echo "Confirmación enviada por correo";
}
