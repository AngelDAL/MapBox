<?php
require_once("../Conexion.php");
$PosibleUserName = $_POST['UserName'];

if ($resultado = $mysqli->query("SELECT count(*)Cantidad FROM Clientes WHERE Username = '$PosibleUserName'")) {

    while ($row = $resultado->fetch_assoc()) {
        if ($row["Cantidad"] == 0) {
            echo "true";
        }else{
            echo "false";
        }
    }
    $resultado->close();
}
