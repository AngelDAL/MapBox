<?php
require_once("../Conexion.php");

$Username = $_POST['usuario'];
$Contraseña = $_POST['contraseña'];

$SaveUser = $Username;
$SaveContraseña = $Contraseña;
$Contraseña = $Contraseña . "uwu";
$Contraseña = hash('ripemd160', $Contraseña);
$Verificacion = "";
$UserToken = hash('ripemd160', $Username);
$NombreUsuario = "";
$Id_Cliente = "";

session_start();
$_SESSION['usuario'] = $Username;
$_SESSION['contraseña'] = $Contraseña;
$_SESSION['VerificacionSesion'] = "";


$Consulta = "SELECT CASE WHEN (Username = '$Username' or Correo = '$Username') AND Password = '$Contraseña' THEN 'Si' ELSE 'NO' END Sesion, Username, Id_Cliente FROM clientes";
if ($resultado = $mysqli->query($Consulta)) {
    while ($fila = $resultado->fetch_assoc()) {
        if ($fila['Sesion'] == 'Si') {
            $Verificacion = "Cliente";
            $_SESSION['VerificacionSesion'] = $Verificacion;
            $NombreUsuario = $fila['Username'];
            $Id_Cliente = $fila['Id_Cliente'];
        }
    }
    $resultado->close();
}

if ($Verificacion == "") {
    $Consulta2 = "SELECT CASE WHEN ( Correo = '$Username') AND Password = '$SaveContraseña' THEN 'Si' ELSE 'NO' END Sesion, Nombre, Apellido_Paterno, Apellido_Materno, Id_Taxista FROM taxistas";
    if ($resultado2 = $mysqli->query($Consulta2)) {
        while ($fila2 = $resultado2->fetch_assoc()) {
            if ($fila2['Sesion'] == 'Si') {
                $Verificacion = "Taxista";
                $_SESSION['VerificacionSesion'] = $Verificacion;
                $NombreUsuario = $fila2['Nombre'] . " " . $fila2['Apellido_Paterno'] ;
                $Id_Cliente = $fila2['Id_Taxista'];
            }
        }
        $resultado2->close();
    }
}
$UserToken = strrev($UserToken);

echo ($Verificacion . "|" . $Contraseña . "|" . utf8_encode($NombreUsuario));
