<?php
require_once("../Conexion.php");

if ($resultado = $mysqli->query("SELECT * FROM Clientes")) {

    while ($fila = $resultado->fetch_assoc()) {
       echo($fila["Nombre"]." ".$fila["Celular"]);
    }
    $resultado->close();
}
