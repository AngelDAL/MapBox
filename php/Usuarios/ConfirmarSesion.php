<?php
require_once("../Conexion.php");

$Token = $_POST['Token'];
$User = $_POST['User'];
$DataJson = "";

$Consulta = "SELECT CASE WHEN Password = '$Token' and Username = '$User' THEN 'Si' ELSE 'NO' END Sesion FROM clientes";
if ($resultado = $mysqli->query($Consulta)) {
    while ($fila = $resultado->fetch_assoc()) {
        if ($fila['Sesion'] == 'Si') {
            $Verificacion = true;
        } else {
            $Verificacion = false;
        }
    }
    $resultado->close();
}

session_start();
$VerificacionSesion = $_SESSION['VerificacionSesion'];
if ($VerificacionSesion == "Taxista") {
    $Verificacion = true;
}
$_SESSION['Verificacion'] = $Verificacion;

echo ($Verificacion);
