-- Schema base para proyecto MapBox (MySQL/MariaDB)
-- Este archivo define tablas e SPs usados por los endpoints PHP actuales.

CREATE DATABASE IF NOT EXISTS proyectotaxis
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE proyectotaxis;

-- =========================================================
-- TABLAS
-- =========================================================

DROP TABLE IF EXISTS clientes;
CREATE TABLE clientes (
  Id_Cliente INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(80) NOT NULL,
  Apellido_Paterno VARCHAR(80) NOT NULL,
  Apellido_Materno VARCHAR(80) NOT NULL,
  Celular VARCHAR(10) NOT NULL,
  Correo VARCHAR(120) NOT NULL,
  Username VARCHAR(50) NOT NULL,
  Password CHAR(40) NOT NULL,
  Verificacion VARCHAR(16) NOT NULL DEFAULT '0',
  PRIMARY KEY (Id_Cliente),
  UNIQUE KEY uq_clientes_username (Username),
  UNIQUE KEY uq_clientes_correo (Correo),
  KEY idx_clientes_username_password (Username, Password),
  KEY idx_clientes_correo_password (Correo, Password),
  KEY idx_clientes_verificacion (Verificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS taxistas;
CREATE TABLE taxistas (
  Id_Taxista INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(80) NOT NULL,
  Apellido_Paterno VARCHAR(80) NOT NULL,
  Apellido_Materno VARCHAR(80) NOT NULL,
  Correo VARCHAR(120) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  PRIMARY KEY (Id_Taxista),
  UNIQUE KEY uq_taxistas_correo (Correo),
  KEY idx_taxistas_correo_password (Correo, Password)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =========================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =========================================================

DROP PROCEDURE IF EXISTS sp_registrar_cliente;
DROP PROCEDURE IF EXISTS sp_validar_username;
DROP PROCEDURE IF EXISTS sp_confirmar_cuenta;
DROP PROCEDURE IF EXISTS sp_confirmar_sesion_cliente;
DROP PROCEDURE IF EXISTS sp_login_cliente;
DROP PROCEDURE IF EXISTS sp_login_taxista;
DROP PROCEDURE IF EXISTS sp_usuarios_data;

DELIMITER $$

-- Registra cliente con token de verificacion.
CREATE PROCEDURE sp_registrar_cliente(
  IN p_nombre VARCHAR(80),
  IN p_apellido_paterno VARCHAR(80),
  IN p_apellido_materno VARCHAR(80),
  IN p_celular VARCHAR(10),
  IN p_correo VARCHAR(120),
  IN p_username VARCHAR(50),
  IN p_password_hash CHAR(40),
  IN p_verificacion VARCHAR(16)
)
BEGIN
  INSERT INTO clientes (
    Nombre,
    Apellido_Paterno,
    Apellido_Materno,
    Celular,
    Correo,
    Username,
    Password,
    Verificacion
  ) VALUES (
    p_nombre,
    p_apellido_paterno,
    p_apellido_materno,
    p_celular,
    p_correo,
    p_username,
    p_password_hash,
    p_verificacion
  );
END $$

-- Verifica disponibilidad de username (0 disponible, >0 ocupado).
CREATE PROCEDURE sp_validar_username(
  IN p_username VARCHAR(50)
)
BEGIN
  SELECT COUNT(*) AS Cantidad
  FROM clientes
  WHERE Username = p_username;
END $$

-- Confirma cuenta por username y token. Devuelve filas_afectadas.
CREATE PROCEDURE sp_confirmar_cuenta(
  IN p_username VARCHAR(50),
  IN p_verificacion VARCHAR(16)
)
BEGIN
  UPDATE clientes
  SET Verificacion = '0'
  WHERE Username = p_username
    AND Verificacion = p_verificacion;

  SELECT ROW_COUNT() AS filas_afectadas;
END $$

-- Valida token de sesion para cliente (true/false como 1/0).
CREATE PROCEDURE sp_confirmar_sesion_cliente(
  IN p_username VARCHAR(50),
  IN p_password_hash CHAR(40)
)
BEGIN
  SELECT
    CASE WHEN EXISTS (
      SELECT 1
      FROM clientes
      WHERE Username = p_username
        AND Password = p_password_hash
    ) THEN 1 ELSE 0 END AS SesionValida;
END $$

-- Login cliente por username o correo + password hash.
CREATE PROCEDURE sp_login_cliente(
  IN p_usuario_o_correo VARCHAR(120),
  IN p_password_hash CHAR(40)
)
BEGIN
  SELECT
    Id_Cliente,
    Username,
    Correo,
    Nombre,
    Apellido_Paterno,
    Apellido_Materno
  FROM clientes
  WHERE (Username = p_usuario_o_correo OR Correo = p_usuario_o_correo)
    AND Password = p_password_hash
  LIMIT 1;
END $$

-- Login taxista por correo + password (texto plano en implementacion actual).
CREATE PROCEDURE sp_login_taxista(
  IN p_correo VARCHAR(120),
  IN p_password VARCHAR(255)
)
BEGIN
  SELECT
    Id_Taxista,
    Nombre,
    Apellido_Paterno,
    Apellido_Materno,
    Correo
  FROM taxistas
  WHERE Correo = p_correo
    AND Password = p_password
  LIMIT 1;
END $$

-- Equivalente a UsuariosData.php
CREATE PROCEDURE sp_usuarios_data()
BEGIN
  SELECT *
  FROM clientes;
END $$

DELIMITER ;

-- =========================================================
-- DATOS MINIMOS DE EJEMPLO (OPCIONAL)
-- Descomenta si necesitas probar login de taxista rapido.
-- =========================================================
-- INSERT INTO taxistas (Nombre, Apellido_Paterno, Apellido_Materno, Correo, Password)
-- VALUES ('Demo', 'Taxista', 'Uno', 'taxista@demo.com', '123456');
