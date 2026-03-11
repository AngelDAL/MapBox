<?php
require_once("../Conexion.php");
require_once('../PHPMailer-master/PHPMailerAutoload.php');

$smtpFromAddress = getenv('SMTP_FROM_ADDRESS') ?: '';
$smtpFromName = getenv('SMTP_FROM_NAME') ?: 'Sistema automatico de Taxis';
$smtpHost = getenv('SMTP_HOST') ?: 'smtp.office365.com';
$smtpPort = getenv('SMTP_PORT') ?: '587';
$smtpUser = getenv('SMTP_USERNAME') ?: '';
$smtpPass = getenv('SMTP_PASSWORD') ?: '';

$Nombre = utf8_decode($_POST['Nombre']);
$ApellidoP = utf8_decode($_POST['ApellidoP']);
$ApellidoM = utf8_decode($_POST['ApellidoM']);
$Correo = $_POST['Correo'];
$Celular = $_POST['Celular'];
$NombreDeUsuario = $_POST['UserName'];
$Contraseña = $_POST['Contraseña'];
$Contraseña = $Contraseña."uwu";
$Contraseña = hash('ripemd160', $Contraseña);
$Verificacion = rand(1, 99999);

$mysqli->query("INSERT INTO Clientes (Nombre, Apellido_Paterno, Apellido_Materno, Celular, Correo, Username, Password, Verificacion) VALUES ('$Nombre', '$ApellidoP', '$ApellidoM', '$Celular', '$Correo', '$NombreDeUsuario', '$Contraseña', '$Verificacion')") or die($mysqli->error);


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
$Mail->Subject = utf8_decode('Confirmación de correo electrónico ✉');    // Asunto del mensaje
$Mail->Body = utf8_decode("<h2>Hola, $Nombre !</h2> <hr> <p> Confirme su correo electrónico, para hacerlo de clic en el siguiente ")." <a href='http://localhost/Mapbox/php/Usuarios/ConfirmarCuenta.php?UserName=$NombreDeUsuario&Verificacion=$Verificacion'>enlace</a> </p>";
$Mail->addAddress($Correo);



//send the message, check for errors
if (!$Mail->send()) {
    echo "¡Ups! Ocurrio un error al enviar e-mail: " . $Mail->ErrorInfo;
} else {
    echo "Confirmación enviada por correo";
}
