<?php
// ObtenerPeso.php - Obtiene el peso del usuario autenticado

header('Content-Type: application/json; charset=utf-8');

session_start();

// Validar que el usuario esté autenticado
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

// Incluir configuración y conexión
require_once '../Conexion.php';

try {
    $usuario_id = $_SESSION['usuario_id'];
    
    // Consultar el peso del usuario en la base de datos
    // Ajusta el nombre de la tabla y columna según tu schema
    $sql = "SELECT peso FROM usuarios WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(['peso' => $row['peso']]);
    } else {
        echo json_encode(['peso' => null, 'error' => 'Usuario no encontrado']);
    }
    
    $stmt->close();
    $conexion->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
