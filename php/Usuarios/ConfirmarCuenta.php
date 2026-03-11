<?php
require_once("../Conexion.php");

$Username = $_GET['UserName'];
$Verificacion = $_GET['Verificacion'];

$Existe = false;
if ($resultado = $mysqli->query("SELECT * FROM Clientes WHERE Username = '$Username' AND Verificacion = '$Verificacion'")) {

    while ($fila = $resultado->fetch_assoc()) {
        $Existe = true;
    }
    $resultado->close();
}
if($Existe == true){
    $resultado2 = $mysqli->query("UPDATE Clientes SET Verificacion = '0' WHERE Username = '$Username'") or die($mysqli->error);
    echo("Su cuenta ha sido verificada correctamente! inicie sesion <a href='IniciarSesion.html'> ".utf8_decode("aquí")." </a> para continuar ");
}else{
    echo("No se ha podido verificar su cuenta!");
}
